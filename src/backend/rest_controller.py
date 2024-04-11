from urllib.parse import unquote

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from persistence import database_controller as dbc
from src.backend.ml_scripts_forecasts.ml_forecast_classification import classification_with_line_22, \
    classification_with_line
from src.backend.ml_scripts_forecasts.ml_forecast_regression import regression_with_line_22, regression_with_line

app = FastAPI()

# Allow CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Rufe abhängig von den Parametern die entsprechende Funktion in ml_scripts_forecasts auf
@app.get("/forecast/{mode}/{line_with_direction}")
async def get_forecast(mode: str, line_with_direction: str):
    decoded_line_with_direction = unquote(line_with_direction)
    line = get_line(decoded_line_with_direction)
    direction = get_direction(decoded_line_with_direction)
    is_line22 = line == "22"
    if mode == "classification" and is_line22:
        return classification_with_line_22()
    elif mode == "classification" and not is_line22:
        return classification_with_line(line, direction)
    elif mode == "regression" and is_line22:
        return regression_with_line_22()
    else:
        return regression_with_line(line, direction)


def get_line(line_with_direction):
    return line_with_direction.split(' => ')[0]


def get_direction(line_with_direction):
    return line_with_direction.split(' => ')[1]


@app.get("/get_cards_data")
async def read_data_cards():
    return [
        read_data_last_7_days_delay(),
        read_data_weekend_day_delay(),
        read_data_public_holiday_delay(),
        read_data_football_match_day_delay(),
    ]


# durchschn. Verspätungen in den letzten 7 Tagen
# todo fix query
@app.get("/interesting_statistic_last_7_days")
async def read_data_last_7_days_delay():
    query = "SELECT AVG(departure_delay_seconds) FROM bsag_data WHERE current_date >= CURRENT_DATE - INTERVAL '1 week' AND current_date < CURRENT_DATE;"
    return read_data(query)


# durchschn. Verspätung an Wochenendtagen
@app.get("/interesting_statistic_weekend")
async def read_data_weekend_day_delay():
    query = "SELECT AVG(departure_delay_seconds) FROM bsag_data WHERE weekday IN ('Saturday', 'Sunday');"
    return read_data(query)


# durchschn. Verspätung an Feiertagen
@app.get("/interesting_statistic_public_holiday")
async def read_data_public_holiday_delay():
    query = "SELECT AVG(departure_delay_seconds) FROM bsag_data WHERE is_holiday = 1;"
    return read_data(query)


# durchschn. Verspätungen an einem (noch kommenden) zufälligen Heimspieltag von Werder Bremen
# Hieraus Statistik für Poster erstellen: an Werderspieltagen xy% mehr Verspätungen
# todo fix query, no result!!!!!!!!!!!!!!!!
@app.get("/interesting_statistic_football_match_day")
async def read_data_football_match_day_delay():
    query = "SELECT AVG(departure_delay_seconds) FROM bsag_data WHERE start_date = '2024-03-30';"
    return read_data(query)


@app.get("/all_stops")
async def read_data_stops():
    query = "SELECT DISTINCT stop_name FROM public.bsag_data"
    return read_data(query)


@app.get("/all_lines")
async def read_data_lines():
    query = "SELECT DISTINCT line FROM public.bsag_data"
    return read_data(query)


@app.get("/all_lines_with_directions")
async def read_data_lines_with_directions():
    query = "SELECT line, ARRAY_AGG(DISTINCT direction) AS directions FROM public.transit_data GROUP BY line;"
    return read_data(query)


@app.get("/get_avg_stop_delay")
async def read_data_stop_delay():
    query = f"SELECT stop_name, AVG(departure_delay_seconds) AS avg_departure_delay FROM public.transit_data WHERE current_date >= (CURRENT_DATE - INTERVAL '1 week') GROUP BY stop_name"
    print(query)
    return read_data(query)


@app.get("/get_avg_line_delay")
async def read_data_line_delay():
    query = f"SELECT line, AVG(departure_delay_seconds) AS avg_departure_delay FROM public.transit_data WHERE current_date >= (CURRENT_DATE - INTERVAL '1 week') GROUP BY line"
    print(query)
    return read_data(query)


