import os
from datetime import datetime, date
import logging
import numpy as np
import pandas as pd


def get_events_dataframe(base_path="../resources") -> pd.DataFrame:
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
        logging.warn("Warnung: Datei events_bremen.csv nicht gefunden.")

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
    events_bsag_updates_df = events_bsag_updates_df.drop(columns=["Beginn_Datum", "Ende_Datum", "Beginn_Uhrzeit", "Ende_Uhrzeit", "Art_Event", "Eventkennzeichnung"])
    
    # Optional: CSV-Datei aus events_bsag_updates_df erstellen
    events_bsag_updates_df.to_csv("events_bsag_updates.csv", index=False)
    
    return events_bsag_updates_df