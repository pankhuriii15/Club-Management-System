import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showError('Reset token is missing from the link. Please request a new one.');
      return;
    }
    if (password.length < 6) {
      showWarning('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      showWarning('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      if (res.data.success) {
        showSuccess(res.data.message || 'Password reset successful!');
        navigate('/login');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reset password. Please request a new link.';
      showError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px'
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '440px',
    padding: '40px 30px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 20px 40px rgba(15, 48, 87, 0.25)',
    background: 'var(--panel-bg)',
    backdropFilter: 'blur(12px)',
    textAlign: 'center'
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    fontWeight: 650,
    color: 'var(--text-secondary)',
    marginBottom: '8px'
  };

  return (
    <div style={containerStyle}>
      <div className="glass-panel" style={cardStyle}>
        <h2 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          New Password
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '30px' }}>
          Please choose a strong, secure new password for your Medicaps account.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
          <div>
            <label style={labelStyle}><Lock size={14} /> New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="glass-input"
                style={{ paddingRight: '42px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}><Lock size={14} /> Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="glass-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '12px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #0f3057 0%, #8c1d40 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '10px'
            }}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
