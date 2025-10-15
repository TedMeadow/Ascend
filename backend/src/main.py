from fastapi import FastAPI
from .modules.routers import routers
from .core.oauth import load_and_register_providers

app = FastAPI()

@app.on_event("startup")
def on_startup():
    load_and_register_providers()

for router in routers:
    app.include_router(router)

@app.get("/")
def root():
    return {"message": "Server is running"}