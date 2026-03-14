import React from 'react';
import { Search, Youtube, Star, Flame, Trophy } from 'lucide-react';

export default function Header({ search, setSearch, stats }) {
  return (
    <header className="fade-in">
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          
          <div>
            <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '8px' }}>
              The Sausage Database
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px' }}>
              A premium collection of everything Ordinary Sausage has ever forced through a grinder, and then some.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <a href="https://www.youtube.com/c/OrdinarySausage/featured" target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Youtube size={20} />
              Visit Channel
            </a>
            <a href="https://www.patreon.com/ordinarysausage" target="_blank" rel="noreferrer" className="btn-secondary">
              Patreon
            </a>
          </div>

        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '40px' }}>
          <StatCard icon={<Trophy color="var(--primary)" />} label="Sausages Made" value={stats.totalSausages} />
          <StatCard icon={<Star color="#fbbf24" />} label="Top Rated (5+)" value={stats.topRated} />
          <StatCard icon={<Flame color="var(--danger)" />} label="Sausage Bursts" value={stats.bursts} />
          <StatCard icon={<Flame color="var(--danger)" />} label="Burst Ratio" value={`${stats.burstRatio}%`} />
        </div>

        {/* Search Bar */}
        <div className="glass" style={{ marginTop: '40px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '600px' }}>
          <Search color="var(--text-muted)" size={20} />
          <input 
            type="text" 
            placeholder="Search those sausages... (e.g. Water, Flavacol)" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '1.1rem',
              width: '100%',
              padding: '8px 0'
            }}
          />
        </div>

      </div>
    </header>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="glass glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        padding: '16px', 
        borderRadius: '50%',
        display: 'flex'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1.2' }}>{value}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      </div>
    </div>
  );
}
