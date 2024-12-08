if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const indexRouter = require('./routes/index');
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true }); // what is userNewUrlParser???
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // __dirname is the environment variable or superglobal variable for getting the name of current working directory
app.set('layout', 'layouts/layout'); // every single file is gonna be put inside layout file, so we dont have to duplicate the html header and footer

app.use(expressLayouts); // use express layouts variable
app.use(express.static('public')); // where are public files stored [images, sytlesheets, javascript, etc]; the directory name
app.use('/', indexRouter);

app.listen(process.env.PORT || 3000); // pull the port number from environment variable in .env for production or else use 3000 in production