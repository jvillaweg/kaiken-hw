# 🚀 Quick Start Instructions

## Option 1: Using Docker (Recommended - Easiest)

1. **Make sure Docker Desktop is running**

2. **Open PowerShell in the project directory and run:**
   ```powershell
   .\setup.ps1
   ```
   
   Or manually:
   ```powershell
   docker-compose up --build
   ```

3. **Wait for all services to start (2-3 minutes)**

4. **Open your browser and go to:**
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:8000/docs

## Option 2: Local Development (If you don't have Docker)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Backend Setup
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Set up PostgreSQL database named 'bidmanagement'
python main.py
```

### Frontend Setup (in another terminal)
```powershell
cd frontend
npm install
npm start
```

## 🎯 What to Expect

1. **Sample Data**: The system automatically loads sample tenders, products, and orders
2. **Tender Summary**: View all tenders with margin calculations
3. **Product Management**: Create/edit products (ensure sale price > cost)
4. **Tender Registration**: Create new tenders and add products
5. **Margin Analysis**: Visual charts and statistics

## 🔧 Troubleshooting

- **Port conflicts**: Make sure ports 3000, 8000, and 5432 are available
- **Docker issues**: Restart Docker Desktop and try again
- **Database connection**: Check PostgreSQL is running and credentials are correct

## 🛑 To Stop Services

```powershell
docker-compose down
```

Enjoy exploring the Bid Management System! 🎉
