import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// pull data
const generationCSV = 'data/generation.csv';
function getData(file, type) {
    let data = {ng: [], date: []};
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .on('error', error => {
                reject(error);
            })
            .pipe(csv())
            .on('data', (row) => {
                let ngValue = parseFloat(row.NG.replace(/,/g, ''));
                ngValue = isNaN(ngValue) ? 0 : ngValue;
                let date = new Date(row.Local_date);

                data.ng.push(ngValue);
                data.date.push(date)
            })
            .on('end', () => {
                resolve(data);
            });
    });
}

const data = await getData(generationCSV, {});

const app = express();

// Fetch the app directory to set static file shortcut
const __dirname = dirname(fileURLToPath(import.meta.url));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); // Use __dirname to set absolute path
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.redirect('/generation');
});

app.get('/api/data', (req, res) => {
    res.json(data);
});

app.get('/generation', (req, res) => {
    res.render('generation');
});

app.get('/emissions', (req, res) => {
    res.render('emissions');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
