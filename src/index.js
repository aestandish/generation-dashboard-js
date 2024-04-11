import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';

const app = express();

// Fetch the app directory to set static file shortcut
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); // Use __dirname to set absolute path
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.render('home');
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
