import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, User, Phone, GraduationCap, ArrowRight, Layers, Eye, EyeOff, X } from 'lucide-react';
import api from '../services/api';
import loginIllustration from '../assets/login_illustration.png';
import './Login.css';

const Login = () => {
  const { login, register } = useAuth();
  const { showSuccess, showWarning, showError } = useToast();
  const navigate = useNavigate();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [clubs, setClubs] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    semester: '',
    enrollment: '',
    role: 'student',
    clubId: ''
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotPassword || !forgotConfirmPassword) {
      showWarning('Please fill in all fields.');
      return;
    }
    if (forgotPassword.length < 6) {
      showWarning('Password must be at least 6 characters long.');
      return;
    }
    const hasDigit = /\d/.test(forgotPassword);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(forgotPassword);
    if (!hasDigit || !hasSpecialChar) {
      showWarning('Password must contain at least one digit and one special character.');
      return;
    }
    if (forgotPassword !== forgotConfirmPassword) {
      showWarning('Passwords do not match.');
      return;
    }
    
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { 
        email: forgotEmail, 
        password: forgotPassword 
      });
      if (res.data.success) {
        showSuccess(res.data.message || 'Password updated successfully! You can now log in.');
        setForgotModalOpen(false);
        setForgotEmail('');
        setForgotPassword('');
        setForgotConfirmPassword('');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update password. Please try again.';
      showError(errMsg);
    } finally {
      setForgotLoading(false);
    }
  };

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await api.get('/clubs');
        if (res.data.success) {
          setClubs(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching clubs:', err);
      }
    };
    fetchClubs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, password, name, enrollment } = formData;
    
    // Core check
    if (!email || !password) {
      showWarning('Please fill in email and password fields.');
      return false;
    }

    if (!isLoginTab) {
      if (password.length < 6) {
        showWarning('Password must be at least 6 characters long.');
        return false;
      }

      const hasDigit = /\d/.test(password);
      const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
      if (!hasDigit || !hasSpecialChar) {
        showWarning('Password must contain at least one digit and one special character.');
        return false;
      }

      if (!name) {
        showWarning('Please enter your full name.');
        return false;
      }
      if (!enrollment) {
        showWarning('Student enrollment ID is required.');
        return false;
      }
      if (!formData.phone) {
        showWarning('Phone number is required.');
        return false;
      }
      const digitsOnly = formData.phone.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        showWarning('Phone number must have at least 10 digits.');
        return false;
      }
      if (!email.toLowerCase().endsWith('@medicaps.ac.in')) {
        showWarning('Students must register with a @medicaps.ac.in email address.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoadingSubmit(true);
    let result;
    
    if (isLoginTab) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData);
    }

    setLoadingSubmit(false);
    if (result && result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
      {/* Glow elements */}
      <div className="glow-bubble glow-bubble-1"></div>
      <div className="glow-bubble glow-bubble-2"></div>

      <div className="login-split-container animate-fade-in">
        
        {/* Left Column: Form */}
        <div className="login-form-column">
          
          {/* Logo Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--button-gradient)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem' }}>M</div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit', color: '#0f172a' }}>Medi-Caps University</span>
          </div>

          {/* Tab Header */}
          <div 
            style={{
              display: 'flex',
              borderRadius: '25px',
              background: 'rgba(15, 48, 87, 0.05)',
              padding: '4px',
              marginBottom: '24px'
            }}
          >
            <button
              onClick={() => setIsLoginTab(true)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '21px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                background: isLoginTab ? '#ffffff' : 'transparent',
                color: isLoginTab ? '#8c1d40' : 'rgba(15, 23, 42, 0.55)',
                transition: 'all 0.2s',
                boxShadow: isLoginTab ? '0 2px 8px rgba(15, 48, 87, 0.05)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLoginTab(false)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '21px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                background: !isLoginTab ? '#ffffff' : 'transparent',
                color: !isLoginTab ? '#8c1d40' : 'rgba(15, 23, 42, 0.55)',
                transition: 'all 0.2s',
                boxShadow: !isLoginTab ? '0 2px 8px rgba(15, 48, 87, 0.05)' : 'none'
              }}
            >
              Register
            </button>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.65rem', fontFamily: 'Outfit', color: '#0f172a', marginBottom: '6px', fontWeight: 800 }}>
              {isLoginTab ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              {isLoginTab ? 'Access your student dashboard and events calendar' : 'Sign up to register for clubs and campus activities'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* REGISTER EXTRA FIELDS */}
            {!isLoginTab && (
              <>
                <div>
                  <label style={labelStyle}><User size={14} /> Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rohan Sharma"
                    className="glass-input"
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}><GraduationCap size={14} /> Enrollment ID</label>
                  <input
                    type="text"
                    name="enrollment"
                    value={formData.enrollment}
                    onChange={handleChange}
                    placeholder="e.g. EN12345678"
                    className="glass-input"
                    required
                  />
                </div>
              </>
            )}

            {/* COMMON FIELDS */}
            <div>
              <label style={labelStyle}><Mail size={14} /> Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. student@medicaps.ac.in"
                className="glass-input"
                required
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ ...labelStyle, marginBottom: '6px' }}><Lock size={14} /> Password</label>
                {isLoginTab && (
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.78rem',
                      color: '#0f3057',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      marginBottom: '6px',
                      padding: 0
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
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
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* REGISTER DETAILS FIELDS */}
            {!isLoginTab && (
              <>
                <div>
                  <label style={labelStyle}><Phone size={14} /> Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 9999988888"
                    className="glass-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. CSE"
                      className="glass-input"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Semester</label>
                    <input
                      type="text"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      placeholder="e.g. 6th"
                      className="glass-input"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Mock Verification Widget */}
            <div 
              style={{
                border: '1px solid rgba(15, 48, 87, 0.08)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(15, 48, 87, 0.01)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                marginTop: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" checked readOnly style={{ width: '16px', height: '16px', accentColor: '#0f3057', cursor: 'pointer' }} />
                <span>Verifying you are human...</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 550 }}>Mock Secure</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loadingSubmit}
              style={{
                marginTop: '8px',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '0.95rem',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              {loadingSubmit ? (
                <span className="spinner-small"></span>
              ) : isLoginTab ? (
                <>Sign In <ArrowRight size={18} /></>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {isLoginTab && (
            <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid rgba(15, 48, 87, 0.08)', paddingTop: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Quick Test Credentials:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
              <button 
                  onClick={() => setFormData({ ...formData, email: 'pankhurichowbe1502@gmail.com', password: '7974906484' })}
                  style={testCredBtnStyle}
                >
                  Super Admin
                </button>
                <button 
                  onClick={() => setFormData({ ...formData, email: 'president.coding@medicaps.ac.in', password: 'password123' })}
                  style={testCredBtnStyle}
                >
                  Club President
                </button>
                <button 
                  onClick={() => setFormData({ ...formData, email: 'rohan.sharma@medicaps.ac.in', password: 'password123' })}
                  style={testCredBtnStyle}
                >
                  Student
                </button>
              </div>
            </div>
          )}

          {/* Footer links inside Left Column */}
          <div style={{ marginTop: '30px', borderTop: '1px solid rgba(15, 48, 87, 0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'center', gap: '14px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <a href="#terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms & conditions</a>
            <span>|</span>
            <a href="#faqs" style={{ color: 'inherit', textDecoration: 'none' }}>FAQs</a>
            <span>|</span>
            <a href="#contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact us</a>
          </div>
        </div>

        {/* Right Column: Illustration Panel */}
        <div className="login-illustration-column">
          <div style={{ zIndex: 10 }}>
            <h2 style={{ fontSize: '2.1rem', fontFamily: 'Outfit', fontWeight: 800, marginBottom: '8px' }}>
              {isLoginTab ? 'Welcome Back!!' : 'Join Us Today!!'}
            </h2>
            <p style={{ fontSize: '0.92rem', opacity: 0.85, marginBottom: '40px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
              {isLoginTab ? 'Login to continue access to your customized student dashboard and active event logs.' : 'Sign up today to explore various community clubs and coordinate campus life.'}
            </p>
            
            <img 
              src={`${loginIllustration}?v=2`} 
              alt="Students illustration" 
              style={{ width: '85%', maxWidth: '280px', height: 'auto', marginBottom: '40px', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.2))' }} 
            />

            <p style={{ fontSize: '0.85rem' }}>
              {isLoginTab ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLoginTab(!isLoginTab)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.85rem',
                  marginLeft: '4px'
                }}
              >
                {isLoginTab ? 'SIGN UP' : 'SIGN IN'}
              </button>
            </p>
          </div>
        </div>

      </div>

      {forgotModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{
            width: '90%',
            maxWidth: '440px',
            padding: '30px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 40px rgba(15, 48, 87, 0.25)',
            position: 'relative',
            background: 'var(--panel-bg)',
            backdropFilter: 'blur(12px)'
          }}>
            <button
              onClick={() => { 
                setForgotModalOpen(false); 
                setForgotEmail(''); 
                setForgotPassword('');
                setForgotConfirmPassword('');
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '8px', textAlign: 'left' }}>
              Reset Password Directly
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px', textAlign: 'left' }}>
              Enter your email address and your new password to update your password in the database directly.
            </p>

            <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <Mail size={14} /> Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. student@medicaps.ac.in"
                  className="glass-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <Lock size={14} /> New Password
                </label>
                <input
                  type="password"
                  value={forgotPassword}
                  onChange={(e) => setForgotPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="glass-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <Lock size={14} /> Confirm New Password
                </label>
                <input
                  type="password"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="glass-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => { 
                    setForgotModalOpen(false); 
                    setForgotEmail(''); 
                    setForgotPassword('');
                    setForgotConfirmPassword('');
                  }}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    background: 'linear-gradient(135deg, #0f3057 0%, #8c1d40 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Updating...' : 'Save Password'} <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Form label styling
const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.82rem',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '6px'
};

const testCredBtnStyle = {
  background: 'rgba(15, 48, 87, 0.04)',
  border: '1px solid rgba(15, 48, 87, 0.1)',
  borderRadius: '12px',
  color: '#0f3057',
  padding: '6px 12px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'background 0.2s, transform 0.1s'
};

export default Login;
