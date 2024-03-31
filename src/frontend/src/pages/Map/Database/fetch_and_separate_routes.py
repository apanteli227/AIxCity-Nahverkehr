import requests
import json

def fetch_data():
    url = "https://overpass-api.de/api/interpreter"
    query = {
        'data': '[out:json][timeout:50];(relation[network=VBN][type=route][route=tram];relation[operator=BSAG][type=route][route=bus];);out geom;'
    }
    response = requests.get(url, params=query)
    if response.status_code == 200:
        data = response.json()
        day_routes, night_routes = separate_routes(data['elements'])

        # Speichere Tagesrouten
        with open('day_routes_and_stops.json', 'w') as file:
            json.dump(day_routes, file, ensure_ascii=False, indent=4)
        
        # Speichere Nachtrouten
        with open('night_routes_and_stops.json', 'w') as file:
            json.dump(night_routes, file, ensure_ascii=False, indent=4)
        
        print("Tages- und Nachtrouten erfolgreich aktualisiert.")
    else:
        print("Fehler beim Abrufen der Daten.")

def separate_routes(elements):
    day_routes = [element for element in elements if not element.get('tags', {}).get('by_night', 'no') == 'yes']
    night_routes = [element for element in elements if element.get('tags', {}).get('by_night', 'no') == 'yes']
    return day_routes, night_routes

fetch_data()
