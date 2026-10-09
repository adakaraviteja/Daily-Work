import React, { useState } from 'react';
import { BarChart3, Download, Layers, Clock, TrendingUp, CheckCircle, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

export function DailyDataAnalyticsTab({ tasks, attendanceList, members, projects, overviewData }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('ALL');
  const [filterMember, setFilterMember] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter tasks across all dates
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = !searchQuery || 
      t.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.task_description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = filterProject === 'ALL' || t.project_name === filterProject;
    const matchesMember = filterMember === 'ALL' || t.member_id === filterMember;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesStart = !startDate || t.date >= startDate;
    const matchesEnd = !endDate || t.date <= endDate;

    return matchesSearch && matchesProject && matchesMember && matchesStatus && matchesStart && matchesEnd;
  });

  const totalTaskHours = filteredTasks.reduce((sum, t) => sum + (parseFloat(t.hours_spent) || 0), 0);
  const totalAttendanceHours = attendanceList.reduce((sum, a) => sum + (parseFloat(a.total_hours) || 0), 0);
  const completedCount = filteredTasks.filter(t => t.status === 'Completed').length;
  const completionRate = filteredTasks.length > 0 ? Math.round((completedCount / filteredTasks.length) * 100) : 0;

  // Chart 1: Hours by Project
  const projectChartDataMap = {};
  filteredTasks.forEach(t => {
    projectChartDataMap[t.project_name] = (projectChartDataMap[t.project_name] || 0) + (parseFloat(t.hours_spent) || 0);
  });
  const projectChartData = Object.keys(projectChartDataMap).map(name => ({
    name,
    hours: Math.round(projectChartDataMap[name] * 10) / 10
  }));

  // Chart 2: Status Breakdown
  const statusCountsMap = {};
  filteredTasks.forEach(t => {
    statusCountsMap[t.status] = (statusCountsMap[t.status] || 0) + 1;
  });
  const statusChartData = [
    { name: 'Completed', value: statusCountsMap['Completed'] || 0, color: '#059669' },
    { name: 'In Progress', value: statusCountsMap['In Progress'] || 0, color: '#4f46e5' },
    { name: 'Under Review', value: statusCountsMap['Under Review'] || 0, color: '#d97706' },
    { name: 'Blocked', value: statusCountsMap['Blocked'] || 0, color: '#e11d48' }
  ].filter(d => d.value > 0);

  // CSV Export
  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Member Name', 'Member Email', 'Project', 'Task Title', 'Category', 'Priority', 'Status', 'Hours Spent', 'Attendance Total Hours'];
    const rows = filteredTasks.map(t => {
      const m = members.find(mem => mem.id === t.member_id);
      const att = attendanceList.find(a => a.member_id === t.member_id && a.date === t.date);
      return [
        t.id,
        t.date,
        `"${m?.name || ''}"`,
        `"${m?.email || ''}"`,
        `"${t.project_name}"`,
        `"${t.task_title.replace(/"/g, '""')}"`,
        t.category,
        t.priority,
        t.status,
        t.hours_spent,
        att ? att.total_hours : 'BLANK'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daily_Data_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export
  const exportToJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredTasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Daily_Log_Data_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const BAR_COLORS = ['#4f46e5', '#7c3aed', '#db2777', '#059669', '#d97706', '#0891b2'];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-card" style={{ background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Total Task Rows</span>
            <Layers size={20} color="var(--accent-indigo)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{filteredTasks.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Log entries recorded</div>
        </div>

        <div className="glass-card" style={{ background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Task Hours Logged</span>
            <Clock size={20} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4f46e5' }}>{totalTaskHours.toFixed(1)} hrs</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Sum of individual tasks</div>
        </div>

        <div className="glass-card" style={{ background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Attendance Total Hours</span>
            <CheckCircle size={20} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>{totalAttendanceHours.toFixed(1)} hrs</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Auto-filled from Login/Logout</div>
        </div>

        <div className="glass-card" style={{ background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Completion Rate</span>
            <TrendingUp size={20} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0891b2' }}>{completionRate}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{completedCount} of {filteredTasks.length} tasks completed</div>
        </div>

      </div>

      {/* Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Hours per Project Bar Chart */}
        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--accent-indigo)" />
            Task Hours by Project
          </h3>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {projectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieIcon size={18} color="var(--accent-purple)" />
            Task Status Breakdown
          </h3>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={statusChartData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend formatter={(value) => <span style={{ color: '#334155', fontSize: '0.85rem', fontWeight: 600 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Master Data Grid */}
      <div className="glass-panel" style={{ padding: '20px', background: '#ffffff' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Daily Data Log Master Database</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Comprehensive grid showing all logged task rows with auto-filled attendance total hours
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={exportToCSV}>
              <Download size={14} /> Export CSV
            </button>
            <button className="btn btn-secondary btn-sm" onClick={exportToJSON}>
              <Download size={14} /> Export JSON
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <input 
            type="text"
            className="input-field"
            placeholder="🔍 Search title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select className="select-field" value={filterMember} onChange={(e) => setFilterMember(e.target.value)}>
            <option value="ALL">All Team Members</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <select className="select-field" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>

          <select className="select-field" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Blocked">Blocked</option>
          </select>

          <input 
            type="date"
            className="input-field"
            title="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input 
            type="date"
            className="input-field"
            title="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Data Grid Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Team Member</th>
                <th>Project</th>
                <th>Task Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Task Hours</th>
                <th style={{ textAlign: 'right' }}>Attendance Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No matching task logs found for selected filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(t => {
                  const m = members.find(mem => mem.id === t.member_id);
                  const att = attendanceList.find(a => a.member_id === t.member_id && a.date === t.date);
                  return (
                    <tr key={t.id}>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                        {t.date}
                      </td>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>
                        👤 {m?.name || 'Unknown'} {m?.role.includes('TL') ? '(TL)' : ''}
                      </td>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>
                        {t.project_name}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.task_title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.task_description}</div>
                      </td>
                      <td>
                        <span className="badge badge-indigo">{t.category}</span>
                      </td>
                      <td>
                        {t.priority === 'Urgent' ? <span className="badge badge-rose">Urgent</span> : <span className="badge badge-gray">{t.priority}</span>}
                      </td>
                      <td>
                        {t.status === 'Completed' ? <span className="badge badge-emerald">Completed</span> : <span className="badge badge-amber">{t.status}</span>}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#4f46e5' }}>
                        {t.hours_spent} hrs
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {att ? (
                          <span style={{ fontWeight: 800, color: '#059669' }}>{att.total_hours} hrs</span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem', fontWeight: 600 }}>BLANK</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
