import pandas as pd
from sqlalchemy import create_engine
import schedule
import time

# Konfiguration der Datenbankverbindung
db_url = 'postgresql://username:password@localhost:5432/mydatabase'
engine = create_engine(db_url)

# Definierte SQL-Abfrage
query = """
SELECT line, DISTINCT stop_name
FROM bsag_data
ORDER BY line
"""

# Funktion zur Ausführung der SQL-Abfrage und Speichern der Ergebnisse in einer CSV-Datei
def run_query_and_save_to_csv():
    try:
        df = pd.read_sql_query(query, engine)
        df.to_csv('/mnt/data/avgLineDelay.csv', index=False)
        print("SQL Query erfolgreich ausgeführt und Daten in avgLineDelay.csv gespeichert.")
    except Exception as e:
        print(f"Fehler bei der Ausführung der SQL-Abfrage: {e}")

# Zeitplan: Ausführen der Funktion jeden Tag um 10 Uhr
schedule.every().day.at("10:00").do(run_query_and_save_to_csv)

# Endlos-Schleife, die den Zeitplan ausführt
while True:
    schedule.run_pending()
    time.sleep(60)  # Überprüfung alle 60 Sekunden
