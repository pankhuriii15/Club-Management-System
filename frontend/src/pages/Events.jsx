import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, MapPin, Calendar, Clock, Compass } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        if (res.data.success) {
          setEvents(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(evt => {
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.clubId?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ padding: '40px 24px', position: 'relative', minHeight: '90vh' }}>
      <div className="glow-bubble glow-bubble-1"></div>
      <div className="glow-bubble glow-bubble-2"></div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', marginBottom: '8px' }} className="gradient-title-text">
            Upcoming Campus Events
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Explore hackathons, workshops, music concerts, and athletic challenges scheduled across campus</p>
        </header>

        {/* Search Bar */}
        <div 
          className="glass-panel"
          style={{
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(15, 48, 87, 0.03)',
            borderRadius: '12px',
            marginBottom: '32px'
          }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search events by title, organizer club, venue, or keywords..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.95rem' }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>No upcoming events matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid-container">
            {filteredEvents.map((evt) => (
              <div 
                key={evt._id} 
                className="glass-card animate-fade-in"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  height: '400px'
                }}
              >
                {/* Event banner image */}
                <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                  {evt.bannerImage ? (
                    <img 
                      src={evt.bannerImage} 
                      alt={evt.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      EduEvent Event
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {evt.clubId?.name}
                  </div>
                </div>

                {/* Event Details */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '10px' }}>{evt.title}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginBottom: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {new Date(evt.date).toLocaleDateString()}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {evt.venue}</span>
                    </div>
                    
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: '20px' }}>
                      {evt.description.length > 110 ? `${evt.description.substring(0, 110)}...` : evt.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                    <Link 
                      to={`/events/${evt._id}`} 
                      className="btn-secondary" 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '36px', 
                        padding: '0 16px', 
                        fontSize: '0.8rem', 
                        borderRadius: '20px',
                        textDecoration: 'none'
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
