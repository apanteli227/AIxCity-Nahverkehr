
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from persistence import database_controller as dbc

app = FastAPI()

# Allow CORS for all origins in this example
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic model for the data
class Item(BaseModel):
    name: str
    description: str = None


# Endpoint to fetch all the stops from the database
@app.get("getLines")
async def read_data_stops():
    query = "SELECT DISTINCT line FROM public.bsag_data"
    return read_data(query)


# Endpoint to fetch all the lines from the database
@app.get("getStops")
async def read_data_lines():
    query = "SELECT DISTINCT stop FROM public.bsag_data"
    return read_data(query)


# Endpoint to fetch all the lines from the database
@app.get("getCardsData")
async def read_data_lines():
    query = "SELECT * FROM public.bsag_data"
    return read_data(query)


# Endpoint to fetch all the lines from the database
@app.get("getCustomData")
async def read_data_lines():
    query = "SELECT * FROM public.bsag_data"
    return read_data(query)


def read_data(query):
    try:
        conn = dbc.connect(dbc.param_dic)
        cursor = conn.cursor()
        cursor.execute(query)
        result = cursor.fetchall()
        dbc.disconnect(conn)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def main():
    uvicorn.run(app, host="127.0.0.1", port=8080)


# Run the FastAPI app with Uvicorn
if __name__ == "__main__":
    main()
# todo change host
