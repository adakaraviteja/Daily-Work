import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export function AttendanceModal({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedDate, 
  currentMemberId, 
  members 
}) {
  const [formData, setFormData] = useState({
    date: selectedDate || new Date().toISOString().split('T')[0],
    member_id: currentMemberId || (members[0]?.id || ''),
    login_time: '09:00',
    logout_time: '17:30',
    break_hours: '0.5',
    status: 'Present',
    notes: 'Office login'
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      date: selectedDate || new Date().toISOString().split('T')[0],
      member_id: currentMemberId || (members[0]?.id || '')
    }));
  }, [selectedDate, currentMemberId, isOpen, members]);

  if (!isOpen) return null;

  const calculateTotal = () => {
    const [h1, m1] = formData.login_time.split(':').map(Number);
    const [h2, m2] = formData.logout_time.split(':').map(Number);
    const min1 = h1 * 60 + m1;
    const min2 = h2 * 60 + m2;
    if (min2 <= min1) return 0;
    const diff = (min2 - min1) / 60 - (parseFloat(formData.break_hours) || 0);
    return Math.max(0, Math.round(diff * 100) / 100);
  };

  const previewTotalHours = calculateTotal();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      break_hours: parseFloat(formData.break_hours) || 0
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#059669" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Log Attendance (Login/Logout Time)</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                This record calculates total hours and populates into your Daily Task Log
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
            <div className="input-group">
              <label className="input-label">
                <Calendar size={14} color="var(--accent-indigo)" />
                Attendance Date *
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
                  <option key={m.id} value={m.id}>{m.name} {m.role.includes('TL') ? '(TL)' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Login & Logout Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">🟢 Login Time *</label>
              <input 
                type="time" 
                className="input-field"
                required
                value={formData.login_time}
                onChange={(e) => setFormData({ ...formData, login_time: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">🔴 Logout Time *</label>
              <input 
                type="time" 
                className="input-field"
                required
                value={formData.logout_time}
                onChange={(e) => setFormData({ ...formData, logout_time: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">☕ Break (Hours)</label>
              <input 
                type="number" 
                step="0.25"
                min="0"
                max="4"
                className="input-field"
                value={formData.break_hours}
                onChange={(e) => setFormData({ ...formData, break_hours: e.target.value })}
              />
            </div>
          </div>

          {/* Total Hours Preview Card */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
            border: '1px solid #c7d2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#3730a3', fontWeight: 800, textTransform: 'uppercase' }}>
                Calculated Total Attendance Hours
              </div>
              <div style={{ fontSize: '0.78rem', color: '#4338ca', marginTop: '2px', fontWeight: 600 }}>
                ({formData.login_time} to {formData.logout_time} minus {formData.break_hours}h break)
              </div>
            </div>

            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>
              {previewTotalHours} hrs
            </div>
          </div>

          {/* Status & Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Attendance Status</label>
              <select 
                className="select-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Present">Present (Office)</option>
                <option value="Work From Home">Work From Home (WFH)</option>
                <option value="Half Day">Half Day</option>
                <option value="Leave">On Leave</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Notes / Remarks</label>
              <input 
                type="text"
                className="input-field"
                placeholder="Optional notes e.g. Sprint review day"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              <CheckCircle2 size={16} />
              <span>Save Attendance Record</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
