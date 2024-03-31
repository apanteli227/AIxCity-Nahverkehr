import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score

def create_dataset_matrix(data):
    num_rows = len(data)
    num_features = len(data[0])
    num_samples = num_rows - 1
    
    # Initialisiere die X- und Y-Matrizen
    X_matrix = np.zeros((num_samples, 1, num_features))
    Y_matrix = np.zeros((num_samples, 1))
    
    # Fülle die X- und Y-Matrizen
    for i in range(num_samples):
        X_matrix[i] = np.array(data[i:i+1])
        # Wähle jeweils immer ab der 6. Zeile aus der Spalte 'arrival_delay_category' als Label, dann fortlaufend
        Y_matrix[i] = data[i+1][num_features-1]
    
    return X_matrix, Y_matrix


# Lese drei csv-Dateien ein
df_stop_times = pd.read_csv("stop_times_bsag_updates.csv")
df_traffic = pd.read_csv('traffic_data_bsag_updates.csv')
df_weather = pd.read_csv('weather_bremen_df.csv')

# Filtere aus df_stop_times in Spale line 22 und in direction Universität-Ost
df_stop_times = df_stop_times[(df_stop_times['line'] == 22) & (df_stop_times['direction'] == 'Universität-Ost')]

# Merge df_stop_times und df_traffic nach den Spalten start_date, dayquarter und Haltestelle (Spalte 'stop' in df_stop_times und Spalte 'stop_name' in df_traffic)
df_stop_times = pd.merge(df_stop_times, df_traffic, on=['current_date', 'dayquarter', 'stop_name'])

# Merge df_stop_times und df_weather nach den Spalten current_date und dayhour
df_weather = df_weather.rename(columns={'dayhour': 'dayhour_y'})
df_stop_times = pd.merge(df_stop_times, df_weather, on=['date', 'dayhour_y'])

# Datensatz sortieren nach Datum, current_time, starting_time und stop_sequence
df_stop_times = df_stop_times.sort_values(by=['date', 'current_time_x', 'starting_stop_time', 'stop_sequence'])

# Entferne alle datumsähnlichen Spalten sowie Namen und Zeitangaben
df_stop_times = df_stop_times.drop(columns=['time','city','date','starting_stop_time','stop_sequence','date','current_time_x','dayquarter', 'weekday','stop', 'line', 'direction','StopId',"arrival_delay_seconds","departure_delay_seconds","stop_lat","stop_lon","current_time_y","daytime_y","dayhour_y"])

# Reihenfolge Datensatz ändern
df_stop_times = df_stop_times[["daytime_x","dayhour_x","is_workingday","is_holiday","number_of_stops","number_of_building_sites","current_speed","freeflow_Speed","quotient_current_freeflow_speed","temperature_celsius","humidity_percentage","weather_description","wind_speed_m_s","weather_warning","departure_delay_category","arrival_delay_category"]]


# Erstelle eine neue Spalte, die die Tageszeit in Zahlen umwandelt
df_stop_times['daytime_x'] = df_stop_times['daytime_x'].apply(map_daytime)

#csv-Datei erstellen
df_stop_times.to_csv('forecast_new.csv', index=False)

# Spalte departure_delay_category entfernen
df_stop_times = df_stop_times.drop(columns=['departure_delay_category'])

x,y = create_dataset_matrix(df_stop_times.values)

# arrival_delay_categiry aus x entfernen
x = x[:,:,:-1]

print(x)    
print(y)

# Daten vorbereiten
X_flattened = x.reshape(x.shape[0], -1)  # Flattening der X-Matrix für die logistische Regression

# Daten in Trainings- und Testsets aufteilen
X_train, X_test, y_train, y_test = train_test_split(X_flattened, y, test_size=0.2, random_state=42)

# XGBoost initialisieren und trainieren
xgb = XGBClassifier()
xgb.fit(X_train, y_train)

# Vorhersagen machen
y_pred_train = xgb.predict(X_train)
y_pred_test = xgb.predict(X_test)

# Trainings- und Testgenauigkeit bewerten
accuracy_train = accuracy_score(y_train, y_pred_train)
accuracy_test = accuracy_score(y_test, y_pred_test)

# F1-Score berechnen
f1_train = f1_score(y_train, y_pred_train)
f1_test = f1_score(y_test, y_pred_test)

print("Trainingsgenauigkeit von XGBoost: {:.2f}%".format(accuracy_train * 100))
print("Trainings F1-Score von XGBoost: {:.2f}".format(f1_train))
print("Testgenauigkeit von XGBoost: {:.2f}%".format(accuracy_test * 100))
print("Test F1-Score von XGBoost: {:.2f}".format(f1_test))

# Feature Importance plotten
#plt.bar(range(len(xgb.feature_importances_)), xgb.feature_importances_)
#plt.xlabel('Feature Index')
#plt.ylabel('Feature Importance')
#plt.title('Feature Importance Plot')
#plt.show()