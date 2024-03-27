import datetime

def transform_weather_description(description):
    """
    Diese Funktion transformiert die Wetterbeschreibung in ein einheitliches Format.

    Parameters:
    - description (str): Die Wetterbeschreibung.

    Returns:
    - int: Der transformierte Wert für die Wetterbeschreibung.
    """

    # Dictionary für die Zuordnung von Wetterbeschreibungen zu Werten
    # Quelle: https://openweathermap.org/weather-conditions
    weather_mapping = {
        # Klarer Himmel
        "clear": 0,

        # Wolken
        "few clouds": 1,
        "scattered clouds": 1,
        "broken clouds": 1,
        "overcast clouds": 1,

        # Wetteratmosphäre
        "mist": 2,
        "smoke": 2,
        "haze": 2,
        "fog": 2,
        "sand": 2,
        "dust": 2,

        # Nieselregen
        "light intensity drizzle": 3,
        "drizzle": 3,
        "heavy intensity drizzle": 3,
        "light intensity drizzle rain": 3,
        "drizzle rain": 3,
        "heavy intensity drizzle rain": 3,
        "shower rain and drizzle": 3,
        "heavy shower rain and drizzle": 3,
        "shower drizzle": 3,

        # Regen
        "light rain": 4,
        "moderate rain": 4,
        "heavy intensity rain": 4,
        "very heavy rain": 4,
        "extreme rain": 4,
        "freezing rain": 4,
        "light intensity shower rain": 4,
        "shower rain": 4,
        "heavy intensity shower rain": 4,
        "ragged shower rain": 4,

        # Schnee
        "light snow": 5,
        "snow": 5,
        "heavy snow": 5,
        "sleet": 5,
        "light shower sleet": 5,
        "shower sleet": 5,
        "light rain and snow": 5,
        "rain and snow": 5,
        "light shower snow": 5,
        "shower snow": 5,
        "heavy shower snow": 5,

        # Gewitter
        "thunderstorm with light rain": 6,
        "thunderstorm with rain": 6,
        "thunderstorm with heavy rain": 6,
        "light thunderstorm": 6,
        "thunderstorm": 6,
        "heavy thunderstorm": 6,
        "ragged thunderstorm": 6,
        "thunderstorm with light drizzle": 6,
        "thunderstorm with drizzle": 6,
        "thunderstorm with heavy drizzle": 6
    }

    # Wetterbeschreibung in Kleinbuchstaben umwandeln
    description = description.lower()

    # Überprüfen, ob die Beschreibung im Dictionary vorhanden ist
    for key in weather_mapping:
        if key in description:
            return weather_mapping[key]

    # Wenn die Beschreibung nicht übereinstimmt, gib -1 zurück
    return -1

def transform_weather_warning(weather_warning):
    """
    Diese Funktion transformiert die Wetterwarnungen in ein einheitliches Format.

    Parameters:
    - weather_warning (str): Die Wetterwarnung.

    Returns:
    - int: Der transformierte Wert für die Wetterwarnung.
    """

    # Dictionary für die Zuordnung von Wetterwarnungen zu Werten
    # Quelle: https://wettwarn.de/ueber_wetterwarnungen/warnkriterien/index.html
    weather_warning_mapping = {
        "keine warnung": 0,
        "nebel": 1,
        "frost": 2,
        "tauwetter": 3,
        "glätte": 4,
        "örtlich glatteis": 5,
        "glatteis": 6,
        "starkregen": 7,
        "dauerregen": 8,
        "schneefall": 9,
        "schneeverwehung": 10,
        "windböen": 11,
        "gewitter": 12,
        "starkes gewitter": 13,
        "sehr starkes konvektives ereignis": 14
    }

    # Wetterwarnung in Kleinbuchstaben umwandeln
    weather_warning = weather_warning.lower()

    # Überprüfen, ob die Wetterwarnung im Dictionary vorhanden ist
    for key in weather_warning_mapping:
        if key in weather_warning:
            return weather_warning_mapping[key]

    # Wenn die Wetterwarnung nicht übereinstimmt, gib -1 zurück
    return -1

def assign_hour_value():
    """
    Diese Funktion bestimmt die aktuelle Stunde und weist jedem Stundenbereich einen Zahlenwert zu.
    
    Returns:
    - int: Der Zahlenwert entsprechend der aktuellen Stunde.
    """
    # Aktuelle Uhrzeit abrufen
    current_time = datetime.datetime.now()
    
    # Stunde extrahieren
    current_hour = current_time.hour
    
    # Dictionary mit Zuordnungen von Stunden zu Zahlenwerten
    hour_mapping = {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
        11: 11,
        12: 12,
        13: 13,
        14: 14,
        15: 15,
        16: 16,
        17: 17,
        18: 18,
        19: 19,
        20: 20,
        21: 21,
        22: 22,
        23: 23
    }
    
    # Den Zahlenwert für die aktuelle Stunde aus dem Dictionary abrufen
    return hour_mapping[current_hour]


