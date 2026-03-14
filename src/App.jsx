import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import SausageTable from './components/SausageTable';
import sausagesRaw from './data/sausages.json';
import nseRaw from './data/nse.json';
import './index.css';

function App() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('sausages'); // 'sausages' | 'nse'

  // Reverse so newest are at the top
  const sausages = useMemo(() => [...sausagesRaw].reverse(), []);
  const nses = useMemo(() => [...nseRaw].reverse(), []);

  const stats = useMemo(() => {
    let bursts = 0;
    let topRated = 0;
    sausages.forEach(s => {
      if (s.dibu === 1) bursts++;
      if (s.rating && (s.rating.includes('5/5') || s.rating.includes('6/5'))) topRated++;
    });
    return {
      totalSausages: sausages.length,
      topRated,
      bursts,
      burstRatio: ((bursts / sausages.length) * 100).toFixed(1)
    };
  }, [sausages]);

  const displayedData = useMemo(() => {
    const list = activeTab === 'sausages' ? sausages : nses;
    if (!search) return list;
    const lower = search.toLowerCase();
    return list.filter(item => 
      (item.type && item.type.toLowerCase().includes(lower)) || 
      (item.song && item.song.toLowerCase().includes(lower)) ||
      (item.episode && item.episode.toLowerCase().includes(lower))
    );
  }, [activeTab, search, sausages, nses]);

  return (
    <>
      <Header search={search} setSearch={setSearch} stats={stats} />
      
      <div className="container fade-in" style={{ marginBottom: '24px', display: 'flex', gap: '16px', animationDelay: '0.1s' }}>
        <button 
          className={activeTab === 'sausages' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('sausages')}
        >
          Sausages Fast Grid
        </button>
        <button 
          className={activeTab === 'nse' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('nse')}
        >
          Non-Sausage Episodes (NSE)
        </button>
      </div>

      <SausageTable data={displayedData} />
    </>
  );
}

export default App;
