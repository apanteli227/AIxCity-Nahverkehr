import sys

import pandas as pd
from datetime import datetime, time, date
import logging
import numpy as np
import os

import psycopg2

#Verbindungsdaten zur Datenbank
param_dic = {
    "host": "aixcity-nahverkehr-db-1",
    "port": "5432",
    "dbname": "events_data",
    "user": "postgres",
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
    print("2: "+dataframe)

    print("======[" + table + "]======")
    for i in df.index:
        vals = [dataframe.at[i, col] for col in list(dataframe.columns)]
        query = """INSERT INTO deine_tabelle (
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
        execute_query(conn, query)
        print("execute_query: " + query)
    disconnect(conn)
def get_events(base_path="../resources"):
    """
    Diese Funktion lädt die Events von der Seite der Stadt Bremen herunter.
    Diese werden im Format eines DataFrames zurückgegeben.

    Returns:
    - events_df (DataFrame): DataFrame mit den Events.
    """
    # Erhalte das Verzeichnis der aktuellen Datei
    current_directory = os.path.dirname(__file__)

    # Kombiniere das aktuelle Verzeichnis mit dem relativen Pfad
    full_path = os.path.join(current_directory, base_path)

    file_path = os.path.join(full_path, "events_bremen.csv")

    try:
        events_data = pd.read_csv(file_path, low_memory=False, delimiter=";",
                                  parse_dates=["Beginn_Datum", "Ende_Datum", "Beginn_Uhrzeit", "Ende_Uhrzeit"],
                                  dayfirst=True)

    except FileNotFoundError:
        print("Warnung: Datei events_bremen.csv nicht gefunden.")

    # Abrufen der Events
    print(events_data.head())

    # Konvertiere Spalte mit Uhrzeit und Datum in Datetime-Objekte (Beginn)
    events_data["Beginn_Datum"] = pd.to_datetime(events_data["Beginn_Datum"])
    events_data["Beginn_Uhrzeit"] = pd.to_datetime(events_data["Beginn_Uhrzeit"])
    events_data["Beginn_Uhrzeit"] = events_data["Beginn_Uhrzeit"].dt.time

    # Konvertiere Spalte mit Uhrzeit und Datum in Datetime-Objekte (Ende)
    events_data["Ende_Datum"] = pd.to_datetime(events_data["Ende_Datum"])
    events_data["Ende_Uhrzeit"] = pd.to_datetime(events_data["Ende_Uhrzeit"])
    events_data["Ende_Uhrzeit"] = events_data["Ende_Uhrzeit"].dt.time

    # Ermittle das aktuelle Datum und die aktuelle Uhrzeit
    now = datetime.now()
    today_date = np.datetime64(date(now.year, now.month, now.day))
    today_time = now.time()

    # Vergleiche das aktuelle Datum und die aktuelle Uhrzeit mit den Events und filtere aktuelle Events heraus
    events_bsag_updates_df = events_data[((events_data["Beginn_Datum"].dt.date == today_date) & (
                events_data["Ende_Datum"].dt.date >= today_date) & (events_data["Beginn_Datum"].dt.date != events_data[
        "Ende_Datum"].dt.date)) |
                                         (events_data["Beginn_Datum"].dt.date == today_date) & (
                                                     events_data["Beginn_Uhrzeit"] <= today_time) & (
                                                     events_data["Ende_Uhrzeit"] >= today_time)]

    # CSV-Datei aus events_bsag_updates_df erstellen
    events_bsag_updates_df.to_csv("events_bsag_updates.csv", index=False)
    conn = connect(param_dic)
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
        execute_query(conn, query)
        print("execute_query: " + query)
    disconnect(conn)

if __name__ == "__main__":
    get_events()