import os
from datetime import datetime, date

import numpy as np
import pandas as pd


def get_events_dataframe(base_path="../resources"):
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
            events_data["Ende_Datum"].dt.date >= today_date) & (events_data["Beginn_Datum"].dt.date
                                                                != events_data["Ende_Datum"].dt.date)) |
                                         (events_data["Beginn_Datum"].dt.date == today_date) & (
                                                 events_data["Beginn_Uhrzeit"] <= today_time) & (
                                                 events_data["Ende_Uhrzeit"] >= today_time)]

    # CSV-Datei aus events_bsag_updates_df erstellen
    events_bsag_updates_df.to_csv("events_bsag_updates.csv", index=False)
    return events_bsag_updates_df
