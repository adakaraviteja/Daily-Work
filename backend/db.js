import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

const initialMembers = [
  { id: 'm-tl', name: 'Nagendra', email: 'nagendra@company.com', role: 'Team Lead (TL)', department: 'Engineering', avatar_color: '#4f46e5' },
  { id: 'm1', name: 'Uppuluri Satya Narayana', email: 'satyanarayana.u@company.com', role: 'Backend Developer', department: 'Engineering', avatar_color: '#0284c7' },
  { id: 'm2', name: 'Vadapalli Nahum', email: 'nahum.v@company.com', role: 'Backend Developer', department: 'Engineering', avatar_color: '#16a34a' },
  { id: 'm3', name: 'VIjay Ram Maddukuri', email: 'vijayram.m@company.com', role: 'Frontend Developer', department: 'Engineering', avatar_color: '#d97706' },
  { id: 'm4', name: 'Adaka Raviteja', email: 'raviteja.a@company.com', role: 'Backend Developer', department: 'Engineering', avatar_color: '#9333ea' },
  { id: 'm5', name: 'Vemula Jhansi', email: 'jhansi.v@company.com', role: 'Backend Developer', department: 'Engineering', avatar_color: '#db2777' },
  { id: 'm6', name: 'Deranagula Chandrakanth', email: 'chandrakanth.d@company.com', role: 'Backend Developer', department: 'Engineering', avatar_color: '#2563eb' },
  { id: 'm7', name: 'Satyadev.k', email: 'satyadev.k@company.com', role: 'Backend Developer', department: 'Engineering', avatar_color: '#0891b2' },
  { id: 'm8', name: 'Aluru Sai Durga Pranathi', email: 'pranathi.a@company.com', role: 'Frontend Developer', department: 'Engineering', avatar_color: '#ca8a04' },
  { id: 'm9', name: 'Dhanikela Brahmam', email: 'brahmam.d@company.com', role: 'Backend/Frontend Developer', department: 'Engineering', avatar_color: '#dc2626' },
  { id: 'm10', name: 'Aravelly Tharun', email: 'tharun.a@company.com', role: 'Backend/Frontend Developer', department: 'Engineering', avatar_color: '#475569' }
];

class Database {
  load() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      return { members: initialMembers, projects: [], attendance: [], tasks: [] };
    }
  }

  save(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  }

  getMembers() {
    return this.load().members || [];
  }

  addMember(member) {
    const db = this.load();
    const newMember = {
      id: 'm' + Date.now(),
      avatar_color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      ...member
    };
    db.members.push(newMember);
    this.save(db);
    return newMember;
  }

  getProjects() {
    return this.load().projects || [];
  }

  addProject(project) {
    const db = this.load();
    const newProj = {
      id: 'p' + Date.now(),
      ...project
    };
    db.projects.push(newProj);
    this.save(db);
    return newProj;
  }

  getAttendance(filters = {}) {
    let list = this.load().attendance || [];
    if (filters.member_id) list = list.filter(a => a.member_id === filters.member_id);
    if (filters.date) list = list.filter(a => a.date === filters.date);
    return list;
  }

  getAttendanceForMemberDate(member_id, date) {
    const list = this.getAttendance({ member_id, date });
    return list.length > 0 ? list[0] : null;
  }

  saveAttendance(record) {
    const db = this.load();
    let updatedRecord;
    
    const loginMinutes = this.timeToMinutes(record.login_time);
    const logoutMinutes = this.timeToMinutes(record.logout_time);
    let diffHours = 0;
    if (logoutMinutes > loginMinutes) {
      diffHours = (logoutMinutes - loginMinutes) / 60 - (parseFloat(record.break_hours) || 0);
      diffHours = Math.max(0, Math.round(diffHours * 100) / 100);
    }

    const index = db.attendance.findIndex(a => a.member_id === record.member_id && a.date === record.date);
    if (index !== -1) {
      updatedRecord = {
        ...db.attendance[index],
        ...record,
        total_hours: diffHours,
        updated_at: new Date().toISOString()
      };
      db.attendance[index] = updatedRecord;
    } else {
      updatedRecord = {
        id: 'att-' + Date.now(),
        ...record,
        total_hours: diffHours,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.attendance.push(updatedRecord);
    }
    this.save(db);
    return updatedRecord;
  }

  deleteAttendance(id) {
    const db = this.load();
    db.attendance = db.attendance.filter(a => a.id !== id);
    this.save(db);
    return true;
  }

  getTasks(filters = {}) {
    let list = this.load().tasks || [];
    if (filters.member_id) list = list.filter(t => t.member_id === filters.member_id);
    if (filters.date) list = list.filter(t => t.date === filters.date);
    if (filters.project_name) list = list.filter(t => t.project_name === filters.project_name);
    if (filters.status) list = list.filter(t => t.status === filters.status);
    if (filters.category) list = list.filter(t => t.category === filters.category);
    return list;
  }

  addTask(task) {
    const db = this.load();
    const newTask = {
      id: 'tsk-' + Date.now(),
      hours_spent: parseFloat(task.hours_spent) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...task
    };
    db.tasks.unshift(newTask);
    this.save(db);
    return newTask;
  }

  updateTask(id, updates) {
    const db = this.load();
    const index = db.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    if (updates.hours_spent) updates.hours_spent = parseFloat(updates.hours_spent);

    db.tasks[index] = {
      ...db.tasks[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save(db);
    return db.tasks[index];
  }

  deleteTask(id) {
    const db = this.load();
    db.tasks = db.tasks.filter(t => t.id !== id);
    this.save(db);
    return true;
  }

  getDailySummary(date, member_id) {
    const db = this.load();
    const members = db.members;
    const targetMembers = member_id ? members.filter(m => m.id === member_id) : members;

    return targetMembers.map(m => {
      const att = db.attendance.find(a => a.member_id === m.id && a.date === date);
      const memberTasks = db.tasks.filter(t => t.member_id === m.id && t.date === date);
      const task_hours = memberTasks.reduce((sum, t) => sum + (parseFloat(t.hours_spent) || 0), 0);
      const attendance_hours = att ? att.total_hours : null;

      return {
        member: m,
        date: date,
        attendance_logged: !!att,
        attendance_hours: attendance_hours,
        attendance_status: att ? att.status : 'Not Logged',
        login_time: att ? att.login_time : null,
        logout_time: att ? att.logout_time : null,
        tasks_count: memberTasks.length,
        task_hours_logged: Math.round(task_hours * 100) / 100,
        difference: attendance_hours !== null ? Math.round((attendance_hours - task_hours) * 100) / 100 : null,
        tasks: memberTasks
      };
    });
  }

  timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  resetSeed() {
    const seed = {
      members: initialMembers,
      projects: [
        { id: 'p1', name: 'Admin Portal & Dashboard', code: 'ADM-2026', client: 'Internal Platform' },
        { id: 'p2', name: 'Daily Work & Attendance System', code: 'DLY-809', client: 'Core Ops' }
      ],
      attendance: [],
      tasks: []
    };
    this.save(seed);
    return seed;
  }
}

export const db = new Database();
