import React, { useState, useMemo } from 'react';

export default function SausageTable({ data }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      // Handle nulls
      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      // Special handling for id (numeric)
      if (sortKey === 'id') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc'); // Default new sorts to desc usually better for id/rating
    }
  };

  const SortIndicator = ({ columnKey }) => {
    if (sortKey !== columnKey) return null;
    return <span style={{ marginLeft: '4px' }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  if (data.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>No sausages found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ paddingBottom: '60px', animationDelay: '0.2s' }}>
      <div className="glass" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th onClick={() => handleSort('id')} style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}>
                #<SortIndicator columnKey="id" />
              </th>
              <th onClick={() => handleSort('type')} style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}>
                Type<SortIndicator columnKey="type" />
              </th>
              <th onClick={() => handleSort('rating')} style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}>
                Rating<SortIndicator columnKey="rating" />
              </th>
              <th onClick={() => handleSort('dibu')} style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}>
                Blow / Burst<SortIndicator columnKey="dibu" />
              </th>
              <th onClick={() => handleSort('song')} style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}>
                Mr. Sausage Sings<SortIndicator columnKey="song" />
              </th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600' }}>
                Video
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 0.2s ease' }} className="table-row-hover">
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{item.id}</td>
                <td style={{ padding: '16px 24px', fontWeight: '500' }}>{item.type}</td>
                <td style={{ padding: '16px 24px' }}>
                  {item.rating && item.rating !== 'N/A' && (
                    <span style={{ 
                      background: item.rating.includes('5/5') || item.rating.includes('6/5') ? 'rgba(251, 191, 36, 0.1)' : 'var(--surface-hover)', 
                      color: item.rating.includes('5/5') || item.rating.includes('6/5') ? '#fbbf24' : 'var(--text-main)',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '600' 
                    }}>
                      {item.rating}
                    </span>
                  )}
                  {(!item.rating || item.rating === 'N/A') && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>N/A</span>
                  )}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  {item.dibu === 1 ? (
                    <span style={{ color: 'var(--danger)', fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>BURST!</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>{item.dibl || 'N/A'}</span>
                  )}
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{item.song}</td>
                <td style={{ padding: '16px 24px' }}>
                  {item.episodeID ? (
                    <a href={`https://www.youtube.com/watch?v=${item.episodeID}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                      Watch
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>{item.episodeLength}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.04);
        }
      `}</style>
    </div>
  );
}
