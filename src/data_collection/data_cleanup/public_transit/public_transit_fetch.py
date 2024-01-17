import requests
import pandas as pd


def get_gtfsr_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Fehler beim Abrufen der Daten. Statuscode: {response.status_code}")
        return None


def extract_stop_time_updates(gtfsr_data):
    if gtfsr_data:
        entities = gtfsr_data.get('Entity', [])
        stop_time_updates = []

        for entity in entities:
            trip_update = entity.get('TripUpdate', {})
            stop_time_update = trip_update.get('StopTimeUpdate', [])

            if "##VDV##COMPOSED" not in trip_update.get('Trip', {}).get('TripId', ''):
                for stop_update in stop_time_update:
                    stop_info = {
                        "TripId": int(trip_update.get('Trip', {}).get('TripId')),
                        "RouteId": int(trip_update.get('Trip', {}).get('RouteId')),
                        "StartTime": trip_update.get('Trip', {}).get('StartTime'),
                        "StartDate": trip_update.get('Trip', {}).get('StartDate'),
                        "ScheduleRelationship": trip_update.get('Trip', {}).get('ScheduleRelationship'),
                        "StopId": int(stop_update.get('StopId')),
                        "StopSequence": stop_update.get('StopSequence'),
                        "ArrivalDelay": stop_update.get('Arrival', {}).get('Delay',0),
                        "DepartureDelay": int(stop_update.get('Departure', {}).get('Delay',0)),
                        "ScheduleRelationshipStop": stop_update.get('ScheduleRelationship')
                    }

                    stop_time_updates.append(stop_info)

        return stop_time_updates
    else:
        return None
    
def create_stop_time_updates_df(stop_time_updates):
    if stop_time_updates is not None:
        df = pd.DataFrame(stop_time_updates)
        return df
    else:
        print("Fehler beim Extrahieren der StopTimeUpdates.")    
