import pandas as pd
from datetime import datetime, time
import logging
import os

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
        events_data = pd.read_csv(file_path, low_memory=False)
    except FileNotFoundError:
        print("Warnung: Datei events_bremen.csv nicht gefunden.")

    # Abrufen der Events
    print(events_data.head())

    # Ermittle die aktuelle Uhrzeit
    today_time = datetime.now().time()

    # Ermittle das aktuelle Datum
    today_date = datetime.now().date()

    """
    Vergleiche stop_times_updates mit Event-Liste und matche anhand von Datum und Uhrzeit
    aktuell stattfindene Fußballspiele, Demos oder Osterwiese

    Implementierung folgt noch...
    """

    events_bsag_bremen = {
    'Datum': [datetime.date.today()],
    'Uhrzeit': [datetime.datetime.now().strftime("%H:%M")],
    'Fussballspiel': [fussballspiel],
    'Osterwiese': [osterwiese],
    'Demonstration': [demonstration]
}   