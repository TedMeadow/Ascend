from fastapi import FastAPI
from contextlib import asynccontextmanager
from .modules.routers import routers
from .core.oauth import load_and_register_providers

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Your startup logic here
    load_and_register_providers()
    print("Application startup")
    yield
    # Your shutdown logic here
    print("Application shutdown")

app = FastAPI(lifespan=lifespan)

for router in routers:
    app.include_router(router)

@app.get("/")
def root():
    return {"message": "Server is running"}