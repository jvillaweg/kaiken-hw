from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db
from seed_data import seed_database
import asyncio
import os

app = FastAPI(
    title="Bid Management System",
    description="A system for managing commercial tenders, products, and orders",
    version="1.0.0"
)

# CORS middleware - handle both development and production
allowed_origins = [
    "https://serene-adaptation-production.up.railway.app/",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add production origins if environment variable is set
if os.getenv("FRONTEND_URL"):
    allowed_origins.append(os.getenv("FRONTEND_URL"))

# In production, allow common hosting patterns
if os.getenv("ENVIRONMENT") == "production":
    allowed_origins.extend([
        "https://*.railway.app",
        "https://*.onrender.com", 
        "https://*.vercel.app",
        "https://*.netlify.app"
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to seed database
@app.on_event("startup")
async def startup_event():
    await seed_database()

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Tender endpoints
@app.get("/tenders/", response_model=List[schemas.TenderSummary])
def read_tenders_summary(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get summary of all tenders with margin calculations"""
    return crud.get_tenders_summary(db, skip=skip, limit=limit)

@app.get("/tenders/{tender_id}", response_model=schemas.TenderWithDetails)
def read_tender_details(tender_id: int, db: Session = Depends(get_db)):
    """Get detailed view of a specific tender with all products and margins"""
    tender = crud.get_tender_with_details(db, tender_id=tender_id)
    if tender is None:
        raise HTTPException(status_code=404, detail="Tender not found")
    return tender

@app.post("/tenders/", response_model=schemas.Tender, status_code=status.HTTP_201_CREATED)
def create_tender(tender: schemas.TenderCreate, db: Session = Depends(get_db)):
    """Create a new tender"""
    return crud.create_tender(db=db, tender=tender)

@app.put("/tenders/{tender_id}", response_model=schemas.Tender)
def update_tender(tender_id: int, tender_update: schemas.TenderUpdate, db: Session = Depends(get_db)):
    """Update an existing tender"""
    db_tender = crud.update_tender(db, tender_id, tender_update)
    if db_tender is None:
        raise HTTPException(status_code=404, detail="Tender not found")
    return db_tender

@app.delete("/tenders/{tender_id}")
def delete_tender(tender_id: int, db: Session = Depends(get_db)):
    """Delete a tender"""
    db_tender = crud.delete_tender(db, tender_id)
    if db_tender is None:
        raise HTTPException(status_code=404, detail="Tender not found")
    return {"message": "Tender deleted successfully"}

# Product endpoints
@app.get("/products/", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all products"""
    return crud.get_products(db, skip=skip, limit=limit)

@app.get("/products/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product"""
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.post("/products/", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    # Check if SKU already exists
    existing_product = crud.get_product_by_sku(db, product.sku)
    if existing_product:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")
    
    try:
        return crud.create_product(db=db, product=product)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product_update: schemas.ProductUpdate, db: Session = Depends(get_db)):
    """Update an existing product"""
    try:
        db_product = crud.update_product(db, product_id, product_update)
        if db_product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        return db_product
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product"""
    db_product = crud.delete_product(db, product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Order endpoints
@app.get("/orders/", response_model=List[schemas.Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all orders"""
    return crud.get_orders(db, skip=skip, limit=limit)

@app.get("/orders/{order_id}", response_model=schemas.Order)
def read_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order"""
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@app.post("/orders/", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    """Create a new order"""
    try:
        return crud.create_order(db=db, order=order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/orders/{order_id}", response_model=schemas.Order)
def update_order(order_id: int, order_update: schemas.OrderUpdate, db: Session = Depends(get_db)):
    """Update an existing order"""
    try:
        db_order = crud.update_order(db, order_id, order_update)
        if db_order is None:
            raise HTTPException(status_code=404, detail="Order not found")
        return db_order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an order"""
    db_order = crud.delete_order(db, order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}

# Business logic endpoints
@app.post("/seed-database/")
async def seed_database_endpoint():
    """Manually trigger database seeding"""
    try:
        await seed_database()
        return {"message": "Database seeded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error seeding database: {str(e)}")

@app.get("/tenders/{tender_id}/validate")
def validate_tender(tender_id: int, db: Session = Depends(get_db)):
    """Validate that a tender has at least one product"""
    try:
        crud.validate_tender_registration(db, tender_id)
        return {"message": "Tender is valid"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
