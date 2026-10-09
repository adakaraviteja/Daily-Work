import React from 'react';
import { Clock, Calendar, CheckCircle2, Trash2, UserCheck } from 'lucide-react';

export function AttendanceLogTab({ 
  attendanceList, 
  members, 
  currentMemberId, 
  selectedDate, 
  onSaveAttendance, 
  onDeleteAttendance, 
  onOpenAttendanceModal 
}) {
  const currentMember = members.find(m => m.id === currentMemberId);
  const todayAttendance = attendanceList.find(a => a.member_id === currentMemberId && a.date === selectedDate);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Quick Clock-In / Clock-Out Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
            }}>
              <UserCheck size={28} color="#ffffff" />
            </div>

            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
                Attendance Logger & Timesheet
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                {currentMember?.name}'s Attendance Log {currentMember?.role.includes('TL') ? '(TL ⭐)' : ''}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Log your Login and Logout times to calculate Total Hours. This auto-fills into your Daily Task Log!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-success" onClick={onOpenAttendanceModal}>
              <Clock size={18} />
              <span>Log Login / Logout Time</span>
            </button>
          </div>

        </div>
      </div>

      {/* Selected Date Status Card */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar size={20} color="var(--accent-indigo)" />
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Attendance Status for {selectedDate}:</span>
        </div>

        {todayAttendance ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span className="badge badge-emerald">✅ Present</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Login: <strong style={{ color: '#0f172a' }}>{todayAttendance.login_time}</strong> | Logout: <strong style={{ color: '#0f172a' }}>{todayAttendance.logout_time}</strong> (Break: {todayAttendance.break_hours}h)
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '4px 12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              Total: {todayAttendance.total_hours} hrs
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-amber">⚠️ Not Logged Yet</span>
            <span style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>
              Attendance Total Hours will show as BLANK on your task log until logged.
            </span>
            <button className="btn btn-primary btn-sm" onClick={onOpenAttendanceModal}>
              + Log for {selectedDate}
            </button>
          </div>
        )}
      </div>

      {/* Attendance History Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', background: '#ffffff' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--accent-indigo)" />
            Attendance History Records
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Total Records: {attendanceList.length}
          </span>
        </div>

        {attendanceList.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No attendance records found. Click "Log Login / Logout Time" above to add your first record!
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Team Member</th>
                  <th>Login Time</th>
                  <th>Logout Time</th>
                  <th>Break Hours</th>
                  <th>Total Worked Hours</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.map((rec) => {
                  const memberObj = members.find(m => m.id === rec.member_id);
                  return (
                    <tr key={rec.id}>
                      <td style={{ fontWeight: 800, color: 'var(--accent-indigo)', fontFamily: 'JetBrains Mono, monospace' }}>
                        📅 {rec.date}
                      </td>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>
                        👤 {memberObj?.name || 'Unknown'} {memberObj?.role.includes('TL') ? '(TL)' : ''}
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#059669', fontWeight: 700 }}>
                        {rec.login_time}
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#e11d48', fontWeight: 700 }}>
                        {rec.logout_time}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {rec.break_hours} hrs
                      </td>
                      <td style={{ fontWeight: 800, color: '#4f46e5', fontSize: '1rem' }}>
                        {rec.total_hours} hrs
                      </td>
                      <td>
                        {rec.status === 'Present' && <span className="badge badge-emerald">Present</span>}
                        {rec.status === 'Work From Home' && <span className="badge badge-indigo">WFH</span>}
                        {rec.status === 'Half Day' && <span className="badge badge-amber">Half Day</span>}
                        {rec.status === 'Leave' && <span className="badge badge-rose">Leave</span>}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {rec.notes || '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => onDeleteAttendance(rec.id)}
                          title="Delete Attendance Record"
                          style={{ padding: '4px 8px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
