import os
from datetime import datetime

import pandas as pd


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
        events_data = pd.read_csv(file_path, low_memory=False, delimiter=";", dayfirst=True)

    except FileNotFoundError:
        print("Warnung: Datei events_bremen.csv nicht gefunden.")

    # Konvertiere Spalte mit Uhrzeit und Datum in Datetime-Objekte (Beginn)
    events_data["Beginn_Datum"] = pd.to_datetime(events_data["Beginn_Datum"], format="%d.%m.%Y").dt.strftime("%Y-%m-%d")
    events_data["Beginn_Uhrzeit"] = pd.to_datetime(events_data["Beginn_Uhrzeit"], format="%H:%M:%S").dt.strftime(
        "%H:%M:%S")

    # Konvertiere Spalte mit Uhrzeit und Datum in Datetime-Objekte (Ende)
    events_data["Ende_Datum"] = pd.to_datetime(events_data["Ende_Datum"], format="%d.%m.%Y").dt.strftime("%Y-%m-%d")
    events_data["Ende_Uhrzeit"] = pd.to_datetime(events_data["Ende_Uhrzeit"], format="%H:%M:%S").dt.strftime("%H:%M:%S")

    # Ermittel das aktuelle Datum und die Uhrzeit
    actual_datetime = datetime.now()

    # Formatierung der Ausgabe für Datum und Uhrzeit separat
    actual_date = actual_datetime.strftime("%Y-%m-%d")
    actual_time = actual_datetime.strftime("%H:%M:%S")

    # Vergleiche das aktuelle Datum und die aktuelle Uhrzeit mit den Events und filtere aktuelle Events heraus
    events_bsag_updates_df = events_data[((events_data["Beginn_Datum"] == actual_date) & (
            events_data["Ende_Datum"] >= actual_date) & (
                                                  events_data["Beginn_Datum"] != events_data["Ende_Datum"])) |
                                         (events_data["Beginn_Datum"] == actual_date) & (
                                                 events_data["Beginn_Uhrzeit"] <= actual_date) & (
                                                 events_data["Ende_Uhrzeit"] >= actual_time)]

    # CSV-Datei aus events_bsag_updates_dferstellen
    events_bsag_updates_df.to_csv("events_bsag_updates.csv", index=False)

# WICHTIG: Entfernen, wenn nicht mehr gebraucht wird und Aufruf dieser Funktion in anderem Skript stattfindet
# get_events()
