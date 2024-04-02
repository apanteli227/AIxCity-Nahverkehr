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


@app.get("/getCardsData")
async def read_data_cards():
    return [
        await read_data_last_7_days_delay(),
        await read_data_weekend_day_delay(),
        await read_data_public_holiday_delay(),
        await read_data_football_match_day_delay(),
    ]


# durchschn. Verspätungen in den letzten 7 Tagen
@app.get("/interesting_statistic_last_7_days")
async def read_data_last_7_days_delay():
    query = "SELECT AVG(departure_delay) FROM bsag_data WHERE start_date >= CURRENT_DATE - INTERVAL '1 week' AND start_date < CURRENT_DATE;"
    return read_data(query)


# durchschn. Verspätung an Wochenendtagen
@app.get("/interesting_statistic_weekend")
async def read_data_weekend_day_delay():
    query = "SELECT AVG(arrival_delay) FROM bsag_data WHERE weekday IN ('Saturday', 'Sunday');"
    return read_data(query)


# durchschn. Verspätung an Feiertagen
@app.get("/interesting_statistic_public_holiday")
async def read_data_public_holiday_delay():
    query = "SELECT AVG(arrival_delay) FROM bsag_data WHERE holiday = 1;"
    return read_data(query)


# durchschn. Verspätungen an einem (noch kommenden) zufälligen Heimspieltag von Werder Bremen
# Hieraus Statistik für Poster erstellen: an Werderspieltagen xy% mehr Verspätungen
@app.get("/interesting_statistic_football_match_day")
async def read_data_football_match_day_delay():
    query = "SELECT AVG(departure_delay) FROM bsag_data WHERE start_date = '2024-03-30';"
    return read_data(query)


@app.get("/all_stops")
async def read_data_stops():
    query = "SELECT DISTINCT line FROM public.bsag_data"
    return read_data(query)


@app.get("/all_lines")
async def read_data_lines():
    query = "SELECT DISTINCT stop FROM public.bsag_data"
    return read_data(query)


@app.get("/{mode}/{mode_input}/{frequency}/{start_time}/{end_time}")
async def read_data_delay_frequency(mode: str, mode_input: str, frequency: str, start_time: str, end_time: str):
    mode_str = get_mode(mode)
    mode_input_str = mode_input.split(',')

    if frequency == "daily":
        query = f"SELECT DATE_TRUNC('day', start_time) AS date, COUNT(*) AS delay_occurrences FROM public.bsag_data WHERE {mode_str} IN ('{mode_input_str}') AND start_time >= '{start_time}' AND start_time <= '{end_time}' GROUP BY DATE_TRUNC('day', start_time);"
    elif frequency == "hourly":
        query = f"SELECT DATE_TRUNC('hour', start_time) AS hour, COUNT(*) AS delay_occurrences FROM public.bsag_data WHERE {mode_str} IN ('{mode_input_str}') AND start_time >= '{start_time}' AND start_time <= '{end_time}' GROUP BY DATE_TRUNC('hour', start_time);"
    else:
        return "Invalid frequency parameter. Please choose either 'daily' or 'hourly'."

    return await read_data(query)


@app.get("/{mode}/{mode_input}/{start_time}/{end_time}")
async def read_data_delay_rate(mode: str, mode_input: str, start_time: str, end_time: str):
    mode_str = get_mode(mode)

    mode_input_str = mode_input.split(',')
    query = f"SELECT SUM(departure_delay) AS total_departure_delay,COUNT(*) AS total_records,SUM(departure_delay) / COUNT(*) AS total_delay_rate FROM public.bsag_data WHERE {mode_str} IN ('{mode_input_str}') AND starting_stop_time >= '{start_time}' AND starting_stop_time <= '{end_time}';"

    return await read_data(query)


@app.get("/{statistic}/{mode}/{mode_input}/{aggregate}/{start_time}/{end_time}")
async def read_data_arrival_departure_delay(mode: str, mode_input: str, aggregate: str, statistic: str,
                                            start_time: str, end_time: str):
    mode_str = get_mode(mode)
    aggregate_str = get_aggregate(aggregate)
    statistic = get_statistic(statistic)

    mode_input_str = mode_input.split(',')
    query = f"SELECT {aggregate_str}{statistic} FROM public.bsag_data WHERE {mode_str} IN ('{mode_input_str}') AND starting_stop_time >= '{start_time}' AND starting_stop_time <= '{end_time}';"
    # todo: time format converter function, if needed
    return await read_data(query)


def get_statistic(statistic):  # todo get frontend string names
    if statistic == 'arrival':
        stat = 'arrival_delay'
    elif statistic == 'departure':
        stat = 'departure_delay'
    elif statistic == 'generated_delay':
        stat = 'departure_delay - arrival_delay'
    else:
        stat = 'what to do with mixed statistic?'
    return '(' + stat + ')'


def get_aggregate(aggregate):
    if aggregate == 'min':
        return 'MIN'
    elif aggregate == 'max':
        return 'MAX'
    else:
        return 'AVG'


def get_mode(mode):
    if mode == 'stop' or mode == 'line':
        return mode
    else:
        return 'what to do with mixed mode?'


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


all_stops = []


# only for testing purposes
def main():
    uvicorn.run(app, host="127.0.0.1", port=8080)


# Run the FastAPI app with Uvicorn
if __name__ == "__main__":
    main()
