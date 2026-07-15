import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Calendar, Users, Award, Shield, User, Mail, Phone, ChevronLeft, Clock, MapPin } from 'lucide-react';

const ClubDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regStatus, setRegStatus] = useState(''); // '', 'Pending', 'Approved', 'Rejected'
  const [submitting, setSubmitting] = useState(false);



  // Club events and registrations
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);



  const fetchClubDetails = async () => {
    try {
      const res = await api.get(`/clubs/${id}`);
      if (res.data.success) {
        setClub(res.data.data);
      }

      // Fetch events for this club
      const eventsRes = await api.get(`/events?clubId=${id}`);
      if (eventsRes.data.success) {
        setEvents(eventsRes.data.data);
      }
      
      // If user is student, lookup their current registration status for this club and events
      if (user && user.role === 'student') {
        const regRes = await api.get('/registrations');
        if (regRes.data.success) {
          setRegistrations(regRes.data.data);
          const match = regRes.data.data.find(r => r.clubId?._id === id);
          if (match) {
            setRegStatus(match.status);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching club details:', err);
      showError('Failed to load club details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubDetails();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      showWarning('Please login first to register for this club.');
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      showWarning('Only students can register for clubs.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/registerClub', { 
        clubId: club._id,
        applicationDetails: {
          reason: 'Apply to Join Request',
          skills: 'N/A'
        }
      });
      if (res.data.success) {
        showSuccess('Registration request submitted! Confirmation email sent.');
        setRegStatus('Pending');
        fetchClubDetails();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Registration request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterEvent = async (eventToReg) => {
    if (!user) {
      showWarning('Please login first to register for this event.');
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      showWarning('Only students can register for events.');
      return;
    }

    setSubmitting(true);
    setActiveEvent(eventToReg);

    try {
      const res = await api.post('/registerEvent', { eventId: eventToReg._id });
      if (res.data.success) {
        showSuccess('Registration request created! Confirmation email sent.');
        await fetchClubDetails();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Registration request failed');
    } finally {
      setSubmitting(false);
      setActiveEvent(null);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><div className="spinner"></div></div>;
  if (!club) return <div style={{ padding: '40px', textAlign: 'center' }}><h3>Club Not Found</h3></div>;

  return (
    <div style={{ padding: '40px 24px', position: 'relative', minHeight: '90vh' }}>
      <div className="glow-bubble glow-bubble-1"></div>
      <div className="glow-bubble glow-bubble-2"></div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Back Link */}
        <Link 
          to="/clubs" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            color: 'var(--text-secondary)', 
            textDecoration: 'none', 
            fontWeight: 600, 
            marginBottom: '24px',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#8c1d40'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <ChevronLeft size={16} /> Back to explore
        </Link>

        {/* Club Heading card */}
        <section className="glass-panel" style={{ padding: '36px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              {club.logo ? (
                <img src={club.logo} alt={club.name} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '2rem' }}>
                  {club.name[0]}
                </div>
              )}
              <div>
                <h1 style={{ fontSize: '2.2rem', fontFamily: 'Outfit', marginBottom: '4px' }}>{club.name}</h1>
                <span style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 600 }}>
                  {club.category}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginLeft: '12px' }}>
                  Est: {new Date(club.establishedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>

            {/* Registration Action button */}
            <div>
              {regStatus ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={statusBadgeStyle(regStatus)}>{regStatus}</span>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Application Status</p>
                </div>
              ) : (
                <button 
                  onClick={handleRegister} 
                  className="btn-primary" 
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {submitting && !activeEvent ? (
                    <span className="spinner-small"></span>
                  ) : (
                    <>
                      <Users size={18} /> 
                      Apply to Join Club
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit', marginBottom: '8px' }}>About the Community</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{club.description}</p>
          
          {club.qualificationCriteria && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit', marginBottom: '8px', color: '#e0c3fc' }}>Qualification / Entry Criteria</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{club.qualificationCriteria}</p>
            </div>
          )}
        </section>

        {/* Mission and Vision Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {club.mission && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontFamily: 'Outfit', color: '#e0c3fc', marginBottom: '10px', fontSize: '1.15rem' }}>Our Mission</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{club.mission}</p>
            </div>
          )}
          {club.vision && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontFamily: 'Outfit', color: '#e0c3fc', marginBottom: '10px', fontSize: '1.15rem' }}>Our Vision</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{club.vision}</p>
            </div>
          )}
        </div>

        {/* Leadership slots */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} style={{ color: '#e0c3fc' }} /> Club Leadership
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* President */}
            {club.president?.name ? (
              <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                {club.president.photo ? (
                  <img src={club.president.photo} alt={club.president.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(15, 48, 87, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#0f3057' }}>P</div>
                )}
                <div>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{club.president.name}</h4>
                  <p style={{ fontSize: '0.78rem', color: '#8c1d40', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>President</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} style={{ color: '#0f3057' }} /> {club.president.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} style={{ color: '#0f3057' }} /> {club.president.contact}</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Vice President */}
            {club.vicePresident?.name ? (
              <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                {club.vicePresident.photo ? (
                  <img src={club.vicePresident.photo} alt={club.vicePresident.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(15, 48, 87, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#0f3057' }}>VP</div>
                )}
                <div>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{club.vicePresident.name}</h4>
                  <p style={{ fontSize: '0.78rem', color: '#8c1d40', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Vice President</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} style={{ color: '#0f3057' }} /> {club.vicePresident.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} style={{ color: '#0f3057' }} /> {club.vicePresident.contact}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Dynamic Events section */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} style={{ color: '#e0c3fc' }} /> Club Events & Schedule
          </h2>

          {/* Upcoming Events Subsection */}
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit', marginBottom: '16px', color: '#e0c3fc', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
            Upcoming & Future Events
          </h3>
          {events.filter(evt => new Date(evt.date) >= new Date()).length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '32px' }}>No upcoming events scheduled for this club.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              {events.filter(evt => new Date(evt.date) >= new Date()).map(evt => {
                const status = registrations.find(r => r.eventId?._id === evt._id)?.status || '';
                const canRegister = !user || user.role === 'student';
                return (
                  <div 
                    key={evt._id} 
                    className="glass-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      height: '400px'
                    }}
                  >
                    <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                      {evt.bannerImage ? (
                        <img src={evt.bannerImage} alt={evt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          EduEvent Event
                        </div>
                      )}

                    </div>

                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '1.15rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '10px' }}>{evt.title}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '14px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={13} /> {new Date(evt.date).toLocaleDateString()}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={13} /> {new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={13} /> {evt.venue}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: '20px' }}>
                          {evt.description.length > 100 ? `${evt.description.substring(0, 100)}...` : evt.description}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                        <Link 
                          to={`/events/${evt._id}`} 
                          className="btn-secondary" 
                          style={{ 
                            flex: 1, 
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '36px', 
                            padding: '0 8px', 
                            fontSize: '0.75rem', 
                            borderRadius: '20px', 
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                            boxSizing: 'border-box'
                          }}
                        >
                          View Details
                        </Link>
                        {canRegister && (
                          status ? (
                            <span style={{ 
                              ...statusBadgeStyle(status), 
                              flex: 1, 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '36px', 
                              padding: '0 8px', 
                              fontSize: '0.75rem', 
                              borderRadius: '20px',
                              whiteSpace: 'nowrap',
                              boxSizing: 'border-box'
                            }}>
                              {status}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRegisterEvent(evt)}
                              className="btn-primary"
                              disabled={submitting}
                              style={{ 
                                flex: 1, 
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '36px', 
                                padding: '0 8px', 
                                fontSize: '0.75rem', 
                                borderRadius: '20px', 
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                boxSizing: 'border-box'
                              }}
                            >
                              {submitting && activeEvent?._id === evt._id ? (
                                <span className="spinner-small"></span>
                              ) : (
                                'Register'
                              )}
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

          {/* Past Events Subsection */}
          {events.filter(evt => new Date(evt.date) < new Date()).length > 0 && (
            <>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit', marginBottom: '16px', color: '#a0a0a0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                Past Events
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {events.filter(evt => new Date(evt.date) < new Date()).map(evt => {
                  const status = registrations.find(r => r.eventId?._id === evt._id)?.status || '';
                  const canRegister = !user || user.role === 'student';
                  return (
                    <div 
                      key={evt._id} 
                      className="glass-card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        height: '400px',
                        opacity: 0.8
                      }}
                    >
                      <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                        {evt.bannerImage ? (
                          <img src={evt.bannerImage} alt={evt.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            EduEvent Event
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ fontSize: '1.15rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '10px' }}>{evt.title}</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '14px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={13} /> {new Date(evt.date).toLocaleDateString()}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={13} /> {new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={13} /> {evt.venue}</span>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: '20px' }}>
                            {evt.description.length > 100 ? `${evt.description.substring(0, 100)}...` : evt.description}
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                          <Link 
                            to={`/events/${evt._id}`} 
                            className="btn-secondary" 
                            style={{ 
                              flex: 1, 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '36px', 
                              padding: '0 8px', 
                              fontSize: '0.75rem', 
                              borderRadius: '20px', 
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                              boxSizing: 'border-box'
                            }}
                          >
                            View Details
                          </Link>
                          {canRegister && (
                            status ? (
                              <span style={{ 
                                ...statusBadgeStyle(status), 
                                flex: 1, 
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '36px', 
                                padding: '0 8px', 
                                fontSize: '0.75rem', 
                                borderRadius: '20px',
                                whiteSpace: 'nowrap',
                                boxSizing: 'border-box'
                              }}>
                                {status}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRegisterEvent(evt)}
                                className="btn-primary"
                                disabled={submitting}
                                style={{ 
                                  flex: 1, 
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: '36px', 
                                  padding: '0 8px', 
                                  fontSize: '0.75rem', 
                                  borderRadius: '20px', 
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  boxSizing: 'border-box'
                                }}
                              >
                                {submitting && activeEvent?._id === evt._id ? (
                                  <span className="spinner-small"></span>
                                ) : (
                                  'Register'
                                )}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>


      </div>


    </div>
  );
};

const statusBadgeStyle = (status) => {
  let bg = 'rgba(255,255,255,0.1)';
  let color = '#fff';
  if (status === 'Approved' || status === 'Selected' || status === 'Registered') {
    bg = '#2ecc71';
    color = '#fff';
  } else if (status === 'Pending') {
    bg = '#f1c40f';
    color = '#fff';
  } else if (status === 'Rejected') {
    bg = '#e74c3c';
    color = '#fff';
  }

  return {
    background: bg,
    color: color,
    padding: '6px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    textTransform: 'capitalize',
    display: 'inline-block'
  };
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.65)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
};

export default ClubDetails;
