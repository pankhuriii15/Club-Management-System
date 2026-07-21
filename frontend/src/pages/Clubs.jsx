import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Filter, Compass } from 'lucide-react';

const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await api.get('/clubs');
        if (res.data.success) {
          setClubs(res.data.data);

          // Dynamically compute unique categories for the dropdown selector filter
          const cats = ['All', ...new Set(res.data.data.map(c => c.category))];
          setCategories(cats);
        }
      } catch (err) {
        console.error('Error fetching clubs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  // Filter lists based on search terms and category
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '40px 24px', position: 'relative', minHeight: '90vh' }}>
      <div className="glow-bubble glow-bubble-1"></div>
      <div className="glow-bubble glow-bubble-2"></div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', marginBottom: '8px' }} className="gradient-title-text">
            Explore Student Communities
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Find your tribe, develop new skills, and represent your campus</p>
        </header>

        {/* Filter bars */}
        <div
          className="glass-panel"
          style={{
            padding: '16px 24px',
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '32px'
          }}
        >
          <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 48, 87, 0.03)', borderRadius: '10px', padding: '2px 14px', border: '1px solid var(--panel-border)' }}>
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search clubs by name or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', padding: '10px 0' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
            <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input"
              style={{ appearance: 'none', padding: '10px 16px', borderRadius: '10px', background: 'rgba(15, 48, 87, 0.03)', border: '1px solid var(--panel-border)', color: 'var(--text-primary)' }}
            >
              {categories.map((cat, i) => (
                <option key={i} value={cat} style={{ color: '#000000' }}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner"></div>
          </div>
        ) : filteredClubs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>No clubs matching your criteria were found.</p>
          </div>
        ) : (
          <div className="grid-container">
            {filteredClubs.map((club) => (
              <div
                key={club._id}
                className="glass-card animate-fade-in"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '300px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    {club.logo ? (
                      <img
                        src={club.logo}
                        alt={club.name}
                        style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    ) : (
                      <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {club.name[0]}
                      </div>
                    )}
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Outfit' }}>{club.name}</h3>
                      <span
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em'
                        }}
                      >
                        {club.category}
                      </span>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
                    {club.description.length > 140 ? `${club.description.substring(0, 140)}...` : club.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                  <Link
                    to={`/clubs/${club._id}`}
                    className="btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '36px',
                      padding: '0 16px',
                      fontSize: '0.82rem',
                      borderRadius: '20px',
                      textDecoration: 'none'
                    }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clubs;
