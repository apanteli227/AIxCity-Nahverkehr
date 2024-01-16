# FastAPI backend code

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

origins = [
  os.getenv('REACT_APP_BACKEND_URL')
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
)