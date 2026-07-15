import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, LayoutDashboard, Calendar, Users, Compass, ChevronDown } from 'lucide-react';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const { user, logout, updateProfileMock } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const isLandingPage = location.pathname === '/';

  // Local state for profile form
  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    semester: user?.semester || '',
    enrollment: user?.enrollment || ''
  });

  // Sync form when modal opens or user changes
  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name || '',
        phone: user.phone || '',
        department: user.department || '',
        semester: user.semester || '',
        enrollment: user.enrollment || ''
      });
    }
  }, [user, showEditModal]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  // Helper to check if link is active
  const isActive = (path) => location.pathname === path;

  const getNavLinkStyle = (path) => {
    const active = isActive(path);
    return {
      textDecoration: 'none',
      color: active ? '#0f3057' : '#475569',
      fontSize: '0.92rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: '12px',
      background: active ? 'rgba(15, 48, 87, 0.05)' : 'transparent',
      border: active ? '1px solid rgba(15, 48, 87, 0.12)' : '1px solid transparent',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  const getMobileLinkStyle = (path) => {
    const active = isActive(path);
    return {
      textDecoration: 'none',
      color: active ? '#0f3057' : '#475569',
      fontSize: '1rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 16px',
      borderRadius: '12px',
      background: active ? 'rgba(15, 48, 87, 0.05)' : 'transparent',
      border: active ? '1px solid rgba(15, 48, 87, 0.12)' : '1px solid rgba(0,0,0,0.05)',
      transition: 'all 0.2s'
    };
  };

  return (
    <nav 
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(15, 48, 87, 0.08)',
        padding: '6px 20px',
        height: '64px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Medicaps Logo Image */}
        <Link 
          to="/" 
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <img 
            src={`${logoImg}?v=2`} 
            alt="Medicaps University Logo" 
            style={{ 
              height: '42px', 
              width: 'auto', 
              objectFit: 'contain',
              maxWidth: '170px'
            }} 
          />
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-nav">
          {!isLandingPage && (!user || user.role === 'student') && <Link to="/clubs" style={getNavLinkStyle('/clubs')}><Users size={15} /> Clubs</Link>}
          
          {user ? (
            <>
              <Link to="/dashboard" style={getNavLinkStyle('/dashboard')}><LayoutDashboard size={15} /> Dashboard</Link>
              
              {/* Profile Icon Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: '12px', paddingLeft: '16px', borderLeft: '1px solid rgba(0,0,0,0.1)', position: 'relative' }}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {user.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt={user.name} 
                      style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid #0f3057', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(15, 48, 87, 0.08)', border: '2px solid #0f3057', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold', color: '#0f3057' }}>
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  <ChevronDown size={14} style={{ color: '#475569', transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                
                {showDropdown && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '48px',
                      right: 0,
                      width: '170px',
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid rgba(15, 48, 87, 0.1)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                      zIndex: 1001,
                      padding: '6px 0',
                      animation: 'fadeIn 0.15s ease-out'
                    }}
                  >
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowEditModal(true);
                      }}
                      style={dropdownItemStyle}
                      onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      Edit Profile
                    </button>
                    <div style={{ height: '1px', background: 'rgba(15, 48, 87, 0.06)', margin: '4px 0' }}></div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      style={{
                        ...dropdownItemStyle,
                        color: '#ef4444'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '8px 22px', fontSize: '0.88rem', borderRadius: '20px', marginLeft: '8px' }}>
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        {!user && isLandingPage ? (
          <Link to="/login" className="btn-primary mobile-only-signin" style={{ padding: '8px 22px', fontSize: '0.88rem', borderRadius: '20px' }}>
            Sign In
          </Link>
        ) : (
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            style={{
              background: 'none',
              border: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              padding: '6px'
            }}
            className="mobile-nav-toggle"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(15, 48, 87, 0.08)',
            padding: '16px 24px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeIn 0.25s ease-out'
          }}
          className="mobile-nav"
        >
          {!isLandingPage && (!user || user.role === 'student') && <Link to="/clubs" onClick={() => setIsOpen(false)} style={getMobileLinkStyle('/clubs')}><Users size={18} /> Explore Clubs</Link>}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} style={getMobileLinkStyle('/dashboard')}><LayoutDashboard size={18} /> User Dashboard</Link>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px' }}>
                  {user.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt={user.name} 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #0f3057', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(15, 48, 87, 0.08)', border: '2px solid #0f3057', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', color: '#0f3057' }}>
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{user.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#8c1d40', fontWeight: 600, textTransform: 'capitalize' }}>{user.role}</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    setShowEditModal(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    padding: '10px 12px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    borderRadius: '10px',
                    textAlign: 'left',
                    padding: '10px 12px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              onClick={() => setIsOpen(false)} 
              className="btn-primary" 
              style={{
                textAlign: 'center',
                justifyContent: 'center',
                margin: '8px 0 0 0'
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && createPortal(
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            overflowY: 'auto'
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid rgba(15, 48, 87, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(15, 48, 87, 0.25)',
              width: '100%',
              maxWidth: '460px',
              padding: '28px',
              animation: 'fadeIn 0.2s ease-out',
              margin: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'Outfit', color: '#0f172a', marginBottom: '4px', fontWeight: 800 }}>
              Edit Profile
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>
              Update your personal details below.
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                updateProfileMock(editFormData);
                setShowEditModal(false);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label style={modalLabelStyle}>Full Name</label>
                <input 
                  type="text" 
                  value={editFormData.name} 
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  style={modalInputStyle}
                  required
                />
              </div>

              <div>
                <label style={modalLabelStyle}>Enrollment ID</label>
                <input 
                  type="text" 
                  value={editFormData.enrollment} 
                  onChange={(e) => setEditFormData({ ...editFormData, enrollment: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              <div>
                <label style={modalLabelStyle}>Phone Number</label>
                <input 
                  type="text" 
                  value={editFormData.phone} 
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={modalLabelStyle}>Department</label>
                  <input 
                    type="text" 
                    value={editFormData.department} 
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    style={modalInputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={modalLabelStyle}>Semester</label>
                  <input 
                    type="text" 
                    value={editFormData.semester} 
                    onChange={(e) => setEditFormData({ ...editFormData, semester: e.target.value })}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    background: 'var(--button-gradient)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(15, 48, 87, 0.15)'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Media Queries */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-nav-toggle {
            display: none !important;
          }
          .mobile-nav {
            display: none !important;
          }
          .mobile-only-signin {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

const dropdownItemStyle = {
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  padding: '10px 16px',
  fontSize: '0.88rem',
  fontWeight: 600,
  color: '#475569',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'background 0.2s',
  fontFamily: 'Inter, sans-serif'
};

const modalLabelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '4px'
};

const modalInputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
  fontSize: '0.88rem',
  outline: 'none',
  fontFamily: 'Inter, sans-serif'
};

export default Navbar;
