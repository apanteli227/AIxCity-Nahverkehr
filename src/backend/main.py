import time

#from fastapi import FastAPI
#from fastapi.middleware.cors import CORSMiddleware

from data_collection.public_transit.public_transit_data_cleaner import get_public_transit_dataframe
from data_collection.events.events_data_fetch import get_events_dataframe
from data_collection.weather.weather_data_fetch import get_weather_dataframe
from data_collection.traffic.traffic_data_fetch import get_traffic_dataframe
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
def a(stop_times_bsag_updates_df):
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


def b(events_bsag_updates_df):
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

def c(dataframe):
    return dataframe

def d(dataframe):
    return dataframe


if __name__ == "__main__":
    a(get_public_transit_dataframe("https://gtfsr.vbn.de/gtfsr_connect.json"))
    b(get_events_dataframe("https://www.bremen.de/veranstaltungen")) #todo change url
    # todo Achtung: API-Key ist vom Account von Emmanuel
    # todo Für längerfristige Lösung könnte man einen gemeinsamen Account für den Key erstellen
    c(get_weather_dataframe("http://api.openweathermap.org/data/2.5/weather", "131b00cd42bee49451a4c69d496797e1", "Bremen"))
    d(get_traffic_dataframe("https://jsonplaceholder.typicode.com/todos"))





