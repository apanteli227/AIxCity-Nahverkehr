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

            for stop_update in stop_time_update:
                stop_info = {
                    "TripId": trip_update.get('Trip', {}).get('TripId'),
                    "RouteId": trip_update.get('Trip', {}).get('RouteId'),
                    "StartTime": trip_update.get('Trip', {}).get('StartTime'),
                    "StartDate": trip_update.get('Trip', {}).get('StartDate'),
                    "ScheduleRelationship": trip_update.get('Trip', {}).get('ScheduleRelationship'),
                    "StopId": stop_update.get('StopId'),
                    "DepartureDelay": stop_update.get('Departure', {}).get('Delay'),
                    "ScheduleRelationshipStop": stop_update.get('ScheduleRelationship')
                }

                stop_time_updates.append(stop_info)

        return stop_time_updates
    else:
        return None


if __name__ == "__main__":
    gtfsr_url = "https://gtfsr.vbn.de/gtfsr_connect.json"
    gtfsr_data = get_gtfsr_data(gtfsr_url)

    stop_time_updates = extract_stop_time_updates(gtfsr_data)

    if stop_time_updates is not None:
        df = pd.DataFrame(stop_time_updates)
        print(df)
    else:
        print("Fehler beim Extrahieren der StopTimeUpdates.")
