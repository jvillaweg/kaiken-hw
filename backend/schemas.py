from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime

# Product schemas
class ProductBase(BaseModel):
    name: str
    sku: str
    unit_sale_price: float
    unit_cost: float
    description: Optional[str] = None
    
    @validator('unit_sale_price')
    def sale_price_must_be_greater_than_cost(cls, v, values):
        if 'unit_cost' in values and v <= values['unit_cost']:
            raise ValueError('Sale price must be greater than cost')
        return v

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    unit_sale_price: Optional[float] = None
    unit_cost: Optional[float] = None
    description: Optional[str] = None

class Product(ProductBase):
    id: int
    
    class Config:
        orm_mode = True

# Tender schemas
class TenderBase(BaseModel):
    client: str
    description: Optional[str] = None

class TenderCreate(TenderBase):
    pass

class TenderUpdate(BaseModel):
    client: Optional[str] = None
    description: Optional[str] = None

class Tender(TenderBase):
    id: int
    award_date: datetime
    
    class Config:
        orm_mode = True

# Order schemas
class OrderBase(BaseModel):
    tender_id: int
    product_id: int
    awarded_quantity: int
    
    @validator('awarded_quantity')
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Awarded quantity must be positive')
        return v

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    tender_id: Optional[int] = None
    product_id: Optional[int] = None
    awarded_quantity: Optional[int] = None

class Order(OrderBase):
    id: int
    
    class Config:
        orm_mode = True

# Response schemas with relationships
class OrderWithDetails(Order):
    product: Product
    margin: float

class TenderWithDetails(Tender):
    orders: List[OrderWithDetails]
    total_margin: float

class TenderSummary(BaseModel):
    id: int
    client: str
    award_date: datetime
    description: Optional[str]
    product_count: int
    total_margin: float
    
    class Config:
        orm_mode = True
