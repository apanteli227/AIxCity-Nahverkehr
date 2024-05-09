const axios = require('axios');
const { Pool } = require('pg');
const schedule = require('node-schedule');
const fs = require('fs');
const { format } = require('fast-csv');

// PostgreSQL-Verbindungsdetails
const pool = new Pool({
  user: 'username',
  host: 'localhost',
  database: 'mydatabase',
  password: 'password',
  port: 5432,
});

// SQL-Abfrage
const query = `
SELECT line, DISTINCT stop_name
FROM bsag_data
ORDER BY line
`;

// Funktion zum Ausführen der SQL-Abfrage und Speichern in CSV
async function runQueryAndSaveToCSV() {
  try {
    const client = await pool.connect();
    const res = await client.query(query);
    client.release();

    // CSV-Dateipfad
    const csvFilePath = '/mnt/data/avgLineDelay.csv';

    // Schreiben in CSV
    const ws = fs.createWriteStream(csvFilePath);
    format.write(res.rows, { headers: true }).pipe(ws);

    console.log('SQL Query erfolgreich ausgeführt und Daten in avgLineDelay.csv gespeichert.');
  } catch (error) {
    console.error(`Fehler bei der Ausführung der SQL-Abfrage: ${error}`);
  }
}

// Täglicher Zeitplan mit node-schedule
const job = schedule.scheduleJob('0 10 * * *', function() {
  runQueryAndSaveToCSV();
});

// Manuelle Testausführung
runQueryAndSaveToCSV();
