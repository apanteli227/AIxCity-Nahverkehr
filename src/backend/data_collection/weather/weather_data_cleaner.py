from xml.etree.ElementTree import fromstring
import logging
import requests

def get_weather_warning() -> str:
    """
    Diese Funktion holt die Wetterwarnungen von wettwarn.de für Bremen.

    Returns:
    - description (str): Die Wetterwarnung als Text.
    """
    url = "https://wettwarn.de/rss/hbx.rss"
    response = requests.get(url)

    if response.status_code == 200:
        xml_content = response.content
        root = fromstring(xml_content)

        # Extrahiere die Informationen aus dem ersten <item> Element
        item = root.find(".//item")

        # Beschreibung der Wetterwarnung
        #description = item.find("description").text

        # Extrahiere den Text vor dem ersten <br>
        #weather_warning = description.split('<br />')[0].strip()


        # Beschreibung der Wetterwarnung
        description = item.find("title").text

        # Entferne DWD WETTERWARNUNG: aus dem Text
        weather_warning = description.replace("DWD WETTERWARNUNG: ", "")

        return weather_warning

    else:
        logging.warn("Fehler beim Abrufen des RSS-Feeds. Status Code:", response.status_code)
        return ""
