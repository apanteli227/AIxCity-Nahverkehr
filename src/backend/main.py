import time

import schedule

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

from data_collection.public_transit.public_transit_data_cleaner import get_public_transit_dataframe
from data_collection.events.events_data_fetch import get_events_dataframe
from data_collection.weather.weather_data_fetch import get_weather_dataframe
from persistence import database_controller as dbc

'''
app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.post("/helloWorld")
def hello_world():
    return "Hello World!"
    '''


# todo db müll auslagern
def save_transit_and_traffic_data(stop_times_bsag_updates_df):
    print(stop_times_bsag_updates_df)
    # Daten hochladen
    print("Daten herunterladen...")
    time.sleep(60)
    # single_inserts(stop_times_bsag_updates, 'public.bsag_data')
    """Perform single inserts of the dataframe into the PostGIS table"""
    conn = dbc.connect(dbc.param_dic)
    print("======[" + "public.bsag_data" + "]======")
    print("conn: " + conn.dsn)
    # dataframe = pt_fetch.create_stop_time_updates_df(df)
    # print("2: " + stop_times_bsag_updates)
    print("======[" + "public.bsag_data" + "]======")
    for i in stop_times_bsag_updates_df.index:
        vals = [stop_times_bsag_updates_df.at[i, col] for col in list(stop_times_bsag_updates_df.columns)]
        query = """INSERT INTO public.bsag_data (startdate, startzeit_an_der_anfangshaltestelle, linie, richtung, haltestelle, stopsequence, ankunftsverspaetung_sek, abfahrtsverspaetung_sek)
                       VALUES ('%s', '%s', '%s', '%s', '%s', %s, %s, %s);""" % (
            vals[0],
            vals[1],
            vals[2],
            vals[3],
            vals[4],
            vals[5],
            vals[6],
            vals[7]
        )
        dbc.execute_query(conn, query)
        # print("execute_query: " + query)
    dbc.disconnect(conn)


def save_events_data(events_bsag_updates_df):
    conn = dbc.connect(dbc.param_dic)
    for i in events_bsag_updates_df.index:
        vals = [events_bsag_updates_df.at[i, col] for col in list(events_bsag_updates_df.columns)]
        query = """INSERT INTO public.events_data (
                            Beginn_Datum,Ende_Datum,Beginn_Uhrzeit,Ende_Uhrzeit,Art_Event,Eventkennzeichnung

                       ) VALUES (
                            '%s', '%s', '%s', '%s', '%s', %s
                       );""" % (
            vals[0],
            vals[1],
            vals[2],
            vals[3],
            vals[4],
            vals[5]
        )
        dbc.execute_query(conn, query)
        print("execute_query: " + query)
    dbc.disconnect(conn)


def save_weather_data(dataframe):
    return dataframe


if __name__ == "__main__":
    # Schedule tasks
    schedule.every(1).minutes.do(save_transit_and_traffic_data(
        get_public_transit_dataframe("https://gtfsr.vbn.de/gtfsr_connect.json",
                                     "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key"
                                        "=VogM4y4rQiI8XWQIAZJMlcqGIqGn53tr&point=")))
    # todo change url
    schedule.every(1).day.do(save_events_data(get_events_dataframe("https://www.bremen.de/veranstaltungen")))
    # todo Achtung: API-Key ist vom Account von Emmanuel
    # todo Für längerfristige Lösung könnte man einen gemeinsamen Account für den Key erstellen
    schedule.every(60).minutes.do(save_weather_data(
        get_weather_dataframe("http://api.openweathermap.org/data/2.5/weather", "131b00cd42bee49451a4c69d496797e1",
                              "Bremen")))

    # Endlessly run the scheduled tasks
    while True:
        schedule.run_pending()
        time.sleep(1)  # Sleep for 1 second to avoid excessive CPU usage
