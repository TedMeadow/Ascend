from fastapi import FastAPI
from contextlib import asynccontextmanager
from .modules.routers import routers
from .core.oauth import load_and_register_providers

# 1. Импортируем middleware
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Your startup logic here
    load_and_register_providers()
    print("Application startup")
    yield
    # Your shutdown logic here
    print("Application shutdown")


app = FastAPI(lifespan=lifespan)

# 2. Определяем, каким фронтенд-адресам мы доверяем
#    Порт 3000 - это стандартный порт для Next.js в режиме разработки
origins = [
    "http://localhost:3000",
]

# 3. Добавляем middleware для обработки CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Разрешаем запросы от нашего фронтенда
    allow_credentials=True, # Разрешаем передачу cookie/авторизационных заголовков
    allow_methods=["*"],    # Разрешаем все методы (GET, POST, PUT, DELETE и т.д.)
    allow_headers=["*"],    # Разрешаем все заголовки
)


for router in routers:
    app.include_router(router)


@app.get("/")
def root():
    return {"message": "Server is running"}