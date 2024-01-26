import requests
import pandas as pd
import logging
import xml.etree.ElementTree as ET

def get_weather_warning():
    """
    Diese Funktion holt die Wetterwarnungen von wettwarn.de für Bremen.

    Returns:
    - description (str): Die Wetterwarnung als Text.
    """
    url = "https://wettwarn.de/rss/hbx.rss"
    response = requests.get(url)

    if response.status_code == 200:
        xml_content = response.content
        root = ET.fromstring(xml_content)

        # Extrahiere die Informationen aus dem ersten <item> Element
        item = root.find(".//item")

        # Beschreibung der Wetterwarnung
        description = item.find("description").text
        return description
    
    else:
        print("Fehler beim Abrufen des RSS-Feeds. Status Code:", response.status_code)
        return None
