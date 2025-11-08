#!/usr/bin/env python3
"""
Create test users for R Territory AI Platform
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def create_test_users():
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    test_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "admin@test.com",
            "password": hash_password("password123"),
            "name": "Admin User",
            "role": "admin",
            "openai_api_key": None,
            "pincode_api_url": None,
            "pincode_api_key": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "viewer@test.com",
            "password": hash_password("password123"),
            "name": "Viewer User",
            "role": "viewer",
            "openai_api_key": None,
            "pincode_api_url": None,
            "pincode_api_key": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "partner@test.com",
            "password": hash_password("password123"),
            "name": "Partner User",
            "role": "partner",
            "openai_api_key": None,
            "pincode_api_url": None,
            "pincode_api_key": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for user in test_users:
        existing = await db.users.find_one({"email": user["email"]})
        if existing:
            print(f"✓ User {user['email']} already exists")
        else:
            await db.users.insert_one(user)
            print(f"✓ Created user {user['email']} ({user['role']})")
    
    print("\n✅ Test users setup complete!")
    print("\nCredentials:")
    print("  Admin:   admin@test.com / password123")
    print("  Viewer:  viewer@test.com / password123")
    print("  Partner: partner@test.com / password123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_test_users())
