import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path'
import fs from 'fs'
import csv from 'csv-parser'

const app = express();

// Fetch the app directory to set static file shortcut
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
    
const __dirname = dirname(fileURLToPath(import.meta.url));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static(path.join(__dirname, '/public')));

// Import CSV
var data = {}

fs.createReadStream(path.join(__dirname, '/data/generation.csv'))
.pipe(csv())
.on('data', function(data){
    try {
        console.log("NG is: "+data.NG);
        console.log("Local date is: "+data.Local_date);
        //perform the operation
    }
    catch(err) {
        //error handler
    }
})
.on('end',function(){
    //some final operation
});  

app.get('/', (req, res) => {
    res.render('home', {DATA: "hello world!"});
});

app.get('/generation', (req, res) => {
    res.render('generation');
});

app.get('/emissions', (req, res) => {
    res.render('emissions');
});


app.listen(3000);
