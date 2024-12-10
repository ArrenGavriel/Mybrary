const mongoose = require('mongoose');

// create schema
const authorSchema = new mongoose.Schema({
    // define the column of schema
    name : {
        type : String,
        required : true
    }
});


module.exports = mongoose.model('Author', authorSchema); // params => table name, schema