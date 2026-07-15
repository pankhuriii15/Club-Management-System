import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Calendar, Clock, MapPin, Compass, ChevronLeft, Award } from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regStatus, setRegStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.data);
      }

      // Check current registration status if logged in
      if (user && user.role === 'student') {
        const regRes = await api.get('/registrations');
        if (regRes.data.success) {
          const match = regRes.data.data.find(r => r.eventId?._id === id);
          if (match) {
            setRegStatus(match.status);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      showError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, user]);

  const handleRegister = async () => {
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

    try {
      const res = await api.post('/registerEvent', { eventId: event._id });
      if (res.data.success) {
        showSuccess('Registration request created! Confirmation email sent.');
        setRegStatus(res.data.data?.status || 'Registered');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Error registering for event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><div className="spinner"></div></div>;
  if (!event) return <div style={{ padding: '40px', textAlign: 'center' }}><h3>Event Not Found</h3></div>;

  return (
    <div style={{ padding: '40px 24px', position: 'relative', minHeight: '90vh' }}>
      <div className="glow-bubble glow-bubble-1"></div>
      <div className="glow-bubble glow-bubble-2"></div>

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Back link */}
        <Link 
          to="/events" 
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
          <ChevronLeft size={16} /> Back to events
        </Link>

        {/* Hero banner card */}
        <section className="glass-panel" style={{ overflow: 'hidden', borderRadius: '16px', marginBottom: '32px' }}>
          <div style={{ height: '280px', position: 'relative' }}>
            {event.bannerImage ? (
              <img src={event.bannerImage} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                EduEvent scheduled
              </div>
            )}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', padding: '6px 16px', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.85rem', color: '#e0c3fc', fontWeight: 600 }}>Organized by</p>
              <h4 style={{ fontSize: '1.05rem', fontFamily: 'Outfit', fontWeight: 700 }}>{event.clubId?.name}</h4>
            </div>
          </div>

          <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', marginBottom: '12px' }}>{event.title}</h1>
                
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {event.venue}</span>
                </div>
              </div>

              <div>
                {regStatus ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span style={statusBadgeStyle(regStatus)}>{regStatus}</span>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>My Ticket Status</p>
                  </div>
                ) : (
                  <button 
                    onClick={handleRegister} 
                    className="btn-primary" 
                    disabled={submitting}
                    style={{ padding: '12px 28px' }}
                  >
                    {submitting ? (
                      <span className="spinner-small"></span>
                    ) : (
                      'Register for Event'
                    )}
                  </button>
                )}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '24px 0' }} />

            <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit', marginBottom: '8px' }}>Event Description</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{event.description}</p>
          </div>
        </section>

        {/* Gallery */}
        {event.galleryImages && event.galleryImages.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} style={{ color: '#e0c3fc' }} /> Event Gallery
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {event.galleryImages.map((imgUrl, i) => (
                <img 
                  key={i} 
                  src={imgUrl} 
                  alt="Event highlight" 
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.03)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          </section>
        )}
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
  } else if (status === 'Shortlisted') {
    bg = '#3498db';
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

export default EventDetails;
