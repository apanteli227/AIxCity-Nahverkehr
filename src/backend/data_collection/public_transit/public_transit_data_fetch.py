from datetime import datetime
import pandas as pd
import requests
import logging

def get_gtfsr_data(url):
    """
    Diese Funktion lädt die GTFS-Realdaten von der VBN-Seite herunter und
    wandelt diese in ein JSON-Format um.
   
    Parameters:
    - url (str): Der URL-Link, wo die GTFS-Realtime Daten einsehbar sind.

    Returns:
    - gtfsr_data (json): Die GTFS-Realtime Daten im JSON-Format.
    """
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        logging.warn(f"Fehler beim Abrufen der Daten. Statuscode: {response.status_code}")
        return None
    
def extract_stop_time_updates(gtfsr_data) -> list:
    """
    Diese Funktion bearbeitet die übergebene JSON-Datei mit den VBN-Daten so,
    dass diese strukturiert und gereinigt vorliegen. Es werden jeweils die Zeilen
    extrahiert, welche keine ungültige IDs besitzen und diese entsprechend aufbereitet
    und als Liste weitergegeben.
    
    Parameters:
    - gtfsr_data: Die VBN-Daten im JSON-Format.

    Returns:
    - stop_times_updates (list): Liste mit den bereinigten VBN-Daten.
    """
    if not gtfsr_data:
        logging.warn("Link zu VBN-Daten nicht gefunden. Bitte prüfen!")
        return []

    entities = gtfsr_data.get('Entity', [])
    stop_time_updates = []
    for entity in entities:
        trip_update = entity.get('TripUpdate', {})
        stop_time_update = trip_update.get('StopTimeUpdate', [])
        trip_id = trip_update.get('Trip', {}).get('TripId', '')

        # Prüfe, ob TripId mit 'de' beginnt oder den Eintrag ##VDV##COMPOSED enthält
        if not (trip_id.startswith('de') or "##VDV##COMPOSED" in trip_id):
            for stop_update in stop_time_update:
                if not any(item.startswith('de') for item in [stop_update.get('StopId', ''), trip_update.get('Trip', {}).get('RouteId', ''), trip_id]):
                    start_datetime = datetime.strptime(f"{trip_update.get('Trip', {}).get('StartDate', '')} {trip_update.get('Trip', {}).get('StartTime', '')}", '%Y%m%d %H:%M:%S')
                    stop_info = create_stop_info(stop_update, trip_update, start_datetime)
                    stop_time_updates.append(stop_info)

    logging.info("VBN-Verspätungsdaten wurden erfolgreich über den Link ermittelt!")
    return stop_time_updates

def create_stop_info(stop_update, trip_update, start_datetime) -> dict:
    """
    Diese Funktion erstellt ein Dictionary mit den Informationen zur
    entsprechenden Fahrt sowie den Verspätungsdaten.

    Parameters:
    - stop_update: Informationen zu den Haltestellen sowie StopId.
    - trip_update: Informationen zur Fahrt sowie entsprechende TripId..
    - start_datetime: Startzeit der Fahrt.
    
    Returns:
    - stop_info (dict): Dictionary mit den Informationen zur Fahrt und Verspätungsdaten.
    """
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
    return stop_info
   
def create_stop_time_updates_df(stop_time_updates) -> pd.DataFrame:
    """
    Diese Funktion erstellt ein DataFrame aus der Liste mit den StopTimeUpdates (VBN-Daten).

    Parameters: 
    - stop_time_updates (list): Liste mit StopTimeUpdates (VBN-Daten).

    Returns:
    - df (DataFrame): DataFrame mit den StopTimeUpdates.
    """
    if stop_time_updates is not None:
        df = pd.DataFrame(stop_time_updates)
        return df
    else:
        logging.warn("Fehler beim Extrahieren der StopTimeUpdates.")
