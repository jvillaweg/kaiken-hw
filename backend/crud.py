from sqlalchemy.orm import Session
from sqlalchemy import func
from database import Tender, Product, Order
import schemas
from typing import List, Optional

def calculate_margin(product: Product, quantity: int) -> float:
    """Calculate margin for a product order"""
    return (product.unit_sale_price - product.unit_cost) * quantity

# Tender CRUD operations
def get_tender(db: Session, tender_id: int):
    return db.query(Tender).filter(Tender.id == tender_id).first()

def get_tenders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Tender).offset(skip).limit(limit).all()

def create_tender(db: Session, tender: schemas.TenderCreate):
    db_tender = Tender(**tender.dict())
    db.add(db_tender)
    db.commit()
    db.refresh(db_tender)
    return db_tender

def update_tender(db: Session, tender_id: int, tender_update: schemas.TenderUpdate):
    db_tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if db_tender:
        update_data = tender_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_tender, field, value)
        db.commit()
        db.refresh(db_tender)
    return db_tender

def delete_tender(db: Session, tender_id: int):
    db_tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if db_tender:
        db.delete(db_tender)
        db.commit()
    return db_tender

# Product CRUD operations
def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(Product).filter(Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        update_data = product_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

# Order CRUD operations
def get_order(db: Session, order_id: int):
    return db.query(Order).filter(Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Order).offset(skip).limit(limit).all()

def get_orders_by_tender(db: Session, tender_id: int):
    return db.query(Order).filter(Order.tender_id == tender_id).all()

def create_order(db: Session, order: schemas.OrderCreate):
    # Validate that tender and product exist
    tender = get_tender(db, order.tender_id)
    product = get_product(db, order.product_id)
    
    if not tender:
        raise ValueError("Tender not found")
    if not product:
        raise ValueError("Product not found")
    
    db_order = Order(**order.dict())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order(db: Session, order_id: int, order_update: schemas.OrderUpdate):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if db_order:
        update_data = order_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_order, field, value)
        db.commit()
        db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: int):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if db_order:
        db.delete(db_order)
        db.commit()
    return db_order

# Business logic functions
def get_tender_with_details(db: Session, tender_id: int):
    """Get tender with all orders and calculated margins"""
    tender = get_tender(db, tender_id)
    if not tender:
        return None
    
    orders = get_orders_by_tender(db, tender_id)
    orders_with_details = []
    total_margin = 0
    
    for order in orders:
        product = get_product(db, order.product_id)
        margin = calculate_margin(product, order.awarded_quantity)
        total_margin += margin
        
        order_detail = schemas.OrderWithDetails(
            id=order.id,
            tender_id=order.tender_id,
            product_id=order.product_id,
            awarded_quantity=order.awarded_quantity,
            product=product,
            margin=margin
        )
        orders_with_details.append(order_detail)
    
    return schemas.TenderWithDetails(
        id=tender.id,
        client=tender.client,
        award_date=tender.award_date,
        description=tender.description,
        orders=orders_with_details,
        total_margin=total_margin
    )

def get_tenders_summary(db: Session, skip: int = 0, limit: int = 100):
    """Get summary of all tenders with margin calculations"""
    tenders = get_tenders(db, skip, limit)
    summaries = []
    
    for tender in tenders:
        orders = get_orders_by_tender(db, tender.id)
        total_margin = 0
        product_count = len(orders)
        
        for order in orders:
            product = get_product(db, order.product_id)
            margin = calculate_margin(product, order.awarded_quantity)
            total_margin += margin
        
        summary = schemas.TenderSummary(
            id=tender.id,
            client=tender.client,
            award_date=tender.award_date,
            description=tender.description,
            product_count=product_count,
            total_margin=total_margin
        )
        summaries.append(summary)
    
    return summaries

def validate_tender_registration(db: Session, tender_id: int):
    """Validate that tender has at least one product"""
    orders = get_orders_by_tender(db, tender_id)
    if not orders:
        raise ValueError("No tender registration without products")
