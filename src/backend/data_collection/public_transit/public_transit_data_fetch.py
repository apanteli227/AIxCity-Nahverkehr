from datetime import datetime

import pandas as pd
import requests


def get_gtfsr_data(url):
    """
    Diese Funktion lädt die GTFS-Realdaten von der VBN-Seite im JSON-Format herunter.
    Diese werden im Format eines DataFrames zurückgegeben.

    Parameters:
    - url (str): Der URL-Link, wo die GTFS-Realtime Daten einsehbar sind.

    Returns:
    - gtfsr_data (dict): Die GTFS-Realtime Daten im JSON-Format.
    """
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Fehler beim Abrufen der Daten. Statuscode: {response.status_code}")
        return None


def extract_stop_time_updates(gtfsr_data):
    """
    Diese Funktion bekommt die GTFS-Realtime Daten im JSON-Format 
    und extrahiert die konkreten StopTimeUpdates. 

    Parameters:
    - gtfsr_data (dict): Die GTFS-Realtime Daten im JSON-Format.

    Returns:
    - stop_time_updates (list): Liste mit StopTimeUpdates.
    """
    if gtfsr_data:
        entities = gtfsr_data.get('Entity', [])
        stop_time_updates = []

        # Iteriere über alle Einträge im DataFrame
        for entity in entities:
            trip_update = entity.get('TripUpdate', {})
            stop_time_update = trip_update.get('StopTimeUpdate', [])

            # Nur Einträge entnehmen, die nicht ##VDV##COMPOSED in der TripId haben
            if "##VDV##COMPOSED" not in trip_update.get('Trip', {}).get('TripId', ''):
                for stop_update in stop_time_update:
                    start_date_str = trip_update.get('Trip', {}).get('StartDate', '')
                    start_time_str = trip_update.get('Trip', {}).get('StartTime', '')

                    # Kombiniere Datum und Uhrzeit zu einem einzigen String
                    datetime_str = f"{start_date_str} {start_time_str}"

                    # Wandele den kombinierten String in ein datetime-Objekt um
                    start_datetime = datetime.strptime(datetime_str, '%Y%m%d %H:%M:%S')
                    stop_info = {
                        "TripId": int(trip_update.get('Trip', {}).get('TripId')),
                        "RouteId": int(trip_update.get('Trip', {}).get('RouteId')),
                        "StartTime": start_datetime,
                        "StartDate": start_datetime.date(),
                        "ScheduleRelationship": trip_update.get('Trip', {}).get('ScheduleRelationship'),
                        "StopId": int(stop_update.get('StopId')),
                        "StopSequence": stop_update.get('StopSequence'),
                        "ArrivalDelay": stop_update.get('Arrival', {}).get('Delay', 0),
                        "DepartureDelay": int(stop_update.get('Departure', {}).get('Delay', 0)),
                        "ScheduleRelationshipStop": stop_update.get('ScheduleRelationship')
                    }
                    # Füge den Eintrag der Liste hinzu
                    stop_time_updates.append(stop_info)

        # Gib die Liste zurück
        return stop_time_updates
    else:
        return None


def create_stop_time_updates_df(stop_time_updates):
    """
    Diese Funktion erstellt ein DataFrame aus der Liste mit den StopTimeUpdates.

    Parameters: 
    - stop_time_updates (list): Liste mit StopTimeUpdates.

    Returns:
    - df (DataFrame): DataFrame mit den StopTimeUpdates.
    """
    if stop_time_updates is not None:
        df = pd.DataFrame(stop_time_updates)
        return df
    else:
        print("Fehler beim Extrahieren der StopTimeUpdates.")
