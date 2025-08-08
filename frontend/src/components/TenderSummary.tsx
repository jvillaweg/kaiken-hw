import React from 'react';
import { TenderSummary as TenderSummaryType } from '../types';

interface Props {
  tenders: TenderSummaryType[];
  loading: boolean;
  error: string | null;
  onTenderSelect: (tenderId: number) => void;
  onRefresh: () => void;
}

const TenderSummary: React.FC<Props> = ({ 
  tenders, 
  loading, 
  error, 
  onTenderSelect, 
  onRefresh 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading tenders...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button className="button" onClick={onRefresh}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Tender Summary</h2>
        <button className="button" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {tenders.length === 0 ? (
        <p>No tenders found. Create your first tender to get started.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Award Date</th>
                <th>Products</th>
                <th>Total Margin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenders.map((tender) => (
                <tr key={tender.id}>
                  <td>{tender.id}</td>
                  <td>{tender.client}</td>
                  <td>{formatDate(tender.award_date)}</td>
                  <td>{tender.product_count}</td>
                  <td>
                    <span 
                      className={tender.total_margin >= 0 ? 'margin-positive' : 'margin-negative'}
                    >
                      {formatCurrency(tender.total_margin)}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="button" 
                      onClick={() => onTenderSelect(tender.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tenders.length > 0 && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
          <h3>Summary Statistics</h3>
          <div className="grid">
            <div>
              <strong>Total Tenders:</strong> {tenders.length}
            </div>
            <div>
              <strong>Total Products:</strong> {tenders.reduce((sum, t) => sum + t.product_count, 0)}
            </div>
            <div>
              <strong>Total Margin:</strong> 
              <span 
                className={tenders.reduce((sum, t) => sum + t.total_margin, 0) >= 0 ? 'margin-positive' : 'margin-negative'}
              >
                {formatCurrency(tenders.reduce((sum, t) => sum + t.total_margin, 0))}
              </span>
            </div>
            <div>
              <strong>Average Margin:</strong> 
              {formatCurrency(tenders.reduce((sum, t) => sum + t.total_margin, 0) / tenders.length)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderSummary;
