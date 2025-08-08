# Bid Management System

A comprehensive full-stack application for managing commercial tenders, products, and orders with margin calculations and visualization capabilities.

## 🚀 Features

### Backend (FastAPI)
- **RESTful API** with full CRUD operations for tenders, products, and orders
- **Business Logic Validation**:
  - Sale price must be greater than cost
  - No tender registration without products
  - Automatic margin calculation: `(price - cost) * quantity`
- **PostgreSQL Database** with proper relationships
- **Data Seeding** from external sample endpoints
- **Comprehensive Error Handling** and validation

### Frontend (React TypeScript)
- **Tender Summary View** with margin calculations
- **Detailed Tender View** showing all committed products
- **Tender Registration** with multi-step form
- **Product Management** with CRUD operations
- **Margin Analysis Dashboard** with visual charts
- **Responsive Design** with modern UI

### Database Schema
- **Tenders**: id, client, award_date, description
- **Products**: id, name, sku, unit_sale_price, unit_cost, description
- **Orders**: id, tender_id, product_id, awarded_quantity

## 📋 Prerequisites

Choose one of the following options:

### Option 1: Docker (Recommended)
- Docker Desktop installed
- Docker Compose available

### Option 2: Local Development
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Clone and Navigate**
   ```bash
   cd C:\Users\chupe\OneDrive\Desktop\keiken
   ```

2. **Start All Services**
   ```bash
   docker-compose up --build
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Local Development

#### Backend Setup
1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup PostgreSQL Database**
   - Create database named `bidmanagement`
   - Update `.env` file with your database credentials

5. **Run the backend**
   ```bash
   python main.py
   ```

#### Frontend Setup
1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## 🎯 Usage Guide

### 1. First Time Setup
- The system automatically seeds sample data on startup
- Navigate to http://localhost:3000 to access the application

### 2. Managing Products
- Go to "Manage Products" to create/edit products
- Ensure sale price > cost (system enforces this rule)
- Products are required before creating tenders

### 3. Creating Tenders
- Use "Register Tender" to create new tenders
- First create the tender, then add products
- System prevents empty tenders (business rule)

### 4. Viewing Analytics
- "Tender Summary" shows all tenders with margins
- "Margin Analysis" provides detailed charts and statistics
- Click "View Details" on any tender for complete information

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │◄──►│  FastAPI Backend │◄──►│ PostgreSQL DB   │
│   (Port 3000)   │    │   (Port 8000)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Business Rules

1. **Product Validation**: Sale price must exceed cost
2. **Tender Validation**: Cannot register tender without products
3. **Margin Calculation**: `(unit_sale_price - unit_cost) × quantity`
4. **Data Integrity**: Foreign key constraints ensure valid relationships

## 🛠️ API Endpoints

### Tenders
- `GET /tenders/` - Get tender summaries with margins
- `GET /tenders/{id}` - Get detailed tender information
- `POST /tenders/` - Create new tender
- `PUT /tenders/{id}` - Update tender
- `DELETE /tenders/{id}` - Delete tender

### Products
- `GET /products/` - Get all products
- `POST /products/` - Create new product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Orders
- `GET /orders/` - Get all orders
- `POST /orders/` - Create new order
- `PUT /orders/{id}` - Update order
- `DELETE /orders/{id}` - Delete order

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `REACT_APP_API_URL`: Backend API URL for frontend

### Sample Data Sources
The system fetches initial data from:
- Tenders: https://kaiken.up.railway.app/webhook/tender-sample
- Products: https://kaiken.up.railway.app/webhook/product-sample
- Orders: https://kaiken.up.railway.app/webhook/order-sample

## 🧪 Testing

### Manual Testing
1. Start the application
2. Create products with various cost/price combinations
3. Create tenders and add products
4. Verify margin calculations
5. Test business rule validations

### API Testing
- Visit http://localhost:8000/docs for interactive API documentation
- Use the built-in Swagger UI to test all endpoints

## 🛡️ Error Handling

The system includes comprehensive error handling:
- **Frontend**: User-friendly error messages and validation
- **Backend**: Detailed error responses with proper HTTP status codes
- **Database**: Constraint validation and transaction management

## 🎨 Bonus Features Implemented

1. **Advanced Margin Visualization** with bar charts and statistics
2. **Responsive Design** for mobile and desktop
3. **Real-time Validation** with immediate feedback
4. **Data Seeding** from external APIs
5. **Professional UI/UX** with modern styling

## 🚀 Production Deployment

### Free Deployment Options

#### 🌟 Railway (Recommended)
**Best for**: Complete full-stack apps with database
- **Free Tier**: $5 monthly credit
- **Features**: Auto-deploy from GitHub, PostgreSQL included
- **Setup Time**: ~5 minutes

[📖 **Complete Railway Deployment Guide →**](DEPLOYMENT_GUIDE.md)

**Quick Steps**:
1. Push code to GitHub
2. Connect repository at [railway.app](https://railway.app)
3. Deploy backend service (auto-detects Dockerfile)
4. Deploy frontend service (auto-detects React)
5. Set environment variables:
   - Backend: `ENVIRONMENT=production`
   - Frontend: `REACT_APP_API_URL=https://your-backend.railway.app`

#### 🎨 Render
**Best for**: Simple deployment
- **Free Tier**: 750 hours/month
- **Features**: Static sites + web services + PostgreSQL
- **Setup Time**: ~10 minutes

#### ☁️ Vercel + Supabase
**Best for**: Serverless approach
- **Free Tier**: Very generous
- **Features**: Frontend on Vercel, API + DB on Supabase
- **Setup Time**: ~15 minutes

### Environment Variables for Production
```bash
# Backend
DATABASE_URL=postgresql://user:password@host:port/database
ENVIRONMENT=production

# Frontend  
REACT_APP_API_URL=https://your-backend-domain.com
```

### Local Production Testing
```bash
# Build and test production version
docker-compose -f docker-compose.prod.yml up --build
```

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📝 License

This project is developed as a demonstration of full-stack development capabilities with modern web technologies.

## 🤝 Contributing

This is a showcase project. For improvements or questions, please review the code structure and implementation patterns demonstrated.
