import React from 'react';
import { Calendar, Clock, Layers, BarChart3, Users, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, members, currentMemberId, setCurrentMemberId, attendanceLookup, onResetSeed, onOpenClockModal }) {
  const currentMember = members.find(m => m.id === currentMemberId) || members[0];

  return (
    <header className="glass-panel" style={{ borderRadius: '0 0 20px 20px', borderTop: 'none', padding: '16px 28px', marginBottom: '24px', background: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
          }}>
            <Layers size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
              TaskPulse <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', background: '#e0e7ff', padding: '2px 8px', borderRadius: '12px', border: '1px solid #c7d2fe', verticalAlign: 'middle' }}>Daily Log & Data</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Task Logging & Attendance System</p>
          </div>
        </div>

        {/* Member Switcher & Attendance Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Attendance Status Badge */}
          <div 
            onClick={onOpenClockModal}
            className="glass-card" 
            style={{ 
              padding: '8px 14px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              borderColor: attendanceLookup?.found ? '#a7f3d0' : '#fde68a',
              background: attendanceLookup?.found ? '#f0fdf4' : '#fffbeb'
            }}
            title="Click to log or update Login/Logout Attendance"
          >
            {attendanceLookup?.found ? (
              <>
                <CheckCircle2 size={18} color="#059669" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 800 }}>ATTENDANCE LOGGED</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                    {attendanceLookup.total_hours} hrs <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 500 }}>({attendanceLookup.login_time} - {attendanceLookup.logout_time})</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={18} color="#d97706" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 800 }}>ATTENDANCE BLANK</div>
                  <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>Log Login/Logout first</div>
                </div>
              </>
            )}
          </div>

          {/* Member Selection Dropdown */}
          <div className="input-group" style={{ width: '240px' }}>
            <select 
              className="select-field" 
              value={currentMemberId} 
              onChange={(e) => setCurrentMemberId(e.target.value)}
              style={{ fontWeight: 700, borderColor: currentMember?.avatar_color || 'var(--accent-indigo)', background: '#ffffff', color: '#0f172a' }}
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  👤 {m.name} {m.role.includes('TL') ? '(TL ⭐)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Demo Seed Data */}
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={onResetSeed}
            title="Reset demo seed data"
          >
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '8px', marginTop: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
        <button 
          className={`btn ${activeTab === 'task-log' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('task-log')}
          style={{ borderRadius: '10px 10px 0 0' }}
        >
          <Calendar size={16} />
          <span>Daily Task Log</span>
        </button>

        <button 
          className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('attendance')}
          style={{ borderRadius: '10px 10px 0 0' }}
        >
          <Clock size={16} />
          <span>Attendance Log</span>
        </button>

        <button 
          className={`btn ${activeTab === 'daily-data' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('daily-data')}
          style={{ borderRadius: '10px 10px 0 0' }}
        >
          <BarChart3 size={16} />
          <span>Daily Data & Analytics</span>
        </button>

        <button 
          className={`btn ${activeTab === 'team' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('team')}
          style={{ borderRadius: '10px 10px 0 0' }}
        >
          <Users size={16} />
          <span>Team & Projects ({members.length})</span>
        </button>
      </nav>
    </header>
  );
}
