import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Plus, Layers } from 'lucide-react';
import { api } from '../api';

export function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  taskToEdit, 
  selectedDate, 
  currentMemberId, 
  members, 
  projects 
}) {
  const [formData, setFormData] = useState({
    date: selectedDate || new Date().toISOString().split('T')[0],
    member_id: currentMemberId || (members[0]?.id || ''),
    project_name: projects[0]?.name || 'Admin Portal & Dashboard',
    task_title: '',
    task_description: '',
    category: 'Frontend',
    priority: 'Medium',
    status: 'Completed',
    hours_spent: '2.0'
  });

  const [attendanceInfo, setAttendanceInfo] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        id: taskToEdit.id,
        date: taskToEdit.date,
        member_id: taskToEdit.member_id,
        project_name: taskToEdit.project_name,
        task_title: taskToEdit.task_title,
        task_description: taskToEdit.task_description || '',
        category: taskToEdit.category || 'Frontend',
        priority: taskToEdit.priority || 'Medium',
        status: taskToEdit.status || 'Completed',
        hours_spent: taskToEdit.hours_spent ? String(taskToEdit.hours_spent) : '2.0'
      });
    } else {
      setFormData({
        date: selectedDate || new Date().toISOString().split('T')[0],
        member_id: currentMemberId || (members[0]?.id || ''),
        project_name: projects[0]?.name || 'Admin Portal & Dashboard',
        task_title: '',
        task_description: '',
        category: 'Frontend',
        priority: 'Medium',
        status: 'Completed',
        hours_spent: '2.0'
      });
    }
  }, [taskToEdit, selectedDate, currentMemberId, isOpen, members, projects]);

  useEffect(() => {
    if (isOpen && formData.date && formData.member_id) {
      setLoadingAttendance(true);
      api.lookupAttendance(formData.member_id, formData.date)
        .then(res => {
          setAttendanceInfo(res);
          setLoadingAttendance(false);
        })
        .catch(() => {
          setAttendanceInfo({ found: false });
          setLoadingAttendance(false);
        });
    }
  }, [formData.date, formData.member_id, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.task_title.trim() || !formData.project_name.trim()) return;

    onSave({
      ...formData,
      hours_spent: parseFloat(formData.hours_spent) || 0
    });
  };

  const selectedMemberObj = members.find(m => m.id === formData.member_id);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} color="var(--accent-indigo)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                {taskToEdit ? 'Edit Task Row' : 'Log New Task Row'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Each team member logs their own tasks here every working day (1 row per task)
              </p>
            </div>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ borderRadius: '50%', padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', background: '#ffffff' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            {/* Date Picker */}
            <div className="input-group">
              <label className="input-label">
                <Calendar size={14} color="var(--accent-indigo)" />
                Date Work Was Done *
              </label>
              <input 
                type="date" 
                className="input-field"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={{ fontWeight: 800, color: '#0f172a' }}
              />
            </div>

            {/* Team Member Selector */}
            <div className="input-group">
              <label className="input-label">👤 Team Member *</label>
              <select 
                className="select-field"
                required
                value={formData.member_id}
                onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                style={{ fontWeight: 700 }}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.role.includes('TL') ? '(TL)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendance Auto-Fill Info Box */}
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: '10px', 
            background: attendanceInfo?.found ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${attendanceInfo?.found ? '#a7f3d0' : '#fde68a'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color={attendanceInfo?.found ? '#059669' : '#d97706'} />
              <span style={{ color: '#0f172a', fontWeight: 600 }}>
                <strong>Attendance Total Hours for {selectedMemberObj?.name}:</strong>
              </span>
            </div>

            <div>
              {loadingAttendance ? (
                <span style={{ color: 'var(--text-muted)' }}>Checking attendance...</span>
              ) : attendanceInfo?.found ? (
                <span style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                  {attendanceInfo.total_hours} hrs <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>({attendanceInfo.login_time} - {attendanceInfo.logout_time})</span>
                </span>
              ) : (
                <span style={{ fontWeight: 800, color: '#b45309' }}>
                  BLANK (Log Login/Logout first)
                </span>
              )}
            </div>
          </div>

          {/* Project & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Project Name *</label>
              <input 
                type="text"
                className="input-field"
                placeholder="e.g. Admin Portal & Dashboard"
                required
                list="projects-list"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              />
              <datalist id="projects-list">
                {projects.map(p => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </div>

            <div className="input-group">
              <label className="input-label">Category / Module</label>
              <select 
                className="select-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Frontend">Frontend Development</option>
                <option value="Backend">Backend API</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Bug Fix">Bug Fix / Maintenance</option>
                <option value="Meeting & Sync">Meeting & Sync</option>
                <option value="Testing & QA">Testing & QA</option>
                <option value="DevOps">DevOps & Cloud</option>
                <option value="Documentation">Documentation</option>
              </select>
            </div>
          </div>

          {/* Task Title */}
          <div className="input-group">
            <label className="input-label">Task Title *</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="e.g. Updated Task Log styling to clean white theme"
              required
              value={formData.task_title}
              onChange={(e) => setFormData({ ...formData, task_title: e.target.value })}
            />
          </div>

          {/* Hours Spent, Priority, Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            
            <div className="input-group">
              <label className="input-label">⏱️ Hours Spent *</label>
              <input 
                type="number"
                step="0.25"
                min="0.1"
                max="24"
                className="input-field"
                required
                value={formData.hours_spent}
                onChange={(e) => setFormData({ ...formData, hours_spent: e.target.value })}
                style={{ fontWeight: 800, color: 'var(--accent-indigo)' }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Priority</label>
              <select 
                className="select-field"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent 🔥</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Status</label>
              <select 
                className="select-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="input-group">
            <label className="input-label">Task Details & Description</label>
            <textarea 
              className="textarea-field" 
              rows="3" 
              placeholder="Provide details or technical notes..."
              value={formData.task_description}
              onChange={(e) => setFormData({ ...formData, task_description: e.target.value })}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              <span>{taskToEdit ? 'Save Changes' : 'Save Task Row'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
