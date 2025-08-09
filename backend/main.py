from fastapi import FastAPI
from api.authGoogle import router as google_auth_router
from api.authApple import router as apple_auth_router
from api.userFetch import router as user_router
from api.authEmail import router as auth_email_router
from api.registerEmail import router as register_email_router

from dotenv import load_dotenv

from models.user import Base
from core.database import engine

import os

load_dotenv()

app = FastAPI()
app.include_router(user_router)
app.include_router(google_auth_router)
app.include_router(apple_auth_router)
app.include_router(register_email_router)
app.include_router(auth_email_router)

@app.get("/")
def read_root():
    return {"message": "Rush API is working!"}

Base.metadata.create_all(bind=engine)
