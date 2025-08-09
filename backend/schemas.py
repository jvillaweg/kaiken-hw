from pydantic import BaseModel, field_validator, ConfigDict
from typing import List, Optional
from datetime import datetime

# Product schemas
class ProductBase(BaseModel):
    name: str
    sku: str
    unit_sale_price: float
    unit_cost: float
    description: Optional[str] = None
    
    @field_validator('unit_sale_price')
    @classmethod
    def sale_price_must_be_greater_than_cost(cls, v):
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
    
    model_config = ConfigDict(from_attributes=True)

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
    
    model_config = ConfigDict(from_attributes=True)

# Order schemas
class OrderBase(BaseModel):
    tender_id: int
    product_id: int
    awarded_quantity: int
    
    @field_validator('awarded_quantity')
    @classmethod
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
    
    model_config = ConfigDict(from_attributes=True)

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
    
    model_config = ConfigDict(from_attributes=True)
