import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, Edit3, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, Layers, Tag } from 'lucide-react';

export function DailyTaskLogTab({ 
  selectedDate, 
  setSelectedDate, 
  members, 
  currentMemberId, 
  tasks, 
  projects, 
  attendanceLookup, 
  onOpenTaskModal, 
  onEditTask, 
  onDeleteTask, 
  onOpenAttendanceModal,
  loading 
}) {
  const [filterProject, setFilterProject] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const currentMember = members.find(m => m.id === currentMemberId);

  // Quick date navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Filter tasks for the selected date & member
  const filteredTasks = tasks.filter(t => {
    const matchesDate = t.date === selectedDate;
    const matchesMember = t.member_id === currentMemberId;
    const matchesProject = filterProject === 'ALL' || t.project_name === filterProject;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch = !searchQuery || 
      t.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.task_description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDate && matchesMember && matchesProject && matchesStatus && matchesSearch;
  });

  const totalTaskHoursLogged = filteredTasks.reduce((sum, t) => sum + (parseFloat(t.hours_spent) || 0), 0);
  const attendanceTotalHours = attendanceLookup?.found ? attendanceLookup.total_hours : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Date Navigation & Actions */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button className="btn btn-secondary btn-sm" onClick={handlePrevDay} title="Previous Day">
                <ChevronLeft size={16} />
              </button>
              
              <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="var(--accent-indigo)" />
                <input 
                  type="date" 
                  className="input-field" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ width: '160px', fontWeight: 800, color: '#0f172a' }}
                />
              </div>

              <button className="btn btn-secondary btn-sm" onClick={handleNextDay} title="Next Day">
                <ChevronRight size={16} />
              </button>
              
              <button className="btn btn-secondary btn-sm" onClick={handleToday}>
                Today
              </button>
            </div>
            
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
              Daily Task Log for <strong style={{ color: '#0f172a' }}>{currentMember?.name}</strong> {currentMember?.role.includes('TL') ? '(TL ⭐)' : ''} on <strong style={{ color: 'var(--accent-indigo)' }}>{selectedDate}</strong>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => onOpenTaskModal()}>
            <Plus size={18} />
            <span>Log New Task Row</span>
          </button>
        </div>
      </div>

      {/* Attendance Integration Banner */}
      <div className="glass-panel" style={{ 
        padding: '20px', 
        background: attendanceLookup?.found ? '#f0fdf4' : '#fffbeb',
        borderColor: attendanceLookup?.found ? '#a7f3d0' : '#fde68a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: attendanceLookup?.found ? '#d1fae5' : '#fef3c7',
              border: `1px solid ${attendanceLookup?.found ? '#a7f3d0' : '#fde68a'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={24} color={attendanceLookup?.found ? '#059669' : '#d97706'} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Attendance Log Status for {selectedDate}
                </h3>
                {attendanceLookup?.found ? (
                  <span className="badge badge-emerald">
                    <CheckCircle2 size={12} /> Auto-Filled
                  </span>
                ) : (
                  <span className="badge badge-amber">
                    <AlertTriangle size={12} /> Stays Blank
                  </span>
                )}
              </div>
              
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {attendanceLookup?.found ? (
                  <span>
                    Login/Logout recorded: <strong style={{ color: '#0f172a' }}>{attendanceLookup.login_time}</strong> to <strong style={{ color: '#0f172a' }}>{attendanceLookup.logout_time}</strong> ({attendanceLookup.break_hours}h break).
                  </span>
                ) : (
                  <span style={{ color: '#b45309', fontWeight: 600 }}>
                    Log your Login/Logout time in Attendance Log first, or the Attendance Hours on task rows stay blank.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Stats Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Attendance Total Hours
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: attendanceLookup?.found ? '#059669' : '#94a3b8' }}>
                {attendanceLookup?.found ? `${attendanceTotalHours} hrs` : 'BLANK'}
              </div>
            </div>

            <div style={{ height: '36px', width: '1px', background: 'var(--border-color)' }} />

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Task Hours Logged
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4f46e5' }}>
                {totalTaskHoursLogged.toFixed(1)} hrs
              </div>
            </div>

            {!attendanceLookup?.found && (
              <button className="btn btn-secondary btn-sm" onClick={onOpenAttendanceModal} style={{ borderColor: '#fde68a', background: '#ffffff', color: '#92400e' }}>
                Log Attendance Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="🔍 Search tasks, description, project..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: '300px' }}
          />

          <select className="select-field" value={filterProject} onChange={(e) => setFilterProject(e.target.value)} style={{ width: '180px' }}>
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>

          <select className="select-field" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '160px' }}>
            <option value="ALL">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing <strong>{filteredTasks.length}</strong> task row{filteredTasks.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Task Rows Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading daily tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e0e7ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Layers size={30} color="var(--accent-indigo)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>No Tasks Logged for {selectedDate}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 20px' }}>
              Log individual task rows for your work completed today. Log one row per task.
            </p>
            <button className="btn btn-primary" onClick={() => onOpenTaskModal()}>
              <Plus size={16} /> Log First Task Row
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Project Name</th>
                  <th>Task Title & Details</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Task Hours Spent</th>
                  <th style={{ textAlign: 'right' }}>Attendance Total</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id}>
                    
                    {/* Date */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                        <Calendar size={14} />
                        {task.date}
                      </div>
                    </td>

                    {/* Project Name */}
                    <td style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {task.project_name}
                    </td>

                    {/* Task Title & Description */}
                    <td style={{ maxWidth: '340px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.93rem', marginBottom: '3px' }}>
                        {task.task_title}
                      </div>
                      {task.task_description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          {task.task_description}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td>
                      <span className="badge badge-indigo">
                        <Tag size={10} /> {task.category}
                      </span>
                    </td>

                    {/* Priority */}
                    <td>
                      {task.priority === 'Urgent' && <span className="badge badge-rose">Urgent</span>}
                      {task.priority === 'High' && <span className="badge badge-amber">High</span>}
                      {task.priority === 'Medium' && <span className="badge badge-cyan">Medium</span>}
                      {task.priority === 'Low' && <span className="badge badge-gray">Low</span>}
                    </td>

                    {/* Status */}
                    <td>
                      {task.status === 'Completed' && <span className="badge badge-emerald">✓ Completed</span>}
                      {task.status === 'In Progress' && <span className="badge badge-indigo">⏳ In Progress</span>}
                      {task.status === 'Under Review' && <span className="badge badge-amber">🔍 Under Review</span>}
                      {task.status === 'Blocked' && <span className="badge badge-rose">🚫 Blocked</span>}
                    </td>

                    {/* Task Hours Spent */}
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#4f46e5', fontSize: '0.95rem' }}>
                      {task.hours_spent} hrs
                    </td>

                    {/* Attendance Total Hours */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {attendanceTotalHours !== null ? (
                        <span style={{ fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '4px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                          {attendanceTotalHours} hrs
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', fontWeight: 600 }}>
                          BLANK
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => onEditTask(task)}
                          title="Edit Task Row"
                          style={{ padding: '4px 8px' }}
                        >
                          <Edit3 size={14} />
                        </button>

                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => onDeleteTask(task.id)}
                          title="Delete Task Row"
                          style={{ padding: '4px 8px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary Bar */}
        {filteredTasks.length > 0 && (
          <div style={{ 
            padding: '16px 24px', 
            background: '#f8fafc', 
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.88rem',
            color: 'var(--text-secondary)'
          }}>
            <div>
              Total Task Rows: <strong style={{ color: '#0f172a' }}>{filteredTasks.length}</strong>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                Task Hours Logged: <strong style={{ color: '#4f46e5', fontSize: '1rem' }}>{totalTaskHoursLogged.toFixed(1)} hrs</strong>
              </div>
              <div>
                Attendance Hours: <strong style={{ color: attendanceTotalHours ? '#059669' : '#94a3b8', fontSize: '1rem' }}>
                  {attendanceTotalHours ? `${attendanceTotalHours} hrs` : 'BLANK'}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
