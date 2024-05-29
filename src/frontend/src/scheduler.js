import { getAvgStopDelay, getAvgLineDelay } from './api.js';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Funktion zur Aktualisierung der Daten und Schreiben in die CSV-Datei
export async function updateData() {
    try {
        const data = await getAvgStopDelay();
        const data2 = await getAvgLineDelay();
        
        // Konvertiere die Daten in CSV-Format
        const csvData = convertToCSV(data);
        const csvData2 = convertToCSV(data2);
        
        // Schreibe die CSV-Daten in eine Datei
        const filePath = path.join(__dirname, './assets/avgStopDelay.csv');
        const filePath2 = path.join(__dirname, './assets/avgLineDelay.csv');
        fs.writeFileSync(filePath, csvData);
        fs.writeFileSync(filePath2, csvData2);
        
        console.log('Data updated and written to avgStopDelay.csv');
    } catch (error) {
        console.error('Error updating data:', error);
    }
    
}

// Hilfsfunktion zur Konvertierung der Daten in CSV-Format
function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Füge die Header-Zeile hinzu
    csvRows.push(headers.join(','));

    // Füge die Datenzeilen hinzu
    for (const row of data) {
        const values = headers.map(header => row[header]);
        csvRows.push(values.join(','));
    }
    console.log("Hallo");
    return csvRows.join('\n');
}

// Funktion, um die API einmal täglich aufzurufen
function scheduleDailyUpdate() {
    // Berechne die Zeit bis Mitternacht
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight - now;

    // Setze einen Timer, um die API beim ersten Mal genau um Mitternacht aufzurufen
    setTimeout(() => {
        updateData();

        // Danach setze einen Timer, der alle 24 Stunden ausgelöst wird
        setInterval(updateData, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
}

// Starte den täglichen Update-Zeitplan
scheduleDailyUpdate();
