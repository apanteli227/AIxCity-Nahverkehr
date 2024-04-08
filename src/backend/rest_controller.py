import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from urllib.parse import unquote
import sys

import psycopg2

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
# todo: do we need this?
class Item(BaseModel):
    name: str
    description: str = None
    # ...


@app.get("/get_cards_data")
async def read_data_cards():
    return [
        read_data_last_7_days_delay(),
        read_data_weekend_day_delay(),
        read_data_public_holiday_delay(),
        read_data_football_match_day_delay(),
    ]


# durchschn. Verspätungen in den letzten 7 Tagen
@app.get("/interesting_statistic_last_7_days")
async def read_data_last_7_days_delay():
    query = "SELECT AVG(departure_delay_seconds) FROM bsag_data WHERE start_date >= CURRENT_DATE - INTERVAL '1 week' AND start_date < CURRENT_DATE;"
    return read_data(query)


# durchschn. Verspätung an Wochenendtagen
@app.get("/interesting_statistic_weekend")
async def read_data_weekend_day_delay():
    query = "SELECT AVG(departure_delay_seconds) FROM bsag_data WHERE weekday IN ('Saturday', 'Sunday');"
    return read_data(query)


# durchschn. Verspätung an Feiertagen
@app.get("/interesting_statistic_public_holiday")
async def read_data_public_holiday_delay():
    query = "SELECT AVG(departure_delay_seconds) FROM bsag_data WHERE holiday = 1;"
    return read_data(query)


# durchschn. Verspätungen an einem (noch kommenden) zufälligen Heimspieltag von Werder Bremen
# Hieraus Statistik für Poster erstellen: an Werderspieltagen xy% mehr Verspätungen
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
        conn = connect(param_dic)
        print(conn)
        cursor = conn.cursor()
        print(cursor)
        cursor.execute(query)
        result = cursor.fetchall()
        print(result)
        disconnect(conn)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# DB connection parameters
param_dic = {
    "host": "134.102.23.195",
    "port": "5434",
    "dbname": "aixcity_nahverkehr",
    "user": "aixcity-user",
    "password": "password"
}


def connect(params_dic):
    """ Connect to the PostgreSQL persistence server """
    conn = None
    try:
        # connect to the PostgreSQL server
        print('PostgreSQL-Datenbank: Verbindung aufbauen...')
        conn = psycopg2.connect(**params_dic)
    except Exception as error:
        print(error)
        sys.exit(1)
    print("PostgreSQL-Datenbank: Verbindung erfolgreich!")
    return conn


def disconnect(conn):
    """ Disconnect from the PostgreSQL """
    if conn is not None:
        conn.close()
        print('PostgreSQL-Datenbank: Verbindung getrennt!')


def execute_query(conn, query):
    """ Execute a single query """
    ret = 0  # Return value
    cursor = conn.cursor()
    try:
        cursor.execute(query)
        conn.commit()
    except Exception as error:
        print("Error: %s" % error)
        conn.rollback()
        cursor.close()
        return 1
    # If this was a select query, return the result
    if 'select' in query.lower():
        ret = cursor.fetchall()
    cursor.close()
    return ret


def single_inserts(df, table):
    """Perform single inserts of the dataframe into the PostGIS table"""
    conn = connect(param_dic)
    print("======[" + table + "]======")
    print("conn: " + conn.dsn)
    dataframe = pt_fetch.create_stop_time_updates_df(df)
    print("2: " + dataframe)

    print("======[" + table + "]======")
    for i in df.index:
        vals = [dataframe.at[i, col] for col in list(dataframe.columns)]
        query = """INSERT INTO deine_tabelle (
                        startdate,
                        startzeit_an_der_anfangshaltestelle,
                        linie,
                        richtung,
                        haltestelle,
                        stopsequence,
                        ankunfsverspatung_sek,
                        abfahrtsverspatung_sek
                   ) VALUES (
                        '%s', '%s', '%s', '%s', '%s', %s, %s, %s
                   );""" % (
            vals[0],
            vals[1],
            vals[2],
            vals[3],
            vals[4],
            vals[5],
            vals[6],
            vals[7]
        )
        execute_query(conn, query)
        print("execute_query: " + query)
    disconnect(conn)


# only for testing purposes
def main():
    uvicorn.run(app, host="127.0.0.1", port=8080)


# Run the FastAPI app with Uvicorn
if __name__ == "__main__":
    main()
