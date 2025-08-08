import React, { useState, useEffect, useCallback } from 'react';
import { TenderWithDetails } from '../types';
import { tenderApi } from '../api';

interface Props {
  tenderId: number;
}

const TenderDetails: React.FC<Props> = (props: Props) => {
  const { tenderId } = props;
  const [tender, setTender] = useState<TenderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenderDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tenderApi.getTenderDetails(tenderId);
      setTender(data);
    } catch (err: any) {
      setError('Failed to load tender details: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  }, [tenderId]);

  useEffect(() => {
    loadTenderDetails();
  }, [loadTenderDetails]);
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
    return <div className="loading">Loading tender details...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button className="button" onClick={loadTenderDetails}>
          Retry
        </button>
      </div>
    );
  }

  if (!tender) {
    return <div className="error">Tender not found</div>;
  }

  return (
    <div>
      <div className="card">
        <h2>Tender Details</h2>
        <div className="grid">
          <div>
            <strong>ID:</strong> {tender.id}
          </div>
          <div>
            <strong>Client:</strong> {tender.client}
          </div>
          <div>
            <strong>Award Date:</strong> {formatDate(tender.award_date)}
          </div>
          <div>
            <strong>Total Margin:</strong>
            <span 
              className={tender.total_margin >= 0 ? 'margin-positive' : 'margin-negative'}
            >
              {formatCurrency(tender.total_margin)}
            </span>
          </div>
        </div>
        {tender.description && (
          <div style={{ marginTop: '15px' }}>
            <strong>Description:</strong>
            <p>{tender.description}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Committed Products</h3>
        {tender.orders.length === 0 ? (
          <p>No products committed to this tender.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Unit Cost</th>
                  <th>Unit Sale Price</th>
                  <th>Quantity</th>
                  <th>Total Cost</th>
                  <th>Total Revenue</th>
                  <th>Margin</th>
                </tr>
              </thead>
              <tbody>
                {tender.orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.product.name}</td>
                    <td>{order.product.sku}</td>
                    <td>{formatCurrency(order.product.unit_cost)}</td>
                    <td>{formatCurrency(order.product.unit_sale_price)}</td>
                    <td>{order.awarded_quantity}</td>
                    <td>{formatCurrency(order.product.unit_cost * order.awarded_quantity)}</td>
                    <td>{formatCurrency(order.product.unit_sale_price * order.awarded_quantity)}</td>
                    <td>
                      <span 
                        className={order.margin >= 0 ? 'margin-positive' : 'margin-negative'}
                      >
                        {formatCurrency(order.margin)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tender.orders.length > 0 && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <h4>Product Summary</h4>
            <div className="grid">
              <div>
                <strong>Total Products:</strong> {tender.orders.length}
              </div>
              <div>
                <strong>Total Quantity:</strong> {tender.orders.reduce((sum, order) => sum + order.awarded_quantity, 0)}
              </div>
              <div>
                <strong>Total Cost:</strong> 
                {formatCurrency(tender.orders.reduce((sum, order) => sum + (order.product.unit_cost * order.awarded_quantity), 0))}
              </div>
              <div>
                <strong>Total Revenue:</strong> 
                {formatCurrency(tender.orders.reduce((sum, order) => sum + (order.product.unit_sale_price * order.awarded_quantity), 0))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderDetails;