@app.get("/{mode}/{mode_input}/{frequency}/{start_time}/{end_time}")
async def read_data_delay_frequency(mode: str, mode_input: str, frequency: str, start_time: str, end_time: str):
    mode_str = get_mode(mode)
    mode_input_str = unquote(mode_input).split(',')

    if frequency == "daily":
        query = f"SELECT DATE_TRUNC('day', start_time) AS date, COUNT(*) AS delay_occurrences FROM public.bsag_data WHERE {mode_str} IN ('{mode_input_str}') AND start_time >= '{start_time}' AND start_time <= '{end_time}' GROUP BY DATE_TRUNC('day', start_time);"
    elif frequency == "hourly":
        query = f"SELECT DATE_TRUNC('hour', start_time) AS hour, COUNT(*) AS delay_occurrences FROM public.bsag_data WHERE {mode_str} IN ('{mode_input_str}') AND start_time >= '{start_time}' AND start_time <= '{end_time}' GROUP BY DATE_TRUNC('hour', start_time);"
    else:
        return "Invalid frequency parameter. Please choose either 'daily' or 'hourly'."

    return read_data(query)


@app.get("/{mode}/{mode_input}/{start_time}/{end_time}")
async def read_data_delay_rate(mode: str, mode_input: str, start_time: str, end_time: str):
    mode_str = get_mode(mode)
    mode_input_str = ["'" + item + "'" for item in unquote(mode_input).split(',')]

    # Decodieren der URL
    start_time = unquote(start_time)
    end_time = unquote(end_time)

    # Aufteilung von Datum und Uhrzeit
    start_date = get_date(start_time)
    start_time = get_time(start_time)
    end_date = get_date(end_time)
    end_time = get_time(end_time)
    query = f"SELECT SUM(departure_delay_seconds) AS total_departure_delay,COUNT(*) AS total_records,SUM(departure_delay_seconds) / COUNT(*) AS total_delay_rate FROM public.bsag_data WHERE {mode_str} IN ({','.join(mode_input_str)}) AND (current_date + starting_stop_time) BETWEEN '{start_date} {start_time}' AND '{end_date} {end_time}';"

    return read_data(query)


@app.get("/{statistic}/{mode}/{mode_input}/{aggregate}/{start_time}/{end_time}")
async def read_data_arrival_departure_delay(mode: str, mode_input: str, aggregate: str, statistic: str,
                                            start_time: str, end_time: str):
    mode_str = get_mode(mode)
    aggregate_str = get_aggregate(aggregate)
    statistic = get_statistic(statistic)
    mode_input_str = ["'" + item + "'" for item in unquote(mode_input).split(',')]

    # Decodieren der URL
    start_time = unquote(start_time)
    end_time = unquote(end_time)

    # Aufteilung von Datum und Uhrzeit
    start_date = get_date(start_time)
    start_time = get_time(start_time)
    end_date = get_date(end_time)
    end_time = get_time(end_time)

    print(statistic, mode, mode_input_str, aggregate, start_date, start_time, end_date, end_time)

    query = f"SELECT {aggregate_str}{statistic} FROM public.bsag_data WHERE {mode_str} IN ({','.join(mode_input_str)}) AND (current_date + starting_stop_time) BETWEEN '{start_date} {start_time}' AND '{end_date} {end_time}';"

    print(query)
    return read_data(query)


def get_statistic(statistic):
    if statistic == 'arrival':
        stat = 'arrival_delay_seconds'
    elif statistic == 'departure':
        stat = 'departure_delay_seconds'
    elif statistic == 'generated_delay':
        stat = 'departure_delay_seconds - arrival_delay_seconds'
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


def get_date(date_string):
    return date_string.split('T')[0]


def get_time(date_string):
    return date_string.split('T')[1]


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


# only for testing purposes
def main():
    uvicorn.run(app, host="127.0.0.1", port=8080)


# Run the FastAPI app with Uvicorn
if __name__ == "__main__":
    main()
