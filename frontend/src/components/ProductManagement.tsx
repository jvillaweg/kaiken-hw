import React, { useState, useEffect } from 'react';
import { Product, ProductForm } from '../types';
import { productApi } from '../api';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    sku: '',
    unit_sale_price: 0,
    unit_cost: 0,
    description: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.getProducts();
      setProducts(data);
    } catch (err: any) {
      setError('Failed to load products: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Business rule validation
    if (productForm.unit_sale_price <= productForm.unit_cost) {
      setError('Sale price must be greater than cost');
      setLoading(false);
      return;
    }

    try {
      if (editingProduct) {
        await productApi.updateProduct(editingProduct.id, productForm);
        setSuccess('Product updated successfully!');
      } else {
        await productApi.createProduct(productForm);
        setSuccess('Product created successfully!');
      }
      
      resetForm();
      await loadProducts();
    } catch (err: any) {
      setError('Failed to save product: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku,
      unit_sale_price: product.unit_sale_price,
      unit_cost: product.unit_cost,
      description: product.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await productApi.deleteProduct(productId);
      setSuccess('Product deleted successfully!');
      await loadProducts();
    } catch (err: any) {
      setError('Failed to delete product: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      sku: '',
      unit_sale_price: 0,
      unit_cost: 0,
      description: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateMarginPercentage = (cost: number, price: number) => {
    if (cost === 0) return 0;
    return ((price - cost) / cost * 100);
  };

  if (loading && products.length === 0) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Product Management</h2>
          <button 
            className="button success" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                value={productForm.name}
                onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Enter product name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sku">SKU *</label>
              <input
                type="text"
                id="sku"
                value={productForm.sku}
                onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                required
                placeholder="Enter SKU"
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit_cost">Unit Cost * ($)</label>
              <input
                type="number"
                id="unit_cost"
                step="0.01"
                min="0"
                value={productForm.unit_cost}
                onChange={(e) => setProductForm(prev => ({ ...prev, unit_cost: parseFloat(e.target.value) || 0 }))}
                required
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit_sale_price">Unit Sale Price * ($)</label>
              <input
                type="number"
                id="unit_sale_price"
                step="0.01"
                min="0"
                value={productForm.unit_sale_price}
                onChange={(e) => setProductForm(prev => ({ ...prev, unit_sale_price: parseFloat(e.target.value) || 0 }))}
                required
                placeholder="0.00"
              />
              {productForm.unit_cost > 0 && productForm.unit_sale_price > 0 && (
                <small style={{ color: productForm.unit_sale_price > productForm.unit_cost ? '#28a745' : '#dc3545' }}>
                  Margin: {formatCurrency(productForm.unit_sale_price - productForm.unit_cost)} 
                  ({calculateMarginPercentage(productForm.unit_cost, productForm.unit_sale_price).toFixed(1)}%)
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description (optional)"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="button success" disabled={loading}>
                {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
              </button>
              <button type="button" className="button" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <h3>Products List</h3>
        {products.length === 0 ? (
          <p>No products found. Create your first product to get started.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Unit Cost</th>
                  <th>Unit Price</th>
                  <th>Margin</th>
                  <th>Margin %</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      {product.description && <br />}
                      {product.description && <small>{product.description}</small>}
                    </td>
                    <td>{product.sku}</td>
                    <td>{formatCurrency(product.unit_cost)}</td>
                    <td>{formatCurrency(product.unit_sale_price)}</td>
                    <td>
                      <span 
                        className={product.unit_sale_price - product.unit_cost >= 0 ? 'margin-positive' : 'margin-negative'}
                      >
                        {formatCurrency(product.unit_sale_price - product.unit_cost)}
                      </span>
                    </td>
                    <td>
                      <span 
                        className={product.unit_sale_price - product.unit_cost >= 0 ? 'margin-positive' : 'margin-negative'}
                      >
                        {calculateMarginPercentage(product.unit_cost, product.unit_sale_price).toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <button 
                        className="button" 
                        onClick={() => handleEdit(product)}
                        style={{ marginRight: '5px' }}
                      >
                        Edit
                      </button>
                      <button 
                        className="button danger" 
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
