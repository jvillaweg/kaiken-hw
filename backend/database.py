from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/bidmanagement")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Tender(Base):
    __tablename__ = "tenders"
    
    id = Column(Integer, primary_key=True, index=True)
    client = Column(String, nullable=False)
    award_date = Column(DateTime(timezone=True), server_default=func.now())
    description = Column(Text, nullable=True)
    
    # Relationship to orders
    orders = relationship("Order", back_populates="tender", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, nullable=False, index=True)
    unit_sale_price = Column(Float, nullable=False)
    unit_cost = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    
    # Relationship to orders
    orders = relationship("Order", back_populates="product")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    awarded_quantity = Column(Integer, nullable=False)
    
    # Relationships
    tender = relationship("Tender", back_populates="orders")
    product = relationship("Product", back_populates="orders")

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
