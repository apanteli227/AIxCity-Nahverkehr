import schedule
import time
from ml_script import read_all_avgLineDelays  # Import der Funktion aus ml_script.py

def save_data_to_csv(data, file_path='../src/frontend/src/assets/avgLineDelay.csv'):
    data.to_csv(file_path, index=False)
    print(f"Daten wurden in {file_path} gespeichert.")

def job():
    data = read_all_avgLineDelays()
    save_data_to_csv(data)

# Job täglich um 00:00 Uhr ausführen
schedule.every().day.at("00:00").do(job)

# Endlos-Schleife um den Scheduler laufen zu lassen
while True:
    schedule.run_pending()
    time.sleep(1)
