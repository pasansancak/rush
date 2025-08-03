from fastapi import FastAPI
from api.auth import router as auth_router

from dotenv import load_dotenv

from models.user import Base
from core.database import engine

import os

load_dotenv()

app = FastAPI()
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "Rush API is working!"}

Base.metadata.create_all(bind=engine)
