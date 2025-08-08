import React from 'react';
import { TenderSummary } from '../types';

interface Props {
  tenders: TenderSummary[];
}

const MarginChart: React.FC<Props> = ({ tenders }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalMargin = () => {
    return tenders.reduce((total, tender) => total + tender.total_margin, 0);
  };

  const getAverageMargin = () => {
    if (tenders.length === 0) return 0;
    return getTotalMargin() / tenders.length;
  };

  const getMarginDistribution = () => {
    const positive = tenders.filter(t => t.total_margin > 0);
    const negative = tenders.filter(t => t.total_margin < 0);
    const zero = tenders.filter(t => t.total_margin === 0);

    return {
      positive: positive.length,
      negative: negative.length,
      zero: zero.length,
      positiveValue: positive.reduce((sum, t) => sum + t.total_margin, 0),
      negativeValue: negative.reduce((sum, t) => sum + t.total_margin, 0)
    };
  };

  const getTopPerformingTenders = () => {
    return [...tenders]
      .sort((a, b) => b.total_margin - a.total_margin)
      .slice(0, 5);
  };

  const getWorstPerformingTenders = () => {
    return [...tenders]
      .sort((a, b) => a.total_margin - b.total_margin)
      .slice(0, 5);
  };

  const distribution = getMarginDistribution();
  const topTenders = getTopPerformingTenders();
  const worstTenders = getWorstPerformingTenders();

  return (
    <div>
      <div className="card">
        <h2>Margin Analysis</h2>
        
        {tenders.length === 0 ? (
          <p>No tender data available for analysis.</p>
        ) : (
          <div>
            {/* Summary Statistics */}
            <div className="grid" style={{ marginBottom: '30px' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <h3>Total Margin</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  <span className={getTotalMargin() >= 0 ? 'margin-positive' : 'margin-negative'}>
                    {formatCurrency(getTotalMargin())}
                  </span>
                </div>
              </div>
              
              <div className="card" style={{ textAlign: 'center' }}>
                <h3>Average Margin</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  <span className={getAverageMargin() >= 0 ? 'margin-positive' : 'margin-negative'}>
                    {formatCurrency(getAverageMargin())}
                  </span>
                </div>
              </div>
              
              <div className="card" style={{ textAlign: 'center' }}>
                <h3>Total Tenders</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
                  {tenders.length}
                </div>
              </div>
              
              <div className="card" style={{ textAlign: 'center' }}>
                <h3>Total Products</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
                  {tenders.reduce((sum, t) => sum + t.product_count, 0)}
                </div>
              </div>
            </div>

            {/* Margin Distribution */}
            <div className="card" style={{ marginBottom: '30px' }}>
              <h3>Margin Distribution</h3>
              <div className="grid">
                <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px' }}>
                  <h4 style={{ color: '#155724', margin: '0 0 10px 0' }}>Profitable Tenders</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                    {distribution.positive} ({((distribution.positive / tenders.length) * 100).toFixed(1)}%)
                  </div>
                  <div style={{ color: '#28a745', fontWeight: 'bold' }}>
                    {formatCurrency(distribution.positiveValue)}
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8d7da', borderRadius: '8px' }}>
                  <h4 style={{ color: '#721c24', margin: '0 0 10px 0' }}>Loss-Making Tenders</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                    {distribution.negative} ({((distribution.negative / tenders.length) * 100).toFixed(1)}%)
                  </div>
                  <div style={{ color: '#dc3545', fontWeight: 'bold' }}>
                    {formatCurrency(distribution.negativeValue)}
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                  <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>Break-even Tenders</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#856404' }}>
                    {distribution.zero} ({((distribution.zero / tenders.length) * 100).toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performing Tenders */}
            {topTenders.length > 0 && (
              <div className="card" style={{ marginBottom: '30px' }}>
                <h3>Top Performing Tenders</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Client</th>
                        <th>Products</th>
                        <th>Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topTenders.map((tender, index) => (
                        <tr key={tender.id}>
                          <td>#{index + 1}</td>
                          <td>{tender.client}</td>
                          <td>{tender.product_count}</td>
                          <td>
                            <span className={tender.total_margin >= 0 ? 'margin-positive' : 'margin-negative'}>
                              {formatCurrency(tender.total_margin)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Worst Performing Tenders */}
            {worstTenders.length > 0 && worstTenders[0].total_margin < 0 && (
              <div className="card">
                <h3>Worst Performing Tenders</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Client</th>
                        <th>Products</th>
                        <th>Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {worstTenders.filter(t => t.total_margin < 0).map((tender, index) => (
                        <tr key={tender.id}>
                          <td>#{index + 1}</td>
                          <td>{tender.client}</td>
                          <td>{tender.product_count}</td>
                          <td>
                            <span className="margin-negative">
                              {formatCurrency(tender.total_margin)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Simple Visual Bar Chart */}
            <div className="card">
              <h3>Tender Margins Visualization</h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {tenders.map((tender) => {
                  const maxAbsMargin = Math.max(...tenders.map(t => Math.abs(t.total_margin)));
                  const barWidth = maxAbsMargin > 0 ? Math.abs(tender.total_margin) / maxAbsMargin * 100 : 0;
                  
                  return (
                    <div key={tender.id} style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 'bold' }}>{tender.client}</span>
                        <span className={tender.total_margin >= 0 ? 'margin-positive' : 'margin-negative'}>
                          {formatCurrency(tender.total_margin)}
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '20px', 
                        backgroundColor: '#e9ecef', 
                        borderRadius: '10px',
                        overflow: 'hidden'
                      }}>
                        <div
                          style={{
                            width: `${barWidth}%`,
                            height: '100%',
                            backgroundColor: tender.total_margin >= 0 ? '#28a745' : '#dc3545',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarginChart;
