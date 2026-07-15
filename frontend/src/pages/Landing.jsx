import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Users, Award, Shield, ChevronRight, Compass, Sparkles, Heart, Info } from 'lucide-react';
import heroImg from '../assets/hero.png';

const Landing = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [activeClubIndex, setActiveClubIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await api.get('/clubs');
        if (res.data.success) {
          setClubs(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching clubs for landing page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const activeClub = clubs[activeClubIndex];

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', background: 'var(--primary-bg)', paddingBottom: '80px' }}>
      
      {/* Background glow effects */}
      <div className="glow-bubble glow-bubble-1"></div>
      <div className="glow-bubble glow-bubble-2"></div>

      {/* Decorative Circles matching College Website screenshots */}
      <div className="deco-circle deco-circle-yellow" style={{ top: '8%', right: '15%', width: '40px', height: '40px' }}></div>
      <div className="deco-circle deco-circle-blue" style={{ top: '35%', left: '8%', width: '32px', height: '32px' }}></div>
      <div className="deco-circle deco-circle-yellow" style={{ bottom: '15%', left: '20%', width: '45px', height: '45px' }}></div>

      {/* TWO COLUMN HERO SECTION TO MATCH REFERENCE SITE */}
      <section 
        style={{
          position: 'relative',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          background: 'transparent',
          borderBottom: '1px solid rgba(15, 48, 87, 0.05)',
          overflow: 'hidden'
        }}
      >
        <div 
          className="hero-split-container"
          style={{ 
            position: 'relative', 
            zIndex: 10, 
            maxWidth: '1200px', 
            margin: '0 auto',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Title, Subtitle, CTA */}
          <div style={{ textAlign: 'left' }} className="animate-fade-in">
            <h1 
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                lineHeight: 1.15,
                fontWeight: 800,
                marginBottom: '20px',
                fontFamily: 'Outfit',
                color: '#0f172a'
              }}
            >
              Welcome to Our <span style={{ color: '#0f3057' }}>Eduevent</span>
              <br />
              <span style={{ color: '#0f172a' }}>Management System</span>
            </h1>

            <p 
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                color: 'var(--text-secondary)',
                marginBottom: '32px',
                lineHeight: 1.6,
                maxWidth: '580px'
              }}
            >
              Empowering student voices through transparent and efficient event coordination at MediCaps University.
            </p>

            <div>
              <Link 
                to="/login" 
                className="btn-primary" 
                style={{ 
                  padding: '14px 34px', 
                  fontSize: '1rem', 
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #0f3057 0%, #8c1d40 100%)',
                  boxShadow: '0 4px 15px rgba(15, 48, 87, 0.2)',
                  fontWeight: '600'
                }}
              >
                Join Club
              </Link>
            </div>
          </div>

          {/* Right Column: Illustration */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              position: 'relative'
            }}
            className="animate-fade-in"
          >
            <img 
              src={`${heroImg}?v=2`} 
              alt="Eduevent illustration" 
              style={{ 
                width: '100%', 
                maxWidth: '520px', 
                height: 'auto',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.05))'
              }} 
            />
          </div>
        </div>
      </section>

      {/* DYNAMIC INTERACTIVE CLUBS SWITCHER */}
      <section id="clubs-section" style={{ padding: '90px 24px 70px 24px', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ display: 'inline-block', marginBottom: '12px', background: 'rgba(15, 48, 87, 0.12)', padding: '4px 14px', borderRadius: '8px', border: '1px solid rgba(15,48,87,0.2)' }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8c1d40', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Discover Our Clubs</p>
            </div>
            <h2 style={{ fontSize: '2.3rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '16px' }}>
              Campus Communities at <span style={{ background: 'var(--text-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Medicaps</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Our clubs host coding tournaments, music gigs, design hackathons, sports events, and literature debates. The unified goal is to cultivate student engagement and leadership across the college.
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '30px'
              }}
              className="club-explorer-layout"
            >
              
              {/* Left Column: Vertical button list */}
              <div 
                className="glass-panel" 
                style={{
                  padding: '20px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  height: 'fit-content'
                }}
              >
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'Outfit', marginBottom: '12px', paddingLeft: '8px' }}>Our Clubs Directory</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {clubs.map((club, idx) => {
                    const isActive = idx === activeClubIndex;
                    return (
                      <button
                        key={club._id}
                        onClick={() => setActiveClubIndex(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          transition: 'all 0.25s',
                          background: isActive ? 'var(--button-gradient)' : 'transparent',
                          color: isActive ? '#ffffff' : 'var(--text-secondary)',
                          boxShadow: isActive ? '0 4px 15px rgba(15, 48, 87, 0.15)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.target.style.background = 'rgba(15, 48, 87, 0.03)';
                            e.target.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.target.style.background = 'transparent';
                            e.target.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        <div 
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: isActive ? '#ffffff' : 'rgba(15, 48, 87, 0.05)',
                            color: isActive ? '#8c1d40' : 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.8rem'
                          }}
                        >
                          {club.name[0]}
                        </div>
                        <span>{club.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active club details layout */}
              {activeClub && (
                <div style={{ position: 'relative' }}>
                  <div className="glass-panel" style={{ padding: '24px 30px', height: '100%' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justify: 'space-between', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {activeClub.logo ? (
                          <img src={activeClub.logo} alt={activeClub.name} style={{ width: '60px', height: '60px', borderRadius: '14px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.08)' }} />
                        ) : (
                          <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'rgba(15, 48, 87, 0.05)', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>{activeClub.name[0]}</div>
                        )}
                        <div>
                          <h3 style={{ fontSize: '1.8rem', fontFamily: 'Outfit', fontWeight: 700 }}>{activeClub.name}</h3>
                          <span style={{ fontSize: '0.72rem', background: 'rgba(15, 48, 87, 0.05)', color: 'var(--text-secondary)', padding: '2px 10px', borderRadius: '10px', fontWeight: 600 }}>{activeClub.category}</span>
                        </div>
                      </div>

                      <Link to={`/clubs/${activeClub._id}`} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 22px', borderRadius: '12px' }}>
                        Join Club <ChevronRight size={16} />
                      </Link>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '1rem', color: '#8c1d40', fontFamily: 'Outfit', marginBottom: '8px' }}>About the Club</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>{activeClub.description}</p>
                    </div>

                    {activeClub.mission && (
                      <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '1rem', color: '#8c1d40', fontFamily: 'Outfit', marginBottom: '6px' }}>Club Mission</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{activeClub.mission}</p>
                      </div>
                    )}

                    {activeClub.pastEvents && activeClub.pastEvents.length > 0 && (
                      <div style={{ borderTop: '1px solid rgba(15, 48, 87, 0.08)', paddingTop: '20px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontFamily: 'Outfit', marginBottom: '14px' }}>Featured Achievements</h4>
                        <ul style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', padding: 0, listStyle: 'none' }}>
                          {activeClub.pastEvents.map((evt, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                              <div style={{ background: 'var(--button-gradient)', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0, marginTop: '2px' }}>
                                <Award size={12} style={{ color: '#fff' }} />
                              </div>
                              <div>
                                <span style={{ fontWeight: 650, fontSize: '0.9rem' }}>{evt.title}</span>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1px' }}>{evt.description}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* WHY CLUB CULTURE MATTERS */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)', borderTop: '1px solid rgba(15, 48, 87, 0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Why Club Culture Matters</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Student-led clubs shape future innovators. Here's why they matter.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', color: '#0f3057', marginBottom: '12px' }}>Peer-to-Peer Learning</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>Students learn best from one another — clubs foster informal, hands-on learning in a safe space.</p>
            </div>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', color: '#8c1d40', marginBottom: '12px' }}>Leadership & Collaboration</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>By organizing events and managing teams, students grow into effective leaders and collaborators.</p>
            </div>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', color: '#0f3057', marginBottom: '12px' }}>Real-World Exposure</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>Tech clubs bridge academics with industry through workshops, hackathons, and guest sessions.</p>
            </div>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', color: '#8c1d40', marginBottom: '12px' }}>Innovation Culture</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>A culture of ideation, prototyping, and building helps students move from consumers to creators.</p>
            </div>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', color: '#0f3057', marginBottom: '12px' }}>Confidence & Communication</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>Public speaking, event planning, and discussions help students build essential soft skills.</p>
            </div>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', color: '#8c1d40', marginBottom: '12px' }}>Community & Belonging</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>A well-knit club culture gives students a strong sense of purpose, identity, and support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(15, 48, 87, 0.08)', background: 'linear-gradient(135deg, #091a2f 0%, #0f3057 100%)', paddingTop: '60px', paddingBottom: '30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <h3 className="gradient-text" style={{ fontSize: '1.4rem', fontFamily: 'Outfit', fontWeight: 800, marginBottom: '16px' }}>Medi-Caps Event Portal</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Empowering students through technology and active community collaborations at Medicaps University. Join us to build, share, and grow together!
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '16px', color: '#f1c40f' }}>Useful Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <Link to="/clubs" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Clubs Directory</Link>
              <Link to="/events" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Campus Calendar</Link>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Student Sign In</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '16px', color: '#f1c40f' }}>Contact Support</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Medicaps University Campus,<br />
              Indore, Madhya Pradesh, India<br />
              Email: support@eduevent.medicaps.edu.in
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
          &copy; {new Date().getFullYear()} Medicaps University Event Portal. Crafted for placement portfolio showcase.
        </div>
      </footer>

      <style>{`
        .club-explorer-layout {
          grid-template-columns: 1fr;
        }
        .hero-split-container {
          grid-template-columns: 1fr;
        }
        @media (min-width: 992px) {
          .club-explorer-layout {
            grid-template-columns: 260px 1fr !important;
          }
          .hero-split-container {
            grid-template-columns: 1.2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
