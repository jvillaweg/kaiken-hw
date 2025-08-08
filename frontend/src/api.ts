import { 
  Product, 
  Tender, 
  Order, 
  TenderSummary, 
  TenderWithDetails,
  ProductForm,
  TenderForm,
  OrderForm 
} from './types';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = {
  get: async (url: string) => {
    const response = await fetch(`${API_BASE_URL}${url}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { data: await response.json() };
  },
  post: async (url: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { data: await response.json() };
  },
  put: async (url: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { data: await response.json() };
  },
  delete: async (url: string) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { data: {} };
  },
};

// Tender API calls
export const tenderApi = {
  getTendersSummary: async (): Promise<TenderSummary[]> => {
    const response = await api.get('/tenders/');
    return response.data;
  },

  getTenderDetails: async (id: number): Promise<TenderWithDetails> => {
    const response = await api.get(`/tenders/${id}`);
    return response.data;
  },

  createTender: async (tender: TenderForm): Promise<Tender> => {
    const response = await api.post('/tenders/', tender);
    return response.data;
  },

  updateTender: async (id: number, tender: Partial<TenderForm>): Promise<Tender> => {
    const response = await api.put(`/tenders/${id}`, tender);
    return response.data;
  },

  deleteTender: async (id: number): Promise<void> => {
    await api.delete(`/tenders/${id}`);
  },

  validateTender: async (id: number): Promise<{ message: string }> => {
    const response = await api.get(`/tenders/${id}/validate`);
    return response.data;
  },
};

// Product API calls
export const productApi = {
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products/');
    return response.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (product: ProductForm): Promise<Product> => {
    const response = await api.post('/products/', product);
    return response.data;
  },

  updateProduct: async (id: number, product: Partial<ProductForm>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// Order API calls
export const orderApi = {
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders/');
    return response.data;
  },

  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (order: OrderForm): Promise<Order> => {
    const response = await api.post('/orders/', order);
    return response.data;
  },

  updateOrder: async (id: number, order: Partial<OrderForm>): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, order);
    return response.data;
  },

  deleteOrder: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};

// Utility API calls
export const utilApi = {
  seedDatabase: async (): Promise<{ message: string }> => {
    const response = await api.post('/seed-database/', {});
    return response.data;
  },

  healthCheck: async (): Promise<{ status: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};
