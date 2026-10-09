import React, { useState } from 'react';
import { Users, Plus, Briefcase, Crown } from 'lucide-react';

export function TeamProjectsTab({ members, projects, onAddMember, onAddProject }) {
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Software Engineer', department: 'Engineering' });
  const [newProject, setNewProject] = useState({ name: '', code: '', client: '' });

  const handleMemberSubmit = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;
    onAddMember(newMember);
    setNewMember({ name: '', email: '', role: 'Software Engineer', department: 'Engineering' });
    setShowMemberForm(false);
  };

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    if (!newProject.name) return;
    onAddProject(newProject);
    setNewProject({ name: '', code: '', client: '' });
    setShowProjectForm(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      
      {/* Team Roster Panel */}
      <div className="glass-panel" style={{ padding: '24px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--accent-indigo)" />
              Team Roster ({members.length} Members)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered members who log daily tasks</p>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setShowMemberForm(!showMemberForm)}>
            <Plus size={14} /> Add Member
          </button>
        </div>

        {/* Add Member Form */}
        {showMemberForm && (
          <form onSubmit={handleMemberSubmit} className="glass-card" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc' }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="input-field" placeholder="e.g. Jordan Smith" required value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input type="email" className="input-field" placeholder="jordan@company.com" required value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="input-group">
                <label className="input-label">Role</label>
                <input type="text" className="input-field" placeholder="e.g. Software Engineer" value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Department</label>
                <input type="text" className="input-field" placeholder="e.g. Engineering" value={newMember.department} onChange={e => setNewMember({ ...newMember, department: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowMemberForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Save Team Member</button>
            </div>
          </form>
        )}

        {/* Member Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {members.map(m => {
            const isTL = m.role.includes('TL') || m.role.toLowerCase().includes('team lead');
            return (
              <div 
                key={m.id} 
                className="glass-card" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  background: isTL ? '#f5f3ff' : '#ffffff',
                  borderColor: isTL ? '#c7d2fe' : 'var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: m.avatar_color || '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: '#ffffff',
                    boxShadow: isTL ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
                  }}>
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {m.name}
                      {isTL && <Crown size={15} color="#4f46e5" fill="#4f46e5" title="Team Lead" />}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.email}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${isTL ? 'badge-indigo' : 'badge-gray'}`}>
                    {m.role}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>{m.department}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Projects Panel */}
      <div className="glass-panel" style={{ padding: '24px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} color="var(--accent-purple)" />
              Active Projects ({projects.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Projects available for task logging</p>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setShowProjectForm(!showProjectForm)}>
            <Plus size={14} /> Add Project
          </button>
        </div>

        {/* Add Project Form */}
        {showProjectForm && (
          <form onSubmit={handleProjectSubmit} className="glass-card" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc' }}>
            <div className="input-group">
              <label className="input-label">Project Name</label>
              <input type="text" className="input-field" placeholder="e.g. Customer Portal v3" required value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="input-group">
                <label className="input-label">Project Code</label>
                <input type="text" className="input-field" placeholder="e.g. PRJ-101" value={newProject.code} onChange={e => setNewProject({ ...newProject, code: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Client / Division</label>
                <input type="text" className="input-field" placeholder="e.g. Internal" value={newProject.client} onChange={e => setNewProject({ ...newProject, client: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowProjectForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Save Project</button>
            </div>
          </form>
        )}

        {/* Project List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {projects.map(p => (
            <div key={p.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Client: {p.client}</div>
              </div>
              <span className="badge badge-cyan">{p.code}</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
