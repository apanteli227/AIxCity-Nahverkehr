import os
from datetime import datetime, date
import logging
import numpy as np
import pandas as pd
import warnings


def get_events_dataframe(base_path="../resources") -> pd.DataFrame:
    """
    Diese Funktion lädt die Events von der Seite der Stadt Bremen herunter.
    Diese werden im Format eines DataFrames zurückgegeben.

    Parameters:
    - base_path (str): Der Basispfad, in dem sich die Events-Datei befindet.

    Returns:
    - events_df (DataFrame): DataFrame mit den Events.
    """
    CGREEN = '\033[32m'
    CEND = '\033[0m'
    logging.info(CGREEN + "[EVENTS] " + CEND + "Starte Prozess zur Ermittlung der Events...")
    # Erhalte das Verzeichnis der aktuellen Datei
    current_directory = os.path.dirname(__file__)

    # Kombiniere das aktuelle Verzeichnis mit dem relativen Pfad
    full_path = os.path.join(current_directory, base_path)

    # Kombiniere den Pfad mit dem Dateinamen, um diesen zu öffnen
    file_path = os.path.join(full_path, "events_bremen.csv")

    # Ignoriere alle UserWarnings
    warnings.filterwarnings("ignore", category=UserWarning)

    try:
        events_data = pd.read_csv(file_path, low_memory=False, delimiter=";",
                                  parse_dates=["Beginn_Datum", "Ende_Datum", "Beginn_Uhrzeit", "Ende_Uhrzeit"],
                                  dayfirst=True)

    except FileNotFoundError:
        logging.warn("Warnung: Datei events_bremen.csv nicht gefunden.")

    # Zurücksetzen der Warnungsfilter nach der Verwendung
    warnings.resetwarnings()    

    # Konvertiere Spalte mit Uhrzeit und Datum in Datetime-Objekte (Beginn)
    events_data["begin_date"] = pd.to_datetime(events_data["Beginn_Datum"])
    events_data["begin_time"] = pd.to_datetime(events_data["Beginn_Uhrzeit"])
    events_data["begin_time"] = events_data["Beginn_Uhrzeit"].dt.time

    # Konvertiere Spalte mit Uhrzeit und Datum in Datetime-Objekte (Ende)
    events_data["end_date"] = pd.to_datetime(events_data["Ende_Datum"])
    events_data["end_time"] = pd.to_datetime(events_data["Ende_Uhrzeit"])
    events_data["end_time"] = events_data["Ende_Uhrzeit"].dt.time

    # Umbennenung der Event-Spalten
    events_data["event_type"] = events_data["Art_Event"]
    events_data["event_classification"] = events_data["Eventkennzeichnung"]
    events_data["frequently_visited_stop"] = events_data["Betroffene_Haltestelle"]
    events_data["stop_id"] = events_data["Haltestellen_ID"]


    # Ermittle das aktuelle Datum und die aktuelle Uhrzeit
    now = datetime.now()
    today_date = np.datetime64(date(now.year, now.month, now.day))
    today_time = now.time()

    # Vergleiche das aktuelle Datum und die aktuelle Uhrzeit mit den Events und filtere aktuelle Events heraus
    events_bsag_updates_df = events_data[((events_data["begin_date"].dt.date == today_date) & (
            events_data["end_date"].dt.date >= today_date) & (events_data["begin_date"].dt.date
                                                                != events_data["end_date"].dt.date)) |
                                         (events_data["begin_date"].dt.date == today_date) & (
                                                 events_data["begin_time"] <= today_time) & (
                                                 events_data["end_time"] >= today_time)]

    # Nicht benötigte Spalten entfernen
    events_bsag_updates_df = events_bsag_updates_df.drop(columns=["Beginn_Datum", "Ende_Datum", "Beginn_Uhrzeit", "Ende_Uhrzeit", "Art_Event", "Eventkennzeichnung", "Betroffene_Haltestelle", "Haltestellen_ID"])

    # Wenn es keine Events gibt, dann fülle die Datum-Spalten mit 01-01-1970 und restliche Spalten mit 0
    if events_bsag_updates_df.empty:
        fillna_values = {"begin_date": 0, "end_date": 0, "begin_time": "00:00", "end_time": "00:00", "event_type": "no_event", "event_classification": 0, "frequently_visited_stop": "no_stop", "stop_id": 0}

        # Befülle die dann die Zeitspalten mit 0. Datumsspalten erhalten den Standardwert 01-01-1970
        for column, value in fillna_values.items():
            if "date" in column:
                events_bsag_updates_df.loc[0, column] = pd.to_datetime(value)
            else:
                events_bsag_updates_df.loc[0, column] = value

     # Aktuelle Uhrzeit in Datenframe einfügen
    events_bsag_updates_df["current_time"] = datetime.now().time().strftime("%H:%M:%S")

    # Aktuelles Datum in Datenframe einfügen
    events_bsag_updates_df["current_date"] = datetime.now().date().strftime("%Y-%m-%d")

    # Konvertiere event_classification in Integer
    events_bsag_updates_df["event_classification"] = events_bsag_updates_df["event_classification"].astype(int)     

    # Optional: CSV-Datei aus events_bsag_updates_df erstellen
    events_bsag_updates_df.to_csv("events_bsag_updates.csv", index=False)
    print(CGREEN + "[EVENTS] " + CEND + "Daten erfolgreich ermittelt!")
    return events_bsag_updates_df
