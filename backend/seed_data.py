import httpx
import asyncio
from sqlalchemy.orm import Session
from database import get_db, engine, Base
import crud
import schemas
from typing import List

# Sample data endpoints
TENDER_SAMPLE_URL = "https://kaiken.up.railway.app/webhook/tender-sample"
PRODUCT_SAMPLE_URL = "https://kaiken.up.railway.app/webhook/product-sample"
ORDER_SAMPLE_URL = "https://kaiken.up.railway.app/webhook/order-sample"

async def fetch_sample_data(url: str):
    """Fetch sample data from the provided endpoints"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching data from {url}: {e}")
            return None

async def seed_products(db: Session):
    """Seed products from sample endpoint with proper field mapping"""
    print("Fetching product samples...")
    product_data = await fetch_sample_data(PRODUCT_SAMPLE_URL)
    
    if not product_data:
        # Fallback sample products
        sample_products = [
            {
                "name": "Office Chair",
                "sku": "CHAIR-001",
                "unit_sale_price": 150.0,
                "unit_cost": 100.0,
                "description": "Ergonomic office chair"
            },
            {
                "name": "Laptop",
                "sku": "LAPTOP-001",
                "unit_sale_price": 1200.0,
                "unit_cost": 800.0,
                "description": "Business laptop"
            },
            {
                "name": "Desk", 
                "sku": "DESK-001",
                "unit_sale_price": 300.0,
                "unit_cost": 200.0,
                "description": "Office desk"
            }
        ]
        product_data = sample_products
    else:
        # Process API data to match our schema
        processed_products = []
        for product in product_data:
            # Validate required fields
            if not all([product.get("sku"), product.get("title"), product.get("cost")]):
                print(f"Skipping product with missing fields: {product}")
                continue
                
            cost = float(product.get("cost", 0))
            # Calculate sale price with 40% margin (as per API margin field)
            sale_price = cost * 1.4
            
            processed_product = {
                "name": product.get("title", ""),
                "sku": str(product.get("sku", "")),
                "unit_cost": cost,
                "unit_sale_price": sale_price,
                "description": product.get("description", "") or f"Product SKU: {product.get('sku')}"
            }
            processed_products.append(processed_product)
        
        product_data = processed_products

    created_products = []
    for product_info in product_data:
        try:
            # Check if product already exists
            existing = crud.get_product_by_sku(db, product_info.get("sku", ""))
            if not existing:
                product = schemas.ProductCreate(**product_info)
                db_product = crud.create_product(db, product)
                db.commit()  # Commit each successful creation
                created_products.append(db_product)
                print(f"Created product: {db_product.name}")
        except Exception as e:
            print(f"Error creating product {product_info.get('name', 'Unknown')}: {e}")
            db.rollback()  # Rollback on error to reset transaction state
    
    return created_products

async def seed_tenders(db: Session):
    """Seed tenders from sample endpoint with proper field mapping"""
    print("Fetching tender samples...")
    tender_data = await fetch_sample_data(TENDER_SAMPLE_URL)
    
    if not tender_data:
        # Fallback sample tenders
        sample_tenders = [
            {
                "client": "Ministry of Education",
                "description": "Office furniture procurement"
            },
            {
                "client": "Department of Health",
                "description": "IT equipment tender"
            },
            {
                "client": "City Council",
                "description": "Municipal office setup"
            }
        ]
        tender_data = sample_tenders
    else:
        # Process API data to match our schema
        processed_tenders = []
        for tender in tender_data:
            if not tender.get("client"):
                print(f"Skipping tender with missing client: {tender}")
                continue
                
            processed_tender = {
                "client": tender.get("client", ""),
                "description": f"Tender {tender.get('id', '')} - Created: {tender.get('creation_date', '')}"
            }
            processed_tenders.append(processed_tender)
        
        tender_data = processed_tenders

    created_tenders = []
    for tender_info in tender_data:
        try:
            tender = schemas.TenderCreate(**tender_info)
            db_tender = crud.create_tender(db, tender)
            db.commit()  # Commit each successful creation
            created_tenders.append(db_tender)
            print(f"Created tender: {db_tender.client}")
        except Exception as e:
            print(f"Error creating tender {tender_info.get('client', 'Unknown')}: {e}")
            db.rollback()  # Rollback on error to reset transaction state
    
    return created_tenders

async def seed_orders(db: Session, tenders: List, products: List):
    """Seed orders from sample endpoint with proper ID mapping"""
    print("Fetching order samples...")
    order_data = await fetch_sample_data(ORDER_SAMPLE_URL)
    
    if not order_data or not tenders or not products:
        print("Using fallback order data - creating orders for all tenders")
        sample_orders = []
        
        # Create orders for ALL tenders, not just first 3
        import random
        random.seed(42)  # For reproducible results
        
        for tender in tenders:
            # Each tender gets 1-3 random products
            num_products = random.randint(1, min(3, len(products)))
            selected_products = random.sample(products, num_products)
            
            for product in selected_products:
                quantity = random.randint(5, 50)  # Random quantity between 5-50
                sample_orders.append({
                    "tender_id": tender.id,
                    "product_id": product.id,
                    "awarded_quantity": quantity
                })
        
        order_data = sample_orders
        print(f"Generated {len(order_data)} orders for {len(tenders)} tenders")
    else:
        # Try to use API data and map to our database IDs
        print(f"Processing {len(order_data)} orders from API...")
        processed_orders = []
        
        # Create a mapping of available tender and product IDs
        tender_ids = [t.id for t in tenders]
        product_ids = [p.id for p in products]
        
        import random
        random.seed(42)  # For reproducible results
        
        # For each API order, try to map it to our database
        for api_order in order_data:
            # Since API data might have different ID schemes, we'll distribute randomly
            tender_id = random.choice(tender_ids)
            product_id = random.choice(product_ids)
            quantity = api_order.get("awarded_quantity", random.randint(5, 50))
            
            # Ensure quantity is valid
            if isinstance(quantity, str):
                try:
                    quantity = int(float(quantity))
                except:
                    quantity = random.randint(5, 50)
            
            if quantity <= 0:
                quantity = random.randint(5, 50)
            
            processed_orders.append({
                "tender_id": tender_id,
                "product_id": product_id,
                "awarded_quantity": quantity
            })
        
        order_data = processed_orders
        print(f"Processed {len(order_data)} orders from API data")

    created_orders = []
    for order_info in order_data:
        try:
            # Validate that the tender and product exist
            tender_id = order_info.get("tender_id")
            product_id = order_info.get("product_id")
            
            if tender_id and product_id and order_info.get("awarded_quantity", 0) > 0:
                order = schemas.OrderCreate(**order_info)
                db_order = crud.create_order(db, order)
                db.commit()  # Commit each successful creation
                created_orders.append(db_order)
                if len(created_orders) % 10 == 0:  # Progress indicator
                    print(f"Created {len(created_orders)} orders...")
        except Exception as e:
            print(f"Error creating order: {e}")
            db.rollback()  # Rollback on error to reset transaction state
    
    print(f"Successfully created {len(created_orders)} orders")
    return created_orders

async def seed_database():
    """Seed the entire database with sample data"""
    print("Starting database seeding...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Get database session
    db = next(get_db())
    
    try:
        # Check and seed each entity type separately
        products = []
        tenders = []
        orders = []
        
        # Seed products if none exist
        existing_products = crud.get_products(db, limit=1)
        if not existing_products:
            print("Seeding products...")
            products = await seed_products(db)
        else:
            print("Products already exist. Skipping product seeding.")
            products = crud.get_products(db, limit=100)  # Get existing products
        
        # Seed tenders if none exist
        existing_tenders = crud.get_tenders(db, limit=1)
        if not existing_tenders:
            print("Seeding tenders...")
            tenders = await seed_tenders(db)
        else:
            print("Tenders already exist. Skipping tender seeding.")
            tenders = crud.get_tenders(db, limit=100)  # Get existing tenders
        
        # Seed orders - create comprehensive order dataset
        existing_orders = crud.get_orders(db, limit=1)
        if not existing_orders and tenders and products:
            print("Seeding orders for all tenders...")
            orders = await seed_orders(db, tenders, products)
        else:
            if existing_orders:
                print("Orders already exist. Checking if we need to create more...")
                # Check if we have significantly fewer orders than we should
                total_orders = len(crud.get_orders(db, limit=1000))
                expected_orders = len(tenders) * 2  # Rough estimate: 2 orders per tender on average
                
                if total_orders < expected_orders * 0.5:  # If we have less than 50% of expected orders
                    print(f"Only {total_orders} orders exist, expected ~{expected_orders}. Creating more orders...")
                    # Clear existing orders and recreate with full dataset
                    try:
                        # Delete existing orders using ORM
                        from database import Order
                        db.query(Order).delete()
                        db.commit()
                        print("Cleared existing orders")
                        orders = await seed_orders(db, tenders, products)
                    except Exception as e:
                        print(f"Error clearing orders: {e}")
                        db.rollback()
                        orders = []
                else:
                    print(f"Sufficient orders exist ({total_orders}). Skipping order seeding.")
                    orders = []
            else:
                print("Cannot seed orders: missing tenders or products.")
                orders = []
        print(f"Seeding completed: {len(products)} products, {len(tenders)} tenders, {len(orders)} orders")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
