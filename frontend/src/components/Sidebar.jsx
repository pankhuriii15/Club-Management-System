import React from 'react';
import { 
  Users, Calendar, Heart, FileText, CreditCard, 
  User, LayoutDashboard, Settings, Mail, Shield, BarChart2
} from 'lucide-react';

const Sidebar = ({ user, activeTab, setActiveTab }) => {
  // Define sidebar menu options based on role
  const getMenuItems = () => {
    const role = user?.role || 'student';
    const isClubAdmin = role === 'admin' && user?.clubId;

    if (role === 'admin' && !isClubAdmin) { // Super Admin
      return [
        { key: 'analytics', label: 'Analytics Board', icon: <BarChart2 size={18} /> },
        { key: 'manage-clubs', label: 'Manage Clubs', icon: <Settings size={18} /> },
        { key: 'manage-users', label: 'Manage Users', icon: <Users size={18} /> },
        { key: 'all-registrations', label: 'All Registrations', icon: <FileText size={18} /> },
        { key: 'profile', label: 'My Profile', icon: <User size={18} /> }
      ];
    } else if (role === 'coordinator' || isClubAdmin) { // Club Coordinator / Club Admin
      return [
        { key: 'club-details', label: 'Club Details', icon: <Settings size={18} /> },
        { key: 'manage-events', label: 'Manage Events', icon: <Calendar size={18} /> },
        { key: 'manage-registrations', label: 'Club Applications', icon: <FileText size={18} /> },
        { key: 'manage-event-registrations', label: 'Event Applications', icon: <FileText size={18} /> },
        { key: 'manage-members', label: 'Members', icon: <Users size={18} /> },
        { key: 'profile', label: 'My Profile', icon: <User size={18} /> }
      ];
    } else { // Student
      return [
        { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
        { key: 'recommendations', label: 'Recommended Clubs', icon: <Users size={18} /> },
        { key: 'my-clubs', label: 'My Clubs', icon: <Users size={18} /> },
        { key: 'registered-events', label: 'My Events', icon: <Calendar size={18} /> },
        { key: 'profile', label: 'My Profile', icon: <User size={18} /> }
      ];
    }
  };

  const menuItems = getMenuItems();
  const role = user?.role || 'student';
  const isClubAdmin = role === 'admin' && user?.clubId;
  const panelTitle = isClubAdmin ? 'Club Admin' : role;

  return (
    <aside 
      className="glass-panel"
      style={{
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        height: '100%',
        minHeight: '400px'
      }}
    >
      <div style={{ padding: '0 8px 12px 8px', borderBottom: '1px solid rgba(15, 48, 87, 0.08)', marginBottom: '8px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
          Workspace
        </p>
        <p style={{ fontSize: '1.05rem', fontWeight: 700, textTransform: 'capitalize', color: '#8c1d40' }}>
          {panelTitle} panel
        </p>
      </div>

      {menuItems.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: isActive ? 600 : 500,
              width: '100%',
              textAlign: 'left',
              background: isActive ? 'rgba(15, 48, 87, 0.05)' : 'transparent',
              color: isActive ? '#0f3057' : 'var(--text-secondary)',
              boxShadow: isActive ? '0 4px 12px rgba(15, 48, 87, 0.03)' : 'none',
              borderLeft: isActive ? '3px solid #8c1d40' : '3px solid transparent',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.target.style.background = 'rgba(15, 48, 87, 0.03)';
                e.target.style.color = '#0f3057';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--text-secondary)';
              }
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
};

export default Sidebar;
