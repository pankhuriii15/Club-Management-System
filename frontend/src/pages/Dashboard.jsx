import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { 
  Users, Calendar, Heart, FileText, CreditCard, User, 
  Plus, Edit, Trash2, Check, X, Mail, Send, Award, DollarSign, BarChart2, Settings
} from 'lucide-react';

const Dashboard = () => {
  const { user, isStudent, isCoordinator, loading: authLoading } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.role === 'admin' && !user?.clubId;
  const isClubAdmin = user?.role === 'admin' && user?.clubId;
  const isStaffMember = isCoordinator || isClubAdmin;

  // Set default active tab depending on role on mount
  useEffect(() => {
    if (user) {
      if (isSuperAdmin) setActiveTab('analytics');
      else if (isStaffMember) setActiveTab('club-details');
      else setActiveTab('overview');
    } else if (!authLoading) {
      navigate('/login');
    }
  }, [user, authLoading, isSuperAdmin, isStaffMember, navigate]);

  // Render core layout dashboard loading fallback
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: '90vh', padding: '30px 24px', position: 'relative', overflow: 'hidden' }}>
      <div className="glow-bubble glow-bubble-1"></div>
      <div className="glow-bubble glow-bubble-2"></div>

      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px',
          position: 'relative',
          zIndex: 1
        }}
        className="dashboard-grid"
      >
        {/* Sidebar navigation column */}
        <div className="sidebar-col">
          <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Contents column viewport */}
        <div className="content-col glass-panel" style={{ padding: '28px', minHeight: '500px', minWidth: 0 }}>
          {/* STUDENT PAGES */}
          {isStudent && (
            <>
              {activeTab === 'overview' && <StudentOverview showSuccess={showSuccess} showError={showError} />}
              {activeTab === 'recommendations' && <StudentRecommendations showSuccess={showSuccess} />}
              {activeTab === 'my-clubs' && <StudentClubs showError={showError} />}
              {activeTab === 'registered-events' && <StudentRegisteredEvents showError={showError} />}
              {activeTab === 'profile' && <UserProfile user={user} />}
            </>
          )}

          {/* COORDINATOR / CLUB ADMIN PAGES */}
          {isStaffMember && (
            <>
              {activeTab === 'club-details' && <CoordinatorClubDetails showSuccess={showSuccess} showError={showError} />}
              {activeTab === 'manage-events' && <CoordinatorEvents showSuccess={showSuccess} showError={showError} />}
              {activeTab === 'manage-registrations' && <CoordinatorRegistrations type="club" showSuccess={showSuccess} showError={showError} />}
              {activeTab === 'manage-event-registrations' && <CoordinatorRegistrations type="event" showSuccess={showSuccess} showError={showError} />}
              {activeTab === 'manage-members' && <CoordinatorMembers showSuccess={showSuccess} showError={showError} />}
              {activeTab === 'profile' && <UserProfile user={user} />}
            </>
          )}

          {/* SUPER ADMIN PAGES */}
          {isSuperAdmin && (
            <>
              {activeTab === 'analytics' && <AdminAnalytics />}
              {activeTab === 'manage-clubs' && <AdminClubs showSuccess={showSuccess} showError={showError} showWarning={showWarning} />}
              {activeTab === 'manage-users' && <AdminUsers showSuccess={showSuccess} showError={showError} />}
              {activeTab === 'all-registrations' && <AdminRegistrations showSuccess={showSuccess} showError={showError} />}
              {activeTab === 'profile' && <UserProfile user={user} />}
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .dashboard-grid {
            grid-template-columns: 260px 1fr !important;
          }
          .sidebar-col {
            position: sticky;
            top: 24px;
            height: max-content;
            align-self: start;
          }
        }
      `}</style>
    </div>
  );
};

/* ==========================================================================
   COMMON COMPONENT: Profile Details Viewer
   ========================================================================== */
const UserProfile = ({ user }) => {
  return (
    <div>
      <h2 style={sectionTitleStyle}><User size={22} /> My Account Profile</h2>
      <p style={sectionSubtitleStyle}>View and verify your registered registration profiles</p>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center', marginTop: '24px' }}>
        <div style={{ position: 'relative' }}>
          {user.profilePhoto ? (
            <img 
              src={user.profilePhoto} 
              alt={user.name} 
              style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(15, 48, 87, 0.15)' }} 
            />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(15, 48, 87, 0.06)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
              {user.name[0].toUpperCase()}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '1.6rem', fontFamily: 'Outfit' }}>{user.name}</h3>
          <p style={{ color: '#8c1d40', fontWeight: 600, textTransform: 'capitalize', fontSize: '0.95rem' }}>
            Role: {user.role}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <strong>Email:</strong> <span>{user.email}</span>
            {user.phone && <><strong>Phone:</strong> <span>{user.phone}</span></>}
            {user.enrollment && <><strong>Enrollment ID:</strong> <span>{user.enrollment}</span></>}
            {user.department && <><strong>Department:</strong> <span>{user.department}</span></>}
            {user.semester && <><strong>Semester:</strong> <span>{user.semester}</span></>}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   STUDENT: Overview Dashboard
   ========================================================================== */
const StudentOverview = ({ showSuccess, showError }) => {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [eventFilter, setEventFilter] = useState('All');



  const fetchStudentOverviewData = async () => {
    try {
      const [eventsRes, clubsRes, regsRes] = await Promise.all([
        api.get('/events'),
        api.get('/clubs'),
        api.get('/registrations')
      ]);

      if (eventsRes.data.success) setEvents(eventsRes.data.data);
      if (clubsRes.data.success) setClubs(clubsRes.data.data);
      if (regsRes.data.success) setRegistrations(regsRes.data.data);
    } catch (err) {
      showError('Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentOverviewData();
  }, []);

  const handleRegisterEvent = async (e, eventToReg) => {
    e.stopPropagation(); // Avoid triggering card click
    setSubmitting(true);
    try {
      const res = await api.post('/registerEvent', { eventId: eventToReg._id });
      if (res.data.success) {
        showSuccess(`Successfully registered for ${eventToReg.title}!`);
        fetchStudentOverviewData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Event registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyClubTrigger = async (e, clubId) => {
    e.stopPropagation();
    const targetClub = clubs.find(c => c._id === clubId);
    if (!targetClub) return;
    
    // Check if already registered
    const existing = registrations.find(r => r.clubId?._id === clubId);
    if (existing) {
      showError(`You already have a status of "${existing.status}" for this club.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/registerClub', { 
        clubId: targetClub._id,
        applicationDetails: {
          reason: 'Apply to Join Request',
          skills: 'N/A'
        }
      });
      if (res.data.success) {
        showSuccess(`Application to join ${targetClub.name} submitted successfully!`);
        setSelectedEvent(null); // Close event details modal too if open
        fetchStudentOverviewData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Club application failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner-small"></div></div>;

  const now = new Date();
  
  // Calculate dynamic counts for each category
  const countAll = events.length;
  const countPast = events.filter(evt => new Date(evt.date) < now && new Date(evt.date).toDateString() !== now.toDateString()).length;
  const countUpcoming = events.filter(evt => new Date(evt.date) > now && new Date(evt.date).toDateString() !== now.toDateString()).length;
  const countActive = events.filter(evt => new Date(evt.date).toDateString() === now.toDateString()).length;

  const filteredEvents = events.filter(evt => {
    if (eventFilter === 'All') return true;
    const eventDate = new Date(evt.date);
    if (eventFilter === 'Past') {
      return eventDate < now && eventDate.toDateString() !== now.toDateString();
    }
    if (eventFilter === 'Upcoming') {
      return eventDate > now && eventDate.toDateString() !== now.toDateString();
    }
    if (eventFilter === 'Active') {
      return eventDate.toDateString() === now.toDateString();
    }
    return true;
  });

  return (
    <div>
      <h2 style={sectionTitleStyle}><User size={22} /> Student Hub</h2>
      <p style={sectionSubtitleStyle}>Discover campus activities, register for events, and apply to student clubs</p>

      {/* Main Grid: All Available Events */}
      <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '16px', marginTop: '12px' }}>
        📢 Available Campus Events
      </h3>

      {/* Event Filter Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px', marginTop: '16px' }}>
        {[
          { key: 'All', label: `All (${countAll})` },
          { key: 'Past', label: `Past (${countPast})` },
          { key: 'Upcoming', label: `Upcoming (${countUpcoming})` },
          { key: 'Active', label: `Active (${countActive})` }
        ].map((item) => {
          const isSelected = eventFilter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setEventFilter(item.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: isSelected ? '1px solid transparent' : '1px solid rgba(15, 48, 87, 0.15)',
                background: isSelected ? 'var(--button-gradient)' : 'rgba(255,255,255,0.06)',
                color: isSelected ? '#ffffff' : 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 4px 12px rgba(15, 48, 87, 0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {filteredEvents.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(15,48,87,0.02)', borderRadius: '12px', border: '1px dashed rgba(15,48,87,0.15)', marginBottom: '40px' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No events found for the selected category.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {filteredEvents.map(evt => {
            const isRegistered = registrations.some(r => r.eventId?._id === evt._id && r.status === 'Registered');
            const isUpcoming = new Date(evt.date) >= now;
            
            return (
              <div 
                key={evt._id} 
                className="glass-card" 
                onClick={() => setSelectedEvent(evt)}
                style={{ 
                  cursor: 'pointer', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  height: '380px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ height: '140px', background: 'rgba(15,48,87,0.05)', position: 'relative' }}>
                  {evt.bannerImage ? (
                    <img src={evt.bannerImage} alt={evt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)', color: 'rgba(255,255,255,0.5)' }}>
                      EduEvent
                    </div>
                  )}
                  <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: isUpcoming ? '#2ecc71' : 'rgba(15,48,87,0.15)', color: isUpcoming ? '#fff' : 'var(--text-primary)', fontWeight: 600 }}>
                    {isUpcoming ? 'Upcoming' : 'Past'}
                  </span>
                </div>

                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{evt.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Organized by: {evt.clubId?.name || 'Campus Club'}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '8px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {evt.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(15,48,87,0.08)', paddingTop: '12px', marginTop: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📅 {new Date(evt.date).toLocaleDateString()}
                    </span>
                    {isUpcoming && (
                      isRegistered ? (
                        <span style={{ fontSize: '0.75rem', color: '#2ecc71', fontWeight: 'bold' }}>✓ Registered</span>
                      ) : (
                        <button 
                          onClick={(e) => handleRegisterEvent(e, evt)} 
                          className="btn-primary" 
                          style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
                          disabled={submitting}
                        >
                          Register
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EVENT DETAIL OVERLAY MODAL */}
      {selectedEvent && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '550px', padding: '30px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', marginBottom: '12px', color: 'var(--text-primary)' }}>{selectedEvent.title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#8c1d40', fontWeight: 600, marginBottom: '16px' }}>Organized by: {selectedEvent.clubId?.name || 'Campus Club'}</p>

            <div style={{ background: 'rgba(15, 48, 87, 0.04)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>📅 <strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</div>
              <div>🕐 <strong>Time:</strong> {new Date(selectedEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div style={{ gridColumn: 'span 2' }}>📍 <strong>Venue:</strong> {selectedEvent.venue}</div>
            </div>

            <h4 style={{ fontSize: '1rem', fontFamily: 'Outfit', marginBottom: '6px', color: 'var(--text-primary)' }}>Description</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
              {selectedEvent.description}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(15, 48, 87, 0.08)', paddingTop: '16px' }}>
              {selectedEvent.clubId && (
                <button 
                  onClick={(e) => handleApplyClubTrigger(e, selectedEvent.clubId._id || selectedEvent.clubId)} 
                  className="btn-secondary" 
                  style={{ padding: '8px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#8c1d40', border: '1px solid rgba(140, 29, 64, 0.2)' }}
                >
                  <Users size={14} /> Join {selectedEvent.clubId?.name || 'Club'}
                </button>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedEvent(null)} 
                  className="btn-secondary" 
                  style={{ padding: '8px 18px', borderRadius: '8px' }}
                >
                  Close
                </button>
                {new Date(selectedEvent.date) >= now && !registrations.some(r => r.eventId?._id === selectedEvent._id && r.status === 'Registered') && (
                  <button 
                    onClick={(e) => handleRegisterEvent(e, selectedEvent)} 
                    className="btn-primary" 
                    style={{ padding: '8px 18px', borderRadius: '8px' }}
                    disabled={submitting}
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

const StudentRecommendations = ({ showSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [clubs, setClubs] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [clubsLoading, setClubsLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/clubs/categories');
        if (res.data.success) {
          setCategories(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedCategory(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch clubs when selectedCategory changes
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchClubs = async () => {
      setClubsLoading(true);
      try {
        const res = await api.get(`/clubs?category=${encodeURIComponent(selectedCategory)}`);
        if (res.data.success) {
          setClubs(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching clubs by category:', err);
      } finally {
        setClubsLoading(false);
      }
    };
    fetchClubs();
  }, [selectedCategory]);

  if (categoriesLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <div className="spinner-small"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={sectionTitleStyle}><Users size={22} /> Recommended Clubs</h2>
      <p style={sectionSubtitleStyle}>Browse student clubs by category and join them</p>

      {categories.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(15, 48, 87, 0.02)', borderRadius: '12px', marginTop: '20px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No club categories found.</p>
        </div>
      ) : (
        <>
          {/* Category browser chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px', marginTop: '16px' }}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: isSelected ? '1px solid transparent' : '1px solid rgba(15, 48, 87, 0.15)',
                    background: isSelected ? 'var(--button-gradient)' : 'rgba(255,255,255,0.06)',
                    color: isSelected ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 12px rgba(15, 48, 87, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Clubs list */}
          {clubsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div className="spinner-small"></div>
            </div>
          ) : clubs.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(15, 48, 87, 0.02)', borderRadius: '12px', border: '1px dashed rgba(15, 48, 87, 0.1)', marginTop: '20px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No clubs available in this category.</p>
            </div>
          ) : (
            <div className="grid-container" style={{ marginTop: '24px' }}>
              {clubs.map((club) => (
                <div key={club._id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      {club.logo ? (
                        <img src={club.logo} alt={club.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(15, 48, 87, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#0f3057' }}>{club.name[0]}</div>
                      )}
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{club.name}</h4>
                        <span style={{ fontSize: '0.7rem', padding: '1px 8px', borderRadius: '10px', background: 'rgba(15, 48, 87, 0.08)', color: 'var(--text-secondary)' }}>{club.category}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '16px' }}>
                      {club.description.length > 100 ? `${club.description.substring(0, 100)}...` : club.description}
                    </p>
                  </div>
                  <a href={`/clubs/${club._id}`} className="btn-secondary" style={{ padding: '8px', fontSize: '0.8rem', justifyContent: 'center', width: '100%', borderRadius: '8px' }}>
                    Join Club
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ==========================================================================
   STUDENT: Applied Clubs Tracker
   ========================================================================== */
const StudentClubs = ({ showError }) => {
  const [clubRegistrations, setClubRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClubRegistrations = async () => {
    try {
      const res = await api.get('/registrations?type=club');
      if (res.data.success) {
        setClubRegistrations(res.data.data);
      }
    } catch (err) {
      showError('Failed to fetch applied clubs list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubRegistrations();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner-small"></div></div>;

  return (
    <div>
      <h2 style={sectionTitleStyle}><Users size={22} /> My Clubs</h2>
      <p style={sectionSubtitleStyle}>Track the live review statuses of your club membership applications</p>

      {clubRegistrations.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(15, 48, 87, 0.02)', borderRadius: '12px', marginTop: '24px', border: '1px dashed rgba(15, 48, 87, 0.15)' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>You have not applied to any clubs yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '24px' }}>
          {clubRegistrations.map((reg) => {
            const club = reg.clubId;
            if (!club) return null;
            return (
              <div 
                key={reg._id} 
                className="glass-panel" 
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--panel-border)',
                  background: 'var(--panel-bg)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(140, 29, 64, 0.1)', color: '#8c1d40', fontWeight: 600 }}>
                      {club.category}
                    </span>
                    <span style={getStatusBadgeStyle(reg.status)}>
                      {reg.status}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
                    {club.name}
                  </h3>

                  {reg.remarks && (
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                      <strong>Remarks: </strong>{reg.remarks}
                    </p>
                  )}

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Applied on {new Date(reg.registrationDate).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <a 
                    href={`/clubs/${club._id}`} 
                    className="btn-secondary" 
                    style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '8px', textDecoration: 'none' }}
                  >
                    View Club
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   STUDENT: Payments History Logs
   ========================================================================== */
const StudentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments');
        if (res.data.success) {
          setPayments(res.data.data);
        }
      } catch (err) {
        console.error('Error payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner-small"></div></div>;

  return (
    <div>
      <h2 style={sectionTitleStyle}><CreditCard size={22} /> My Payment Receipts</h2>
      <p style={sectionSubtitleStyle}>View invoice receipts of fee subscriptions paid online</p>

      {payments.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(15, 48, 87, 0.02)', borderRadius: '12px', marginTop: '24px', border: '1px dashed rgba(15, 48, 87, 0.15)' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No transaction records found.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '24px' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableHeaderStyle}>Reference Item</th>
                <th style={tableHeaderStyle}>Amount</th>
                <th style={tableHeaderStyle}>Order ID</th>
                <th style={tableHeaderStyle}>Payment ID</th>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} style={tableRowStyle}>
                  <td style={tableCellStyle}>{p.clubId?.name || p.eventId?.title}</td>
                  <td style={tableCellStyle}>₹{p.amount}</td>
                  <td style={tableCellStyle} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{p.razorpayOrderId}</td>
                  <td style={tableCellStyle} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{p.razorpayPaymentId}</td>
                  <td style={tableCellStyle}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      color: p.status === 'Successful' ? '#2ecc71' : '#ff7675',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   STUDENT: Registered Events Tracker
   ========================================================================== */
const StudentRegisteredEvents = ({ showError }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get('/registrations');
      if (res.data.success) {
        // Filter: has an event and is in a confirmed/success status
        const eventRegs = res.data.data.filter(
          (reg) => reg.eventId && ['Registered', 'Approved', 'Selected'].includes(reg.status)
        );
        setRegistrations(eventRegs);
      }
    } catch (err) {
      console.error(err);
      showError('Failed to fetch registered events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <div className="spinner-small"></div>
      </div>
    );
  }

  const now = new Date();
  const activeEvents = registrations.filter(
    (reg) => new Date(reg.eventId.date).toDateString() === now.toDateString()
  );
  const upcomingEvents = registrations.filter(
    (reg) => new Date(reg.eventId.date) > now && new Date(reg.eventId.date).toDateString() !== now.toDateString()
  );
  const pastEvents = registrations.filter(
    (reg) => new Date(reg.eventId.date) < now && new Date(reg.eventId.date).toDateString() !== now.toDateString()
  );

  const renderEventList = (eventsList, sectionName) => {
    if (eventsList.length === 0) {
      return (
        <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(15, 48, 87, 0.02)', borderRadius: '12px', border: '1px dashed rgba(15, 48, 87, 0.15)' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
            No {sectionName} registered events.
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {eventsList.map((reg) => {
          const event = reg.eventId;
          const clubName = reg.clubId?.name || (event.clubId ? event.clubId.name : 'Club Event');
          const eventDate = new Date(event.date);
          const dateStr = eventDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          const timeStr = eventDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div 
              key={reg._id} 
              className="glass-panel" 
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--panel-border)',
                background: 'var(--panel-bg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(102, 126, 234, 0.15)', color: '#4f46e5', fontWeight: 600 }}>
                    {clubName}
                  </span>
                  <span style={getStatusBadgeStyle(reg.status)}>
                    {reg.status}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
                  {event.title}
                </h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} style={{ color: '#0f3057' }} />
                    {dateStr} at {timeStr}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📍</span>
                    {event.venue}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flex: '0 0 auto' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  Registered on {new Date(reg.registrationDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <h2 style={sectionTitleStyle}><Calendar size={22} /> My Registered Events</h2>
      <p style={sectionSubtitleStyle}>View and track tickets for your club and college events</p>

      {registrations.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(15, 48, 87, 0.02)', borderRadius: '12px', marginTop: '24px', border: '1px dashed rgba(15, 48, 87, 0.15)' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            You have not registered for any events yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '24px' }}>
          {activeEvents.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔥</span> Active Registered Events ({activeEvents.length})
              </h3>
              {renderEventList(activeEvents, 'active')}
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚀</span> Upcoming Registered Events ({upcomingEvents.length})
            </h3>
            {renderEventList(upcomingEvents, 'upcoming')}
          </div>

          <div style={{ opacity: 0.85 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⌛</span> Past Registered Events ({pastEvents.length})
            </h3>
            {renderEventList(pastEvents, 'past')}
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   COORDINATOR: Manage Club Details (Update Form)
   ========================================================================== */
const CoordinatorClubDetails = ({ showSuccess, showError }) => {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    mission: '',
    vision: '',
    qualificationCriteria: '',
    registrationFee: 0,
    logo: '',
    presidentName: '',
    presidentEmail: '',
    presidentContact: '',
    presidentPhoto: '',
    vpName: '',
    vpEmail: '',
    vpContact: '',
    vpPhoto: ''
  });

  const fetchClubDetails = async () => {
    try {
      const res = await api.get('/clubs');
      if (res.data.success) {
        // Find club where coordinator matches current coordinator (done inside backend or match here)
        // Wait, the backend has /api/clubs but let's filter for coordinator.
        // Or we could have an endpoint, but since we are coordinating, let's fetch and match.
        const currentCoordId = res.data.data[0]?.coordinatorId?._id; // Quick check
        // Let's filter clubs by coordinatorId
        const usersRes = await api.get('/auth/profile');
        const loggedInUserId = usersRes.data.data._id;
        const myClub = res.data.data.find(c => 
          c.coordinatorId?._id === loggedInUserId || 
          (usersRes.data.data.clubId && c._id === usersRes.data.data.clubId)
        );
        
        if (myClub) {
          setClub(myClub);
          setFormData({
            mission: myClub.mission || '',
            vision: myClub.vision || '',
            qualificationCriteria: myClub.qualificationCriteria || '',
            registrationFee: myClub.registrationFee || 0,
            logo: myClub.logo || '',
            presidentName: myClub.president?.name || '',
            presidentEmail: myClub.president?.email || '',
            presidentContact: myClub.president?.contact || '',
            presidentPhoto: myClub.president?.photo || '',
            vpName: myClub.vicePresident?.name || '',
            vpEmail: myClub.vicePresident?.email || '',
            vpContact: myClub.vicePresident?.contact || '',
            vpPhoto: myClub.vicePresident?.photo || ''
          });
        }
      }
    } catch (err) {
      showError('Failed to fetch club metadata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubDetails();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!club) return;

    setUpdating(true);
    try {
      const payload = {
        mission: formData.mission,
        vision: formData.vision,
        qualificationCriteria: formData.qualificationCriteria,
        registrationFee: Number(formData.registrationFee),
        logo: formData.logo,
        president: {
          name: formData.presidentName,
          email: formData.presidentEmail,
          contact: formData.presidentContact,
          photo: formData.presidentPhoto
        },
        vicePresident: {
          name: formData.vpName,
          email: formData.vpEmail,
          contact: formData.vpContact,
          photo: formData.vpPhoto
        }
      };

      const res = await api.put(`/clubs/${club._id}`, payload);
      if (res.data.success) {
        showSuccess('Club details saved successfully!');
        fetchClubDetails();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Error updating club metadata');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner-small"></div></div>;

  if (!club) {
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <h3>No Assigned Club</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>You are not registered as coordinator of any campus clubs. Contact Administrator.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={sectionTitleStyle}><Settings size={22} /> Manage My Club: {club.name}</h2>
      <p style={sectionSubtitleStyle}>Update mission statement, subscription pricing, and leadership details</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Club Category</label>
            <input type="text" className="glass-input" value={club.category} disabled />
          </div>
          <div>
            <label style={labelStyle}>Logo Image URL</label>
            <input type="text" name="logo" className="glass-input" value={formData.logo} onChange={handleChange} placeholder="https://..." />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Mission Statement</label>
          <textarea name="mission" className="glass-input" rows="3" value={formData.mission} onChange={handleChange} placeholder="Describe the mission..."></textarea>
        </div>

        <div>
          <label style={labelStyle}>Vision Statement</label>
          <textarea name="vision" className="glass-input" rows="3" value={formData.vision} onChange={handleChange} placeholder="Describe the vision..."></textarea>
        </div>

        <div>
          <label style={labelStyle}>Qualification Criteria</label>
          <textarea name="qualificationCriteria" className="glass-input" rows="3" value={formData.qualificationCriteria} onChange={handleChange} placeholder="Describe entry requirements for students wanting to join..."></textarea>
        </div>



        {/* President Profile */}
        <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '20px' }}>
          <h4 style={{ fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '14px' }}>President Information (Single slot)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <input type="text" name="presidentName" className="glass-input" placeholder="Name" value={formData.presidentName} onChange={handleChange} required />
            <input type="email" name="presidentEmail" className="glass-input" placeholder="Email" value={formData.presidentEmail} onChange={handleChange} required />
            <input type="text" name="presidentContact" className="glass-input" placeholder="Contact number" value={formData.presidentContact} onChange={handleChange} required />
            <input type="text" name="presidentPhoto" className="glass-input" placeholder="Photo URL" value={formData.presidentPhoto} onChange={handleChange} />
          </div>
        </div>

        {/* VP Profile */}
        <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '20px', marginBottom: '12px' }}>
          <h4 style={{ fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '14px' }}>Vice President Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <input type="text" name="vpName" className="glass-input" placeholder="Name" value={formData.vpName} onChange={handleChange} required />
            <input type="email" name="vpEmail" className="glass-input" placeholder="Email" value={formData.vpEmail} onChange={handleChange} required />
            <input type="text" name="vpContact" className="glass-input" placeholder="Contact number" value={formData.vpContact} onChange={handleChange} required />
            <input type="text" name="vpPhoto" className="glass-input" placeholder="Photo URL" value={formData.vpPhoto} onChange={handleChange} />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={updating}>
          {updating ? <span className="spinner-small"></span> : 'Update Club Details'}
        </button>
      </form>
    </div>
  );
};

/* ==========================================================================
   COORDINATOR: Manage Events (Create, Edit, Delete)
   ========================================================================== */
const CoordinatorEvents = ({ showSuccess, showError }) => {
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form Event fields
  const [eventData, setEventData] = useState({
    _id: '',
    title: '',
    description: '',
    date: '',
    venue: '',
    bannerImage: '',
    registrationFee: 0
  });

  const fetchClubAndEvents = async () => {
    try {
      const [profileRes, clubsRes, eventsRes] = await Promise.all([
        api.get('/auth/profile'),
        api.get('/clubs'),
        api.get('/events')
      ]);

      const loggedInUserId = profileRes.data.data._id;
      const myClub = clubsRes.data.data.find(c => 
        c.coordinatorId?._id === loggedInUserId || 
        (profileRes.data.data.clubId && c._id === profileRes.data.data.clubId)
      );
      
      if (myClub) {
        setClub(myClub);
        // Filter events belonging to this club
        const myEvents = eventsRes.data.data.filter(e => e.clubId?._id === myClub._id);
        setEvents(myEvents);
      }
    } catch (err) {
      showError('Failed to fetch events checklist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubAndEvents();
  }, []);

  const handleOpenCreate = () => {
    setEventData({
      _id: '',
      title: '',
      description: '',
      date: '',
      venue: '',
      bannerImage: '',
      registrationFee: 0
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (evt) => {
    setEventData({
      _id: evt._id,
      title: evt.title,
      description: evt.description,
      date: new Date(evt.date).toISOString().substring(0, 16),
      venue: evt.venue,
      bannerImage: evt.bannerImage || '',
      registrationFee: evt.registrationFee
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!club) return;

    try {
      const payload = {
        clubId: club._id,
        title: eventData.title,
        description: eventData.description,
        date: new Date(eventData.date).toISOString(),
        venue: eventData.venue,
        bannerImage: eventData.bannerImage,
        registrationFee: Number(eventData.registrationFee)
      };

      let res;
      if (eventData._id) {
        // Edit mode
        res = await api.put(`/events/${eventData._id}`, payload);
      } else {
        // Create mode
        res = await api.post('/events', payload);
      }

      if (res.data.success) {
        showSuccess(eventData._id ? 'Event details updated!' : 'New campus event created!');
        setModalOpen(false);
        fetchClubAndEvents();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Error processing event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await api.delete(`/events/${id}`);
      if (res.data.success) {
        showSuccess('Event deleted successfully.');
        fetchClubAndEvents();
      }
    } catch (err) {
      showError('Failed to delete event');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner-small"></div></div>;

  const now = new Date();
  const upcomingEvents = events.filter(evt => new Date(evt.date) >= now);
  const pastEvents = events.filter(evt => new Date(evt.date) < now);

  const renderEventTable = (eventsList, sectionName) => {
    if (eventsList.length === 0) {
      return (
        <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(15, 48, 87, 0.02)', borderRadius: '12px', border: '1px dashed rgba(15, 48, 87, 0.15)', marginBottom: '30px' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>No {sectionName.toLowerCase()} events scheduled.</p>
        </div>
      );
    }

    return (
      <div style={{ overflowX: 'auto', marginTop: '10px', marginBottom: '30px' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={tableHeaderStyle}>Event Title</th>
              <th style={tableHeaderStyle}>Scheduled Date</th>
              <th style={tableHeaderStyle}>Venue</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {eventsList.map((evt) => (
              <tr key={evt._id} style={tableRowStyle}>
                <td style={tableCellStyle}><strong>{evt.title}</strong></td>
                <td style={tableCellStyle}>{new Date(evt.date).toLocaleString()}</td>
                <td style={tableCellStyle}>{evt.venue}</td>
                <td style={tableCellStyle}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenEdit(evt)} style={iconBtnStyle} title="Edit Event"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(evt._id)} style={{ ...iconBtnStyle, color: '#ff7675' }} title="Delete Event"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h2 style={sectionTitleStyle}><Calendar size={22} /> Manage Club Events</h2>
          <p style={sectionSubtitleStyle}>Create and manage event schedules for your student groups</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
          <Plus size={16} /> Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(15, 48, 87, 0.02)', borderRadius: '12px', border: '1px dashed rgba(15, 48, 87, 0.15)' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No scheduled events yet. Add your first event!</p>
        </div>
      ) : (
        <>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚀</span> Upcoming / Future Events ({upcomingEvents.length})
          </h3>
          {renderEventTable(upcomingEvents, 'Upcoming')}

          <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
            <span>⌛</span> Past Events ({pastEvents.length})
          </h3>
          {renderEventTable(pastEvents, 'Past')}
        </>
      )}

      {/* CREATE/EDIT EVENT MODAL DIALOG */}
      {modalOpen && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={eventFormModalPanelStyle}>
            <h3 style={eventFormModalTitleStyle}>
              {eventData._id ? 'Edit Event Details' : 'Schedule New Event'}
            </h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Event Title</label>
                <input type="text" className="glass-input" value={eventData.title} onChange={(e) => setEventData({ ...eventData, title: e.target.value })} required />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea className="glass-input" rows="3" value={eventData.description} onChange={(e) => setEventData({ ...eventData, description: e.target.value })} required></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Date & Time</label>
                  <input type="datetime-local" className="glass-input" value={eventData.date} onChange={(e) => setEventData({ ...eventData, date: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Venue</label>
                  <input type="text" className="glass-input" value={eventData.venue} onChange={(e) => setEventData({ ...eventData, venue: e.target.value })} required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Banner URL</label>
                <input type="text" className="glass-input" placeholder="https://..." value={eventData.bannerImage} onChange={(e) => setEventData({ ...eventData, bannerImage: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" style={{ padding: '8px 20px', borderRadius: '8px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px', borderRadius: '8px' }}>
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   COORDINATOR: Review Club Applications / Registrations
   ========================================================================== */
const CoordinatorRegistrations = ({ type, showSuccess, showError }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Communication Email Form fields
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailData, setEmailData] = useState({ to: '', subject: '', message: '' });
  const [sendingEmail, setSendingEmail] = useState(false);

  // Approve / Reject Modals State
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  
  const [interviewDetails, setInterviewDetails] = useState({
    venue: '',
    date: '',
    time: '',
    location: '',
    notes: ''
  });

  const [rejectionDetails, setRejectionDetails] = useState({
    reason: 'Club is full',
    remarks: ''
  });

  const fetchRegistrations = async () => {
    try {
      const res = await api.get(`/registrations?type=${type}`);
      if (res.data.success) {
        setRegistrations(res.data.data);
      }
    } catch (err) {
      showError('Failed to load applications log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [type]);

  const handleUpdateStatus = async (id, status) => {
    if (status === 'Approved') {
      const reg = registrations.find(r => r._id === id);
      setSelectedReg(reg);
      if (type === 'club') {
        setInterviewDetails({
          venue: '',
          date: '',
          time: '',
          location: '',
          notes: ''
        });
        setApproveModalOpen(true);
        return;
      } else {
        // Direct approval for event registrations without interview scheduler modal
        try {
          const res = await api.put(`/registrations/${id}/status`, {
            status: 'Approved',
            remarks: 'Event Registration Confirmed'
          });
          if (res.data.success) {
            showSuccess('Event registration confirmed! Ticket confirmation email sent.');
            fetchRegistrations();
          }
        } catch (err) {
          showError('Failed to confirm event registration');
        }
        return;
      }
    }

    if (status === 'Rejected') {
      const reg = registrations.find(r => r._id === id);
      setSelectedReg(reg);
      setRejectionDetails({
        reason: type === 'club' ? 'Club is full' : 'Event registration limit reached',
        remarks: ''
      });
      setRejectModalOpen(true);
      return;
    }

    // Direct update for Shortlisted
    const remarks = window.prompt(`Enter optional review remarks/feedback for status: ${status}:`);
    if (remarks === null) return;

    try {
      const res = await api.put(`/registrations/${id}/status`, { status, remarks });
      if (res.data.success) {
        showSuccess(`Application updated to ${status}! Notification email sent.`);
        fetchRegistrations();
      }
    } catch (err) {
      showError('Error updating status');
    }
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReg) return;

    try {
      const res = await api.put(`/registrations/${selectedReg._id}/status`, {
        status: 'Approved',
        remarks: interviewDetails.notes || 'Application Approved',
        interviewDetails
      });
      if (res.data.success) {
        showSuccess(`Application approved! Interview details emailed to ${selectedReg.userId?.email}`);
        setApproveModalOpen(false);
        setSelectedReg(null);
        fetchRegistrations();
      }
    } catch (err) {
      showError('Failed to approve registration');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReg) return;

    const fullRemarks = `${rejectionDetails.reason}${rejectionDetails.remarks ? ' - ' + rejectionDetails.remarks : ''}`;

    try {
      const res = await api.put(`/registrations/${selectedReg._id}/status`, {
        status: 'Rejected',
        remarks: fullRemarks
      });
      if (res.data.success) {
        showSuccess(`Application rejected. Rejection email sent.`);
        setRejectModalOpen(false);
        setSelectedReg(null);
        fetchRegistrations();
      }
    } catch (err) {
      showError('Failed to reject registration');
    }
  };

  const handleOpenEmail = (recipientEmail) => {
    setEmailData({
      to: recipientEmail,
      subject: 'EduEvent Club Registration Announcement',
      message: 'Dear Student,\n\nWe have reviewed your enrollment records. Please note the following updates...'
    });
    setEmailModalOpen(true);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSendingEmail(true);
    try {
      const res = await api.post('/send-email', {
        to: emailData.to,
        subject: emailData.subject,
        message: emailData.message
      });
      if (res.data.success) {
        showSuccess('Direct communication email sent successfully!');
        setEmailModalOpen(false);
      }
    } catch (err) {
      showError('Error sending communication email');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner-small"></div></div>;

  return (
    <div>
      <h2 style={sectionTitleStyle}>
        <FileText size={22} /> {type === 'club' ? 'Review Club Applications' : 'Review Event Applications'}
      </h2>
      <p style={sectionSubtitleStyle}>
        {type === 'club' 
          ? 'Review applications and communicate statuses with students' 
          : 'Review event registrations and communicate statuses with students'}
      </p>

      {registrations.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(15, 48, 87, 0.02)', borderRadius: '12px', marginTop: '24px', border: '1px dashed rgba(15, 48, 87, 0.15)' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {type === 'club' 
              ? 'No club join applications received.' 
              : 'No event registration applications received.'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '24px' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableHeaderStyle}>Student</th>
                <th style={tableHeaderStyle}>Enrollment / Dept</th>
                <th style={tableHeaderStyle}>Target Item</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg._id} style={tableRowStyle}>
                  <td style={tableCellStyle}>
                    <div>
                      <strong>{reg.userId?.name}</strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{reg.userId?.email}</p>
                      {reg.applicationDetails && 
                       (reg.applicationDetails.reason || reg.applicationDetails.skills) && 
                       !(reg.applicationDetails.reason === 'Apply to Join Request' && reg.applicationDetails.skills === 'N/A') && (
                        <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(15, 48, 87, 0.02)', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--panel-border)' }}>
                          {reg.applicationDetails.reason && <p style={{ margin: '2px 0' }}><span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Reason:</span> {reg.applicationDetails.reason}</p>}
                          {reg.applicationDetails.skills && <p style={{ margin: '2px 0' }}><span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Skills:</span> {reg.applicationDetails.skills}</p>}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <div>
                      <span>{reg.userId?.enrollment || 'N/A'}</span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{reg.userId?.department} ({reg.userId?.semester})</p>
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <div>
                      <strong>{reg.clubId?.name || reg.eventId?.title}</strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        {reg.clubId ? 'Club' : 'Event'}
                      </p>
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <span style={getStatusBadgeStyle(reg.status)}>{reg.status}</span>
                    {reg.status === 'Registered' && (
                      <div style={{ fontSize: '0.7rem', color: '#2ecc71', marginTop: '2px', fontWeight: 'bold' }}>
                        🎟️ Ticket Confirmed
                      </div>
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    {reg.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleUpdateStatus(reg._id, 'Approved')} style={{ ...iconBtnStyle, color: '#2ecc71' }} title="Approve"><Check size={14} /></button>
                        <button onClick={() => handleUpdateStatus(reg._id, 'Rejected')} style={{ ...iconBtnStyle, color: '#ff7675' }} title="Reject"><X size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* APPROVE WITH INTERVIEW DETAILS MODAL */}
      {approveModalOpen && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '30px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', marginBottom: '20px', color: '#059669' }}>
              Approve Application & Set Interview/Selection Details
            </h3>

            <form onSubmit={handleApproveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Interview Date</label>
                  <input 
                    type="date" 
                    className="glass-input" 
                    value={interviewDetails.date} 
                    onChange={(e) => setInterviewDetails({ ...interviewDetails, date: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label style={labelStyle}>Interview Time</label>
                  <input 
                    type="time" 
                    className="glass-input" 
                    value={interviewDetails.time} 
                    onChange={(e) => setInterviewDetails({ ...interviewDetails, time: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Venue Name</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="e.g. Audi 2, CS Seminar Hall" 
                  value={interviewDetails.venue} 
                  onChange={(e) => setInterviewDetails({ ...interviewDetails, venue: e.target.value })} 
                  required 
                />
              </div>

              <div>
                <label style={labelStyle}>Location Specifics</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="e.g. Block A, 3rd Floor" 
                  value={interviewDetails.location} 
                  onChange={(e) => setInterviewDetails({ ...interviewDetails, location: e.target.value })} 
                  required 
                />
              </div>

              <div>
                <label style={labelStyle}>Additional Notes / Instructions</label>
                <textarea 
                  className="glass-input" 
                  rows="3" 
                  placeholder="Items to bring, preparation details..." 
                  value={interviewDetails.notes} 
                  onChange={(e) => setInterviewDetails({ ...interviewDetails, notes: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => { setApproveModalOpen(false); setSelectedReg(null); }} className="btn-secondary" style={{ padding: '8px 20px', borderRadius: '8px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px', borderRadius: '8px', background: 'linear-gradient(90deg, #059669 0%, #047857 100%)' }}>
                  Approve & Email details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalOpen && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '450px', padding: '30px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', marginBottom: '20px', color: '#ef4444' }}>
              Reject Application
            </h3>

            <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Primary Rejection Reason</label>
                <select 
                  className="glass-input" 
                  value={rejectionDetails.reason} 
                  onChange={(e) => setRejectionDetails({ ...rejectionDetails, reason: e.target.value })} 
                  required
                  style={{ appearance: 'none' }}
                >
                  {type === 'club' ? (
                    <>
                      <option value="Club is full" style={{ color: '#000' }}>Club is full</option>
                      <option value="Not acceptable / Requirements not met" style={{ color: '#000' }}>Not acceptable / Requirements not met</option>
                      <option value="Incomplete application profile" style={{ color: '#000' }}>Incomplete application profile</option>
                      <option value="Other" style={{ color: '#000' }}>Other</option>
                    </>
                  ) : (
                    <>
                      <option value="Event registration limit reached" style={{ color: '#000' }}>Event registration limit reached</option>
                      <option value="Event canceled" style={{ color: '#000' }}>Event canceled</option>
                      <option value="Ineligible for event" style={{ color: '#000' }}>Ineligible for event</option>
                      <option value="Other" style={{ color: '#000' }}>Other</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Additional Remarks / Feedback</label>
                <textarea 
                  className="glass-input" 
                  rows="3" 
                  placeholder="Enter details that will be sent to the student..." 
                  value={rejectionDetails.remarks} 
                  onChange={(e) => setRejectionDetails({ ...rejectionDetails, remarks: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => { setRejectModalOpen(false); setSelectedReg(null); }} className="btn-secondary" style={{ padding: '8px 20px', borderRadius: '8px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px', borderRadius: '8px', background: 'linear-gradient(90deg, #ef4444 0%, #c53030 100%)' }}>
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIRECT EMAIL MODAL POPUP */}
      {emailModalOpen && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '30px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', marginBottom: '20px' }}>
              Direct Student Email Portal
            </h3>

            <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Recipient Email Address</label>
                <input type="email" className="glass-input" value={emailData.to} disabled />
              </div>

              <div>
                <label style={labelStyle}>Subject Header</label>
                <input type="text" className="glass-input" value={emailData.subject} onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })} required />
              </div>

              <div>
                <label style={labelStyle}>Message Body</label>
                <textarea className="glass-input" rows="5" value={emailData.message} onChange={(e) => setEmailData({ ...emailData, message: e.target.value })} required></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setEmailModalOpen(false)} className="btn-secondary" style={{ padding: '8px 20px', borderRadius: '8px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={sendingEmail} style={{ padding: '8px 20px', borderRadius: '8px' }}>
                  {sendingEmail ? <span className="spinner-small"></span> : <><Send size={14} /> Send Email</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   COORDINATOR: payments tracker logs
   ========================================================================== */
const CoordinatorPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments');
        if (res.data.success) {
          setPayments(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner-small"></div></div>;

  return (
    <div>
      <h2 style={sectionTitleStyle}><CreditCard size={22} /> Club Payments Tracker</h2>
      <p style={sectionSubtitleStyle}>List invoice logs of paid applications for your clubs and events</p>

      {payments.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(15, 48, 87, 0.02)', borderRadius: '12px', marginTop: '24px', border: '1px dashed rgba(15, 48, 87, 0.15)' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No transaction records logged.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '24px' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableHeaderStyle}>Student Name</th>
                <th style={tableHeaderStyle}>Class Info</th>
                <th style={tableHeaderStyle}>Item Registered</th>
                <th style={tableHeaderStyle}>Receipt Price</th>
                <th style={tableHeaderStyle}>Order ID</th>
                <th style={tableHeaderStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} style={tableRowStyle}>
                  <td style={tableCellStyle}>
                    <div>
                      <strong>{p.userId?.name}</strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.userId?.email}</p>
                    </div>
                  </td>
                  <td style={tableCellStyle}>{p.userId?.department} ({p.userId?.semester})</td>
                  <td style={tableCellStyle}>{p.clubId?.name || p.eventId?.title}</td>
                  <td style={{ ...tableCellStyle, color: '#2ecc71', fontWeight: 'bold' }}>₹{p.amount}</td>
                  <td style={{ ...tableCellStyle, fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>{p.razorpayOrderId}</td>
                  <td style={tableCellStyle}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   COORDINATOR: Manage Club Members
   ========================================================================== */
const CoordinatorMembers = ({ showSuccess, showError }) => {
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const fetchClubAndMembers = async () => {
    try {
      const clubsRes = await api.get('/clubs');
      const profileRes = await api.get('/auth/profile');
      const loggedInUserId = profileRes.data.data._id;
      
      const myClub = clubsRes.data.data.find(c => 
        c.coordinatorId?._id === loggedInUserId || 
        (profileRes.data.data.clubId && c._id === profileRes.data.data.clubId)
      );

      if (myClub) {
        setClub(myClub);
        const membersRes = await api.get(`/clubs/${myClub._id}/members`);
        if (membersRes.data.success) {
          setMembers(membersRes.data.data);
        }
      }
    } catch (err) {
      showError('Failed to fetch club members roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubAndMembers();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setAdding(true);
    try {
      const res = await api.post(`/clubs/${club._id}/members`, { email: newMemberEmail });
      if (res.data.success) {
        showSuccess(res.data.message || 'Member added successfully!');
        setNewMemberEmail('');
        fetchClubAndMembers();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Error adding member. Ensure they have registered first.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the club?')) return;

    try {
      const res = await api.delete(`/clubs/${club._id}/members/${memberId}`);
      if (res.data.success) {
        showSuccess('Member removed successfully.');
        fetchClubAndMembers();
      }
    } catch (err) {
      showError('Failed to remove member');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner-small"></div></div>;

  if (!club) {
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <h3>No Assigned Club</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>You are not registered as coordinator of any campus clubs. Contact Administrator.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={sectionTitleStyle}><Users size={22} /> Club Roster: {club.name}</h2>
          <p style={sectionSubtitleStyle}>View and manage approved students registered in your campus group</p>
        </div>

        {/* Add Member Form */}
        <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input 
            type="email" 
            className="glass-input" 
            placeholder="Student email (@medicaps.ac.in)" 
            value={newMemberEmail} 
            onChange={(e) => setNewMemberEmail(e.target.value)} 
            required 
            style={{ minWidth: '260px', height: '40px', padding: '8px 12px' }}
          />
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={adding} 
            style={{ height: '40px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {adding ? <span className="spinner-small"></span> : <><Plus size={16} /> Add Member</>}
          </button>
        </form>
      </div>

      {members.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(15, 48, 87, 0.02)', borderRadius: '12px', border: '1px dashed rgba(15, 48, 87, 0.15)' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No approved members in this club yet. Approve join requests to populate your roster or add them manually above.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableHeaderStyle}>Member Name</th>
                <th style={tableHeaderStyle}>Email Address</th>
                <th style={tableHeaderStyle}>Enrollment</th>
                <th style={tableHeaderStyle}>Department / Semester</th>
                <th style={tableHeaderStyle}>Contact Info</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id} style={tableRowStyle}>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={m.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'} 
                        alt={m.name} 
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                      <strong>{m.name}</strong>
                    </div>
                  </td>
                  <td style={tableCellStyle}>{m.email}</td>
                  <td style={tableCellStyle}>{m.enrollment || 'N/A'}</td>
                  <td style={tableCellStyle}>{m.department} ({m.semester})</td>
                  <td style={tableCellStyle}>{m.phone || 'N/A'}</td>
                  <td style={tableCellStyle}>
                    <button 
                      onClick={() => handleRemoveMember(m._id)} 
                      style={{ ...iconBtnStyle, color: '#ff7675' }} 
                      title="Remove Member"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


/* ==========================================================================
   ADMIN: Analytics Dashboard overview
   ========================================================================== */
const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner-small"></div></div>;

  const { stats, clubRevenue, recentPayments, departmentsDistribution } = data;

  return (
    <div>
      <h2 style={sectionTitleStyle}><BarChart2 size={22} /> Admin Analytics Dashboard</h2>
      <p style={sectionSubtitleStyle}>Real-time college stats, registrations counts, and club metrics</p>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginTop: '24px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <Users size={22} style={{ color: '#3498db', marginBottom: '6px' }} />
          <h4 style={{ fontSize: '1.6rem', fontFamily: 'Outfit' }}>{stats.totalStudents}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Students</p>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <Settings size={22} style={{ color: '#e0c3fc', marginBottom: '6px' }} />
          <h4 style={{ fontSize: '1.6rem', fontFamily: 'Outfit' }}>{stats.totalClubs}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Clubs</p>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <Calendar size={22} style={{ color: '#f1c40f', marginBottom: '6px' }} />
          <h4 style={{ fontSize: '1.6rem', fontFamily: 'Outfit' }}>{stats.totalEvents}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Events</p>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <FileText size={22} style={{ color: '#2ecc71', marginBottom: '6px' }} />
          <h4 style={{ fontSize: '1.6rem', fontFamily: 'Outfit' }}>{stats.totalRegistrations}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Applications Review</p>
        </div>
      </div>

      {/* Grid of details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }} className="admin-grid">
        {/* Members split table */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', marginBottom: '16px' }}>Club Enrollment Metrics</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={tableHeaderStyle}>Club Name</th>
                  <th style={tableHeaderStyle}>Category</th>
                  <th style={tableHeaderStyle}>Approved Members</th>
                </tr>
              </thead>
              <tbody>
                {clubRevenue.map((cr) => (
                  <tr key={cr.clubId} style={tableRowStyle}>
                    <td style={tableCellStyle}><strong>{cr.name}</strong></td>
                    <td style={tableCellStyle}>{cr.category}</td>
                    <td style={tableCellStyle}>{cr.membersCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =================================    ADMIN: Manage Clubs & Presidents
    ========================================================================== */
const AdminClubs = ({ showSuccess, showError, showWarning }) => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClubId, setEditingClubId] = useState(null);

  // Form Fields State
  const [clubData, setClubData] = useState({
    name: '',
    description: '',
    category: '',
    registrationFee: 0,
    presidentName: '',
    presidentEmail: '',
    presidentPassword: ''
  });

  const fetchClubs = async () => {
    try {
      const res = await api.get('/clubs');
      if (res.data.success) {
        setClubs(res.data.data);
      }
    } catch (err) {
      showError('Failed to fetch clubs database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleEditClick = (club) => {
    setEditingClubId(club._id);
    setClubData({
      name: club.name,
      description: club.description,
      category: club.category,
      registrationFee: club.registrationFee || 0,
      presidentName: club.president?.name || '',
      presidentEmail: club.president?.email || '',
      presidentPassword: ''
    });
    setModalOpen(true);
  };

  const handleSaveClub = async (e) => {
    e.preventDefault();

    // Password strength validator
    const validatePassword = (pass) => {
      if (pass.length < 8) return 'Password must be at least 8 characters long.';
      if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter.';
      if (!/[a-z]/.test(pass)) return 'Password must contain at least one lowercase letter.';
      if (!/\d/.test(pass)) return 'Password must contain at least one number.';
      if (!/[@#$%%*&!^()_+=\-\[\]{}|;:',.<>?/`~]/.test(pass)) {
        return 'Password must contain at least one special character (e.g., @, #, $, %, &, !).';
      }
      return null;
    };

    if (!editingClubId || clubData.presidentPassword) {
      const errorMsg = validatePassword(clubData.presidentPassword);
      if (errorMsg) {
        showWarning(errorMsg);
        return;
      }
    }

    try {
      if (editingClubId) {
        // Edit existing club
        const res = await api.put(`/clubs/${editingClubId}`, {
          name: clubData.name,
          description: clubData.description,
          category: clubData.category,
          registrationFee: Number(clubData.registrationFee),
          presidentName: clubData.presidentName,
          presidentEmail: clubData.presidentEmail,
          presidentPassword: clubData.presidentPassword || undefined
        });

        if (res.data.success) {
          showSuccess('Campus club updated successfully!');
          setModalOpen(false);
          setEditingClubId(null);
          fetchClubs();
        }
      } else {
        // Create new club
        const res = await api.post('/clubs', {
          name: clubData.name,
          description: clubData.description,
          category: clubData.category,
          registrationFee: Number(clubData.registrationFee),
          presidentName: clubData.presidentName,
          presidentEmail: clubData.presidentEmail,
          presidentPassword: clubData.presidentPassword
        });

        if (res.data.success) {
          showSuccess('New campus club created successfully!');
          setModalOpen(false);
          fetchClubs();
        }
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Error saving club');
    }
  };

  const handleDeleteClub = async (id) => {
    if (!window.confirm('Are you sure you want to delete this club? This action is permanent.')) return;
    try {
      const res = await api.delete(`/clubs/${id}`);
      if (res.data.success) {
        showSuccess('Club deleted successfully.');
        fetchClubs();
      }
    } catch (err) {
      showError('Failed to delete club');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner-small"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <h2 style={sectionTitleStyle}><Settings size={22} /> Manage Campus Clubs</h2>
          <p style={sectionSubtitleStyle}>Create new student clubs and assign Club Presidents</p>
        </div>
        <button onClick={() => { setEditingClubId(null); setClubData({ name: '', description: '', category: '', registrationFee: 0, presidentName: '', presidentEmail: '', presidentPassword: '' }); setModalOpen(true); }} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
          <Plus size={16} /> Create Club
        </button>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={tableHeaderStyle}>Club Name</th>
              <th style={tableHeaderStyle}>Category</th>
              <th style={tableHeaderStyle}>Assigned President</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((c) => (
              <tr key={c._id} style={tableRowStyle}>
                <td style={tableCellStyle}><strong>{c.name}</strong></td>
                <td style={tableCellStyle}>{c.category}</td>
                <td style={tableCellStyle}>{c.coordinatorId?.name || <span style={{ color: '#ff7675' }}>Unassigned</span>}</td>
                <td style={tableCellStyle}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={() => handleEditClick(c)} style={{ ...iconBtnStyle, color: '#0f3057' }} title="Edit Club"><Edit size={14} /></button>
                    <button onClick={() => handleDeleteClub(c._id)} style={{ ...iconBtnStyle, color: '#ff7675' }} title="Delete Club"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE/EDIT CLUB MODAL DIALOG */}
      {modalOpen && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '480px', padding: '30px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', marginBottom: '20px' }}>
              {editingClubId ? 'Edit Student Club' : 'Create New Student Club'}
            </h3>

            <form onSubmit={handleSaveClub} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Club Name</label>
                <input type="text" className="glass-input" value={clubData.name} onChange={(e) => setClubData({ ...clubData, name: e.target.value })} placeholder="e.g. Coding Club" required />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea className="glass-input" rows="3" value={clubData.description} onChange={(e) => setClubData({ ...clubData, description: e.target.value })} required></textarea>
              </div>

              <div>
                <label style={labelStyle}>Category</label>
                <input type="text" className="glass-input" value={clubData.category} onChange={(e) => setClubData({ ...clubData, category: e.target.value })} placeholder="e.g. Coding" required />
              </div>

              <div>
                <label style={labelStyle}>President Name</label>
                <input type="text" className="glass-input" value={clubData.presidentName} onChange={(e) => setClubData({ ...clubData, presidentName: e.target.value })} placeholder="e.g. Nikhil Sen" required />
              </div>

              <div>
                <label style={labelStyle}>President Email</label>
                <input type="email" className="glass-input" value={clubData.presidentEmail} onChange={(e) => setClubData({ ...clubData, presidentEmail: e.target.value })} placeholder="nikhil.sen@college.edu" autoComplete="new-email" required />
              </div>

              <div>
                <label style={labelStyle}>President Password</label>
                <input type="password" className="glass-input" value={clubData.presidentPassword} onChange={(e) => setClubData({ ...clubData, presidentPassword: e.target.value })} placeholder={editingClubId ? "Leave blank to keep current password" : "••••••••"} autoComplete="new-password" required={!editingClubId} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => { setModalOpen(false); setEditingClubId(null); }} className="btn-secondary" style={{ padding: '8px 20px', borderRadius: '8px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px', borderRadius: '8px' }}>
                  {editingClubId ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   ADMIN: User Directory & Promote Roles
   ========================================================================== */
/* ==========================================================================
   ADMIN: User Directory & Promote Roles
   ========================================================================== */
const AdminUsers = ({ showSuccess, showError }) => {
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form Fields State
  const [newStaffData, setNewStaffData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'coordinator',
    clubId: ''
  });

  const [editStaffData, setEditStaffData] = useState({
    role: 'coordinator',
    clubId: ''
  });

  const fetchUsersAndClubs = async () => {
    try {
      const [usersRes, clubsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/clubs')
      ]);

      if (usersRes.data.success && clubsRes.data.success) {
        setUsers(usersRes.data.data);
        setClubs(clubsRes.data.data);
      }
    } catch (err) {
      showError('Failed to fetch users or clubs data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndClubs();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaffData.name || !newStaffData.email || !newStaffData.password || !newStaffData.clubId) {
      showError('Please fill all fields and select a club.');
      return;
    }

    try {
      const res = await api.post('/admin/users', {
        name: newStaffData.name,
        email: newStaffData.email,
        password: newStaffData.password,
        role: newStaffData.role,
        clubId: newStaffData.clubId
      });

      if (res.data.success) {
        showSuccess('Staff account created and assigned successfully.');
        setCreateModalOpen(false);
        setNewStaffData({ name: '', email: '', password: '', role: 'coordinator', clubId: '' });
        fetchUsersAndClubs();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Error creating staff account');
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!editStaffData.clubId) {
      showError('Please assign a club.');
      return;
    }

    try {
      const res = await api.put(`/admin/users/${selectedUser._id}/role`, {
        role: editStaffData.role,
        clubId: editStaffData.clubId
      });

      if (res.data.success) {
        showSuccess('Staff assignment updated successfully.');
        setEditModalOpen(false);
        fetchUsersAndClubs();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Error updating staff details');
    }
  };

  const handleDemoteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to demote this staff member back to a student? This clears their club assignment.')) return;
    try {
      const res = await api.put(`/admin/users/${userId}/role`, {
        role: 'student',
        clubId: null
      });

      if (res.data.success) {
        showSuccess('Staff member demoted to student successfully.');
        fetchUsersAndClubs();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Error demoting user');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner-small"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <h2 style={sectionTitleStyle}><Users size={22} /> Manage User Roles</h2>
          <p style={sectionSubtitleStyle}>Create and manage Club Admins, Club Presidents, and change club assignments</p>
        </div>
        <button onClick={() => { setNewStaffData({ name: '', email: '', password: '', role: 'coordinator', clubId: '' }); setCreateModalOpen(true); }} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
          <Plus size={16} /> Create Staff
        </button>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '24px' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={tableHeaderStyle}>User Name</th>
              <th style={tableHeaderStyle}>Email Address</th>
              <th style={tableHeaderStyle}>Role</th>
              <th style={tableHeaderStyle}>Assigned Club</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSuper = u.role === 'admin' && !u.clubId;
              return (
                <tr key={u._id} style={tableRowStyle}>
                  <td style={tableCellStyle}><strong>{u.name}</strong></td>
                  <td style={tableCellStyle}>{u.email}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      background: u.role === 'admin' ? (u.clubId ? '#ffe2e2' : '#ffd3d3') : u.role === 'coordinator' ? '#e8dbff' : '#dcfce7',
                      color: u.role === 'admin' ? (u.clubId ? '#dc3545' : '#c0392b') : u.role === 'coordinator' ? '#764ba2' : '#28a745',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'capitalize'
                    }}>
                      {u.role === 'admin' ? (u.clubId ? 'Club Admin' : 'Super Admin') : u.role === 'coordinator' ? 'Club President' : 'Student'}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    {u.clubId?.name || (isSuper ? <span style={{ color: 'var(--text-secondary)' }}>All Clubs (Super Admin)</span> : <span style={{ color: 'var(--text-muted)' }}>None (Student)</span>)}
                  </td>
                  <td style={tableCellStyle}>
                    {!isSuper && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => {
                            setSelectedUser(u);
                            setEditStaffData({
                              role: u.role === 'student' ? 'coordinator' : u.role,
                              clubId: u.clubId?._id || u.clubId || ''
                            });
                            setEditModalOpen(true);
                          }} 
                          style={iconBtnStyle} 
                          title={u.role === 'student' ? "Promote to Staff" : "Edit Staff Assignment"}
                        >
                          <Edit size={14} />
                        </button>
                        {(u.role === 'coordinator' || u.role === 'admin') && (
                          <button 
                            onClick={() => handleDemoteUser(u._id)} 
                            style={{ ...iconBtnStyle, color: '#ff7675' }} 
                            title="Demote to Student"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CREATE STAFF MODAL */}
      {createModalOpen && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '480px', padding: '30px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', marginBottom: '20px' }}>
              Create Club Staff Account
            </h3>

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" className="glass-input" value={newStaffData.name} onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })} placeholder="e.g. John Doe" required />
              </div>

              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" className="glass-input" value={newStaffData.email} onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })} placeholder="e.g. john@medicaps.ac.in" required />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" className="glass-input" value={newStaffData.password} onChange={(e) => setNewStaffData({ ...newStaffData, password: e.target.value })} placeholder="Min 6 characters" required />
              </div>

              <div>
                <label style={labelStyle}>Staff Role</label>
                <select className="glass-input" value={newStaffData.role} onChange={(e) => setNewStaffData({ ...newStaffData, role: e.target.value })} required style={{ appearance: 'none' }}>
                  <option value="coordinator" style={{ color: '#000' }}>Club President</option>
                  <option value="admin" style={{ color: '#000' }}>Club Admin</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Assign Club</label>
                <select className="glass-input" value={newStaffData.clubId} onChange={(e) => setNewStaffData({ ...newStaffData, clubId: e.target.value })} required style={{ appearance: 'none' }}>
                  <option value="" style={{ color: '#000' }}>-- Choose Assigned Club --</option>
                  {clubs.map(c => (
                    <option key={c._id} value={c._id} style={{ color: '#000' }}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setCreateModalOpen(false)} className="btn-secondary" style={{ padding: '8px 20px', borderRadius: '8px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px', borderRadius: '8px' }}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {editModalOpen && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '480px', padding: '30px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', marginBottom: '20px' }}>
              Edit Staff Assignment for {selectedUser?.name}
            </h3>

            <form onSubmit={handleUpdateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Staff Role</label>
                <select className="glass-input" value={editStaffData.role} onChange={(e) => setEditStaffData({ ...editStaffData, role: e.target.value })} required style={{ appearance: 'none' }}>
                  <option value="coordinator" style={{ color: '#000' }}>Club President</option>
                  <option value="admin" style={{ color: '#000' }}>Club Admin</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Assign Club</label>
                <select className="glass-input" value={editStaffData.clubId} onChange={(e) => setEditStaffData({ ...editStaffData, clubId: e.target.value })} required style={{ appearance: 'none' }}>
                  <option value="" style={{ color: '#000' }}>-- Choose Assigned Club --</option>
                  {clubs.map(c => (
                    <option key={c._id} value={c._id} style={{ color: '#000' }}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setEditModalOpen(false)} className="btn-secondary" style={{ padding: '8px 20px', borderRadius: '8px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px', borderRadius: '8px' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   ADMIN: Global Registrations Viewer
   ========================================================================== */
const AdminRegistrations = ({ showSuccess, showError }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGlobalRegistrations = async () => {
    try {
      const res = await api.get('/registrations');
      if (res.data.success) {
        setRegistrations(res.data.data);
      }
    } catch (err) {
      showError('Failed to fetch registration records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalRegistrations();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const remarks = window.prompt(`Enter optional remarks/feedback for: ${status}:`);
    if (remarks === null) return;

    try {
      const res = await api.put(`/registrations/${id}/status`, { status, remarks });
      if (res.data.success) {
        showSuccess(`Registration marked as ${status}! Status email sent.`);
        fetchGlobalRegistrations();
      }
    } catch (err) {
      showError('Failed to update status');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner-small"></div></div>;

  return (
    <div>
      <h2 style={sectionTitleStyle}><FileText size={22} /> Global Registrations Review</h2>
      <p style={sectionSubtitleStyle}>View and moderate all student registration request records globally</p>

      {registrations.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', marginTop: '20px' }}>No registrations logged.</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '24px' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableHeaderStyle}>Student</th>
                <th style={tableHeaderStyle}>Target Club/Event</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Force Override</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg._id} style={tableRowStyle}>
                  <td style={tableCellStyle}>
                    <strong>{reg.userId?.name}</strong>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{reg.userId?.email}</p>
                  </td>
                  <td style={tableCellStyle}>{reg.clubId?.name || reg.eventId?.title} ({reg.clubId ? 'Club' : 'Event'})</td>
                  <td style={tableCellStyle}>
                    <span style={getStatusBadgeStyle(reg.status)}>{reg.status}</span>
                    {reg.status === 'Registered' && (
                      <div style={{ fontSize: '0.7rem', color: '#2ecc71', marginTop: '2px', fontWeight: 'bold' }}>
                        🎟️ Ticket Confirmed
                      </div>
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleUpdateStatus(reg._id, 'Approved')} style={{ ...iconBtnStyle, color: '#2ecc71' }} title="Force Approve"><Check size={14} /></button>
                      <button onClick={() => handleUpdateStatus(reg._id, 'Rejected')} style={{ ...iconBtnStyle, color: '#ff7675' }} title="Force Reject"><X size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   ADMIN: Global Payments Viewer
   ========================================================================== */
const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPayments = async () => {
      try {
        const res = await api.get('/payments');
        if (res.data.success) {
          setPayments(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPayments();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner-small"></div></div>;

  return (
    <div>
      <h2 style={sectionTitleStyle}><CreditCard size={22} /> Global Payment Logs</h2>
      <p style={sectionSubtitleStyle}>Global transaction history audits for all clubs and events</p>

      {payments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', marginTop: '20px' }}>No transaction history found.</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '24px' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableHeaderStyle}>User</th>
                <th style={tableHeaderStyle}>Target Item</th>
                <th style={tableHeaderStyle}>Receipt Amount</th>
                <th style={tableHeaderStyle}>Order ID</th>
                <th style={tableHeaderStyle}>Payment ID</th>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} style={tableRowStyle}>
                  <td style={tableCellStyle}>
                    <strong>{p.userId?.name}</strong>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.userId?.email}</p>
                  </td>
                  <td style={tableCellStyle}>{p.clubId?.name || p.eventId?.title}</td>
                  <td style={{ ...tableCellStyle, color: '#2ecc71', fontWeight: 600 }}>₹{p.amount}</td>
                  <td style={{ ...tableCellStyle, fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>{p.razorpayOrderId}</td>
                  <td style={{ ...tableCellStyle, fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>{p.razorpayPaymentId}</td>
                  <td style={tableCellStyle}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td style={tableCellStyle}>
                    <span style={{ color: p.status === 'Successful' ? '#2ecc71' : '#ff7675', fontWeight: 700, fontSize: '0.85rem' }}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   CSS STYLES & BADGES
   ========================================================================== */
const sectionTitleStyle = {
  fontFamily: 'Outfit',
  fontSize: '1.6rem',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: 'var(--text-primary)'
};

const sectionSubtitleStyle = {
  color: 'var(--text-secondary)',
  fontSize: '0.9rem',
  marginTop: '2px',
  marginBottom: '20px'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  background: 'rgba(15, 48, 87, 0.02)',
  border: '1px solid rgba(15, 48, 87, 0.08)',
  borderRadius: '12px',
  overflow: 'hidden'
};

const tableHeaderRowStyle = {
  background: 'rgba(15, 48, 87, 0.05)',
  borderBottom: '2px solid rgba(15, 48, 87, 0.12)'
};

const tableHeaderStyle = {
  padding: '14px 16px',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#0f3057'
};

const tableRowStyle = {
  borderBottom: '1px solid rgba(15, 48, 87, 0.06)',
  transition: 'background 0.2s'
};

const tableCellStyle = {
  padding: '14px 16px',
  fontSize: '0.9rem',
  color: 'var(--text-primary)',
  verticalAlign: 'middle'
};

const getStatusBadgeStyle = (status) => {
  let bg = 'rgba(15, 48, 87, 0.08)';
  let color = 'var(--text-secondary)';

  if (status === 'Approved' || status === 'Selected' || status === 'Registered') {
    bg = 'rgba(46, 204, 113, 0.15)';
    color = '#2ecc71';
  } else if (status === 'Rejected') {
    bg = 'rgba(231, 76, 60, 0.15)';
    color = '#e74c3c';
  } else if (status === 'Shortlisted') {
    bg = 'rgba(52, 152, 219, 0.15)';
    color = '#3498db';
  } else if (status === 'Pending') {
    bg = 'rgba(241, 196, 15, 0.15)';
    color = '#f1c40f';
  }

  return {
    background: bg,
    color: color,
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    display: 'inline-block'
  };
};

const iconBtnStyle = {
  background: 'rgba(15, 48, 87, 0.04)',
  border: '1px solid rgba(15, 48, 87, 0.12)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '6px'
};

const eventFormModalPanelStyle = {
  width: '90%',
  maxWidth: '500px',
  padding: '30px'
};

const eventFormModalTitleStyle = {
  fontFamily: 'Outfit',
  fontSize: '1.4rem',
  marginBottom: '20px',
  color: 'var(--text-primary)'
};

export default Dashboard;
