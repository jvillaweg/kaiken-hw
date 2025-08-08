import React, { useState, useEffect } from 'react';
import { Product, TenderForm, MultipleOrderItem } from '../types';
import { tenderApi, productApi, orderApi } from '../api';

interface Props {
  onTenderCreated: () => void;
}

const TenderRegistration: React.FC<Props> = ({ onTenderCreated }) => {
  const [step, setStep] = useState<'tender' | 'products'>('tender');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [tenderForm, setTenderForm] = useState<TenderForm>({
    client: '',
    description: ''
  });
  const [selectedTenderId, setSelectedTenderId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<MultipleOrderItem[]>([]);
  const [currentOrderItem, setCurrentOrderItem] = useState<MultipleOrderItem>({
    product_id: 0,
    awarded_quantity: 1
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productApi.getProducts();
      setProducts(data);
    } catch (err: any) {
      setError('Failed to load products');
    }
  };

  const handleTenderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newTender = await tenderApi.createTender(tenderForm);
      setSelectedTenderId(newTender.id);
      setSuccess('Tender created successfully! Now add products.');
      setStep('products');
    } catch (err: any) {
      setError('Failed to create tender: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductToOrder = () => {
    if (!currentOrderItem.product_id || !selectedTenderId) {
      setError('Please select a product and ensure tender is created');
      return;
    }

    // Check if product is already in the order list
    const existingIndex = orderItems.findIndex(item => item.product_id === currentOrderItem.product_id);
    
    if (existingIndex >= 0) {
      // Update existing item
      const newOrderItems = [...orderItems];
      newOrderItems[existingIndex] = { ...currentOrderItem };
      setOrderItems(newOrderItems);
      setSuccess('Product quantity updated in order!');
    } else {
      // Add new item
      setOrderItems([...orderItems, { ...currentOrderItem }]);
      setSuccess('Product added to order!');
    }

    // Reset current item
    setCurrentOrderItem({ product_id: 0, awarded_quantity: 1 });
  };

  const handleRemoveProductFromOrder = (productId: number) => {
    setOrderItems(orderItems.filter(item => item.product_id !== productId));
    setSuccess('Product removed from order!');
  };

  const handleSubmitAllOrders = async () => {
    if (!selectedTenderId || orderItems.length === 0) {
      setError('Please add at least one product to the order');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create all orders
      for (const item of orderItems) {
        await orderApi.createOrder({
          tender_id: selectedTenderId,
          product_id: item.product_id,
          awarded_quantity: item.awarded_quantity
        });
      }
      
      setSuccess(`Successfully created ${orderItems.length} orders!`);
      setOrderItems([]);
      setCurrentOrderItem({ product_id: 0, awarded_quantity: 1 });
    } catch (err: any) {
      setError('Failed to create orders: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFinishRegistration = () => {
    setTenderForm({ client: '', description: '' });
    setOrderItems([]);
    setCurrentOrderItem({ product_id: 0, awarded_quantity: 1 });
    setSelectedTenderId(null);
    setStep('tender');
    setSuccess(null);
    onTenderCreated();
  };

  const getCurrentProduct = () => {
    return products.find(p => p.id === currentOrderItem.product_id);
  };

  const calculateCurrentMargin = () => {
    const product = getCurrentProduct();
    if (product && currentOrderItem.awarded_quantity > 0) {
      return (product.unit_sale_price - product.unit_cost) * currentOrderItem.awarded_quantity;
    }
    return 0;
  };

  const calculateTotalMargin = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        return total + (product.unit_sale_price - product.unit_cost) * item.awarded_quantity;
      }
      return total;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="card">
      <h2>Register New Tender</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {step === 'tender' && (
        <form onSubmit={handleTenderSubmit}>
          <div className="form-group">
            <label htmlFor="client">Client Name *</label>
            <input
              type="text"
              id="client"
              value={tenderForm.client}
              onChange={(e) => setTenderForm(prev => ({ ...prev, client: e.target.value }))}
              required
              placeholder="Enter client name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={tenderForm.description}
              onChange={(e) => setTenderForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter tender description (optional)"
            />
          </div>

          <button type="submit" className="button success" disabled={loading}>
            {loading ? 'Creating...' : 'Create Tender'}
          </button>
        </form>
      )}

      {step === 'products' && selectedTenderId && (
        <div>
          <h3>Add Products to Tender</h3>
          <p>Tender ID: {selectedTenderId} - {tenderForm.client}</p>

          {/* Current Order Items List */}
          {orderItems.length > 0 && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '5px' }}>
              <h4>Products in Order ({orderItems.length})</h4>
              {orderItems.map((item, index) => {
                const product = products.find(p => p.id === item.product_id);
                if (!product) return null;
                const itemMargin = (product.unit_sale_price - product.unit_cost) * item.awarded_quantity;
                
                return (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: index < orderItems.length - 1 ? '1px solid #ddd' : 'none'
                  }}>
                    <div>
                      <strong>{product.name}</strong> ({product.sku})
                      <br />
                      <small>Qty: {item.awarded_quantity} × {formatCurrency(product.unit_sale_price)} = {formatCurrency(product.unit_sale_price * item.awarded_quantity)} | Margin: {formatCurrency(itemMargin)}</small>
                    </div>
                    <button 
                      type="button" 
                      className="button error" 
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                      onClick={() => handleRemoveProductFromOrder(item.product_id)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
              <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                Total Order Margin: {formatCurrency(calculateTotalMargin())}
              </div>
            </div>
          )}

          {/* Add Product Form */}
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
            <h4>Add Product to Order</h4>
            
            <div className="form-group">
              <label htmlFor="product">Select Product *</label>
              <select
                id="product"
                value={currentOrderItem.product_id}
                onChange={(e) => setCurrentOrderItem(prev => ({ ...prev, product_id: parseInt(e.target.value) }))}
                required
              >
                <option value="">Choose a product...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku}) - Cost: {formatCurrency(product.unit_cost)}, Price: {formatCurrency(product.unit_sale_price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Awarded Quantity *</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={currentOrderItem.awarded_quantity}
                onChange={(e) => setCurrentOrderItem(prev => ({ ...prev, awarded_quantity: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>

            {getCurrentProduct() && (
              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', marginBottom: '15px' }}>
                <h5>Product Preview</h5>
                <div className="grid">
                  <div><strong>Product:</strong> {getCurrentProduct()?.name}</div>
                  <div><strong>Unit Cost:</strong> {formatCurrency(getCurrentProduct()?.unit_cost || 0)}</div>
                  <div><strong>Unit Price:</strong> {formatCurrency(getCurrentProduct()?.unit_sale_price || 0)}</div>
                  <div><strong>Quantity:</strong> {currentOrderItem.awarded_quantity}</div>
                  <div><strong>Total Cost:</strong> {formatCurrency((getCurrentProduct()?.unit_cost || 0) * currentOrderItem.awarded_quantity)}</div>
                  <div><strong>Total Revenue:</strong> {formatCurrency((getCurrentProduct()?.unit_sale_price || 0) * currentOrderItem.awarded_quantity)}</div>
                  <div>
                    <strong>Item Margin:</strong> 
                    <span className={calculateCurrentMargin() >= 0 ? 'margin-positive' : 'margin-negative'}>
                      {formatCurrency(calculateCurrentMargin())}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button 
              type="button" 
              className="button success" 
              onClick={handleAddProductToOrder}
              disabled={!currentOrderItem.product_id}
            >
              {orderItems.find(item => item.product_id === currentOrderItem.product_id) ? 'Update Product' : 'Add Product'}
            </button>
          </div>

          {/* Submit All Orders */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="button success" 
              onClick={handleSubmitAllOrders}
              disabled={loading || orderItems.length === 0}
            >
              {loading ? 'Creating Orders...' : `Submit ${orderItems.length} Order${orderItems.length !== 1 ? 's' : ''}`}
            </button>
            <button type="button" className="button" onClick={handleFinishRegistration}>
              Finish Registration
            </button>
          </div>

          {products.length === 0 && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
              <p><strong>No products available.</strong> You need to create products before adding them to tenders.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TenderRegistration;
