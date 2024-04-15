import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Define application constants - CSV file paths
const GENERATION_DAILY_CSV = 'data/generation_daily.csv';
const GENERATION_HOURLY_CSV = 'data/generation_hourly.csv';
const PORT = 3000;

// Read Daily CSV file and store data in an object
let years = [];
function get_daily(file) {
    let data = {ng: [], date: [], co2_emissions: [], co2_emissions_col: [], co2_emissions_ng: [], co2_emissions_oil: []};
    // Return a promise to handle async operation
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .on('error', error => {
                reject(error);
            })
            .pipe(csv())
            .on('data', (row) => {
                // ng is net generation value, convert to float and remove commas
                let ng = parseFloat(row.NG.replace(/,/g, ''));
                ng = isNaN(ng) ? 0 : ng;

                let date = new Date(row.Local_date);

                // co2_emissions is co2 emissions generated, convert to float and remove commas
                let co2_emissions = parseFloat(row.CO2_Emissions_Generated.replace(/,/g, ''));
                co2_emissions = isNaN(co2_emissions) ? 0 : co2_emissions;

                // co2_emissions_col is co2 emissions generated from coal, convert to float and remove commas
                let co2_emissions_col = parseFloat(row.CO2_Emissions_COL.replace(/,/g, ''));
                co2_emissions_col = isNaN(co2_emissions_col) ? 0 : co2_emissions_col;

                // co2_emissions_ng is co2 emissions generated from natural gas, convert to float and remove commas
                let co2_emissions_ng = parseFloat(row.CO2_Emissions_NG.replace(/,/g, ''));
                co2_emissions_ng = isNaN(co2_emissions_ng) ? 0 : co2_emissions_ng;

                // co2_emissions_oil is co2 emissions generated from oil, convert to float and remove commas
                let co2_emissions_oil = parseFloat(row.CO2_Emissions_OIL.replace(/,/g, ''));
                co2_emissions_oil = isNaN(co2_emissions_oil) ? 0 : co2_emissions_oil;

                // Store unique years in an array to use in UI dropdown
                if(!years.includes(date.getFullYear())) {
                    years.push(date.getFullYear());
                }

                // Store data in object
                data.ng.push(ng);
                data.date.push(date);
                data.co2_emissions.push(co2_emissions);
                data.co2_emissions_col.push(co2_emissions_col);
                data.co2_emissions_ng.push(co2_emissions_ng);
                data.co2_emissions_oil.push(co2_emissions_oil);
            })
            .on('end', () => {
                // Return the data object to the promise
                resolve(data);
                resolve(years);
            });
    });
}

// Read Hourly CSV file and store data in an object. This function is similar to get_daily, no need to store emissions or years
function get_hourly(file) {
    let data = {ng: [], date: [], hour: []};
    // Return a promise to handle async operation
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .on('error', error => {
                reject(error);
            })
            .pipe(csv())
            .on('data', (row) => {
                // ng is net generation value, convert to float and remove commas
                let ng = parseFloat(row.NG.replace(/,/g, ''));
                ng = isNaN(ng) ? 0 : ng;

                let date = new Date(row.Local_date);
                let hour = row.Hour;

                // Store data in object
                data.ng.push(ng);
                data.date.push(date);
                data.hour.push(hour);
            })
            .on('end', () => {
                // Return the data object to the promise
                resolve(data);
            });
    });
}

// Fetch data from CSV file
const data_daily = await get_daily(GENERATION_DAILY_CSV);
const data_hourly = await get_hourly(GENERATION_HOURLY_CSV);
const app = express();

// Fetch the app directory to set static file shortcut
const __dirname = dirname(fileURLToPath(import.meta.url));

// Set up handlebars as the view engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); // Use __dirname to set absolute path
app.use(express.static(path.join(__dirname, '/public')));

// Redirect to generation page
app.get('/', (req, res) => {
    res.redirect('/generation');
});

// API endpoint to return data
app.get('/api/data_daily', (req, res) => {
    res.json(data_daily);
});

// API endpoint to return hourly data
app.get('/api/data_hourly', (req, res) => {
    res.json(data_hourly);
});

app.get('/generation', (req, res) => {
    res.render('generation', {years: years});
});

app.get('/emissions', (req, res) => {
    res.render('emissions', {years: years});
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
