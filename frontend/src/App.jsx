import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { DailyTaskLogTab } from './components/DailyTaskLogTab';
import { AttendanceLogTab } from './components/AttendanceLogTab';
import { DailyDataAnalyticsTab } from './components/DailyDataAnalyticsTab';
import { TeamProjectsTab } from './components/TeamProjectsTab';
import { TaskModal } from './components/TaskModal';
import { AttendanceModal } from './components/AttendanceModal';

export function App() {
  const [activeTab, setActiveTab] = useState('task-log');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [currentMemberId, setCurrentMemberId] = useState('m-tl');

  // Data states
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceLookup, setAttendanceLookup] = useState({ found: false });
  const [overviewData, setOverviewData] = useState(null);

  const [loading, setLoading] = useState(true);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial Data Fetching
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [mRes, pRes, tRes, aRes, oRes] = await Promise.all([
        api.getMembers(),
        api.getProjects(),
        api.getTasks(),
        api.getAttendance(),
        api.getOverview()
      ]);

      setMembers(mRes);
      setProjects(pRes);
      setTasks(tRes);
      setAttendanceList(aRes);
      setOverviewData(oRes);

      if (mRes.length > 0) {
        // Set default to Nagendra (TL) if present, or first member
        const tlMember = mRes.find(m => m.id === 'm-tl' || m.role.includes('TL'));
        setCurrentMemberId(tlMember ? tlMember.id : mRes[0].id);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
      showToast('Failed to connect to backend server. Make sure backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const refreshAttendanceLookup = async () => {
    if (!currentMemberId || !selectedDate) return;
    try {
      const res = await api.lookupAttendance(currentMemberId, selectedDate);
      setAttendanceLookup(res);
    } catch (err) {
      setAttendanceLookup({ found: false });
    }
  };

  useEffect(() => {
    refreshAttendanceLookup();
  }, [currentMemberId, selectedDate, attendanceList]);

  // Task Handlers
  const handleOpenTaskModal = (task = null) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        await api.updateTask(taskData.id, taskData);
        showToast('Task row updated successfully!');
      } else {
        await api.addTask(taskData);
        showToast('New task row logged successfully!');
      }
      setIsTaskModalOpen(false);
      setTaskToEdit(null);

      const updatedTasks = await api.getTasks();
      setTasks(updatedTasks);
    } catch (err) {
      showToast('Error saving task row: ' + err.message, 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task row?')) return;
    try {
      await api.deleteTask(id);
      showToast('Task row deleted');
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      showToast('Error deleting task: ' + err.message, 'error');
    }
  };

  // Attendance Handlers
  const handleSaveAttendance = async (attData) => {
    try {
      await api.saveAttendance(attData);
      showToast(`Attendance saved! Total Hours: ${attData.total_hours || 8.0} hrs`);
      setIsAttendanceModalOpen(false);
      
      const updatedAttendance = await api.getAttendance();
      setAttendanceList(updatedAttendance);
      refreshAttendanceLookup();
    } catch (err) {
      showToast('Error saving attendance: ' + err.message, 'error');
    }
  };

  const handleDeleteAttendance = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    try {
      await api.deleteAttendance(id);
      showToast('Attendance record deleted');
      setAttendanceList(attendanceList.filter(a => a.id !== id));
      refreshAttendanceLookup();
    } catch (err) {
      showToast('Error deleting attendance: ' + err.message, 'error');
    }
  };

  const handleAddMember = async (m) => {
    try {
      const newM = await api.addMember(m);
      setMembers([...members, newM]);
      showToast(`Added new team member: ${newM.name}`);
    } catch (err) {
      showToast('Error adding member: ' + err.message, 'error');
    }
  };

  const handleAddProject = async (p) => {
    try {
      const newP = await api.addProject(p);
      setProjects([...projects, newP]);
      showToast(`Added new project: ${newP.name}`);
    } catch (err) {
      showToast('Error adding project: ' + err.message, 'error');
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset all task logs and attendance records to demo seed data?')) return;
    try {
      await api.resetSeed();
      showToast('Reset data to initial sample seed state');
      fetchAllData();
    } catch (err) {
      showToast('Reset failed: ' + err.message, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
      
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        members={members}
        currentMemberId={currentMemberId}
        setCurrentMemberId={setCurrentMemberId}
        attendanceLookup={attendanceLookup}
        onResetSeed={handleResetSeed}
        onOpenClockModal={() => setIsAttendanceModalOpen(true)}
      />

      {/* Main Tab Content */}
      <main>
        {activeTab === 'task-log' && (
          <DailyTaskLogTab 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            members={members}
            currentMemberId={currentMemberId}
            tasks={tasks}
            projects={projects}
            attendanceLookup={attendanceLookup}
            onOpenTaskModal={handleOpenTaskModal}
            onEditTask={(task) => handleOpenTaskModal(task)}
            onDeleteTask={handleDeleteTask}
            onOpenAttendanceModal={() => setIsAttendanceModalOpen(true)}
            loading={loading}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceLogTab 
            attendanceList={attendanceList}
            members={members}
            currentMemberId={currentMemberId}
            selectedDate={selectedDate}
            onSaveAttendance={handleSaveAttendance}
            onDeleteAttendance={handleDeleteAttendance}
            onOpenAttendanceModal={() => setIsAttendanceModalOpen(true)}
          />
        )}

        {activeTab === 'daily-data' && (
          <DailyDataAnalyticsTab 
            tasks={tasks}
            attendanceList={attendanceList}
            members={members}
            projects={projects}
            overviewData={overviewData}
          />
        )}

        {activeTab === 'team' && (
          <TeamProjectsTab 
            members={members}
            projects={projects}
            onAddMember={handleAddMember}
            onAddProject={handleAddProject}
          />
        )}
      </main>

      {/* Modals */}
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        selectedDate={selectedDate}
        currentMemberId={currentMemberId}
        members={members}
        projects={projects}
      />

      <AttendanceModal 
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onSave={handleSaveAttendance}
        selectedDate={selectedDate}
        currentMemberId={currentMemberId}
        members={members}
      />

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
          fontWeight: 800,
          fontSize: '0.9rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.message}
        </div>
      )}

    </div>
  );
}

export default App;
