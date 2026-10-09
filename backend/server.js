import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Members API
app.get('/api/members', (req, res) => {
  res.json(db.getMembers());
});

app.post('/api/members', (req, res) => {
  const { name, email, role, department } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const member = db.addMember({ name, email, role: role || 'Software Engineer', department: department || 'Engineering' });
  res.status(201).json(member);
});

// Projects API
app.get('/api/projects', (req, res) => {
  res.json(db.getProjects());
});

app.post('/api/projects', (req, res) => {
  const { name, code, client } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });
  const project = db.addProject({ name, code: code || 'PRJ-' + Math.floor(Math.random()*1000), client: client || 'Internal' });
  res.status(201).json(project);
});

// Attendance API
app.get('/api/attendance', (req, res) => {
  const { member_id, date } = req.query;
  const list = db.getAttendance({ member_id, date });
  res.json(list);
});

app.get('/api/attendance/lookup', (req, res) => {
  const { member_id, date } = req.query;
  if (!member_id || !date) {
    return res.status(400).json({ error: 'member_id and date are required parameters' });
  }

  const record = db.getAttendanceForMemberDate(member_id, date);
  if (!record) {
    return res.json({
      found: false,
      member_id,
      date,
      total_hours: null,
      message: 'No Attendance Log found for this person on this date. Log your Login/Logout time in Attendance Log first, or this stays blank.'
    });
  }

  res.json({
    found: true,
    member_id,
    date,
    total_hours: record.total_hours,
    login_time: record.login_time,
    logout_time: record.logout_time,
    break_hours: record.break_hours,
    status: record.status,
    notes: record.notes
  });
});

app.post('/api/attendance', (req, res) => {
  const { member_id, date, login_time, logout_time, break_hours, status, notes } = req.body;
  if (!member_id || !date || !login_time || !logout_time) {
    return res.status(400).json({ error: 'member_id, date, login_time, and logout_time are required' });
  }

  const record = db.saveAttendance({
    member_id,
    date,
    login_time,
    logout_time,
    break_hours: parseFloat(break_hours) || 0,
    status: status || 'Present',
    notes: notes || ''
  });

  res.json(record);
});

app.delete('/api/attendance/:id', (req, res) => {
  db.deleteAttendance(req.params.id);
  res.json({ success: true, message: 'Attendance record deleted' });
});

// Tasks API (Daily Task Log - 1 row per task)
app.get('/api/tasks', (req, res) => {
  const { member_id, date, project_name, status, category } = req.query;
  const list = db.getTasks({ member_id, date, project_name, status, category });

  const members = db.getMembers();
  const memberMap = Object.fromEntries(members.map(m => [m.id, m]));

  const enriched = list.map(t => {
    const att = db.getAttendanceForMemberDate(t.member_id, t.date);
    return {
      ...t,
      member: memberMap[t.member_id] || { name: 'Unknown Member' },
      attendance_total_hours: att ? att.total_hours : null
    };
  });

  res.json(enriched);
});

app.post('/api/tasks', (req, res) => {
  const { member_id, date, project_name, task_title, task_description, category, priority, status, hours_spent } = req.body;

  if (!member_id || !date || !project_name || !task_title) {
    return res.status(400).json({ error: 'member_id, date, project_name, and task_title are required' });
  }

  const att = db.getAttendanceForMemberDate(member_id, date);
  const attendance_total_hours = att ? att.total_hours : null;

  const newTask = db.addTask({
    member_id,
    date,
    project_name,
    task_title,
    task_description: task_description || '',
    category: category || 'General',
    priority: priority || 'Medium',
    status: status || 'Completed',
    hours_spent: parseFloat(hours_spent) || 0
  });

  res.status(201).json({
    ...newTask,
    attendance_total_hours
  });
});

app.put('/api/tasks/:id', (req, res) => {
  const updated = db.updateTask(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json(updated);
});

app.delete('/api/tasks/:id', (req, res) => {
  db.deleteTask(req.params.id);
  res.json({ success: true, message: 'Task deleted' });
});

// Analytics API
app.get('/api/analytics/daily-summary', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const member_id = req.query.member_id || null;
  const summary = db.getDailySummary(date, member_id);
  res.json({ date, summary });
});

app.get('/api/analytics/overview', (req, res) => {
  const tasks = db.getTasks({});
  const attendance = db.getAttendance({});
  const members = db.getMembers();
  const projects = db.getProjects();

  const totalTasks = tasks.length;
  const totalTaskHours = tasks.reduce((sum, t) => sum + (t.hours_spent || 0), 0);
  const totalAttendanceHours = attendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);

  const projectHours = {};
  tasks.forEach(t => {
    projectHours[t.project_name] = (projectHours[t.project_name] || 0) + (t.hours_spent || 0);
  });

  const statusCounts = {};
  tasks.forEach(t => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });

  res.json({
    total_members: members.length,
    total_projects: projects.length,
    total_tasks: totalTasks,
    total_task_hours: Math.round(totalTaskHours * 100) / 100,
    total_attendance_hours: Math.round(totalAttendanceHours * 100) / 100,
    project_hours: projectHours,
    status_counts: statusCounts
  });
});

app.post('/api/seed', (req, res) => {
  const data = db.resetSeed();
  res.json({ success: true, message: 'Database reset to sample seed data', data });
});

// Production: Serve React Frontend Static Build (For Render Single-Service Deployment)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Daily Log API server running on port ${PORT}`);
});
