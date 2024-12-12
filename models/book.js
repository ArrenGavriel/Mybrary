const mongoose = require('mongoose');

// ???
const coverImageBasePath = 'uploads/bookCovers';
const path = require('path');

// create schema
const bookSchema = new mongoose.Schema({
    // define the column of schema
    title : {
        type : String,
        required : true
    },
    description : {
        type : String
    },
    publishDate : {
        type : Date,
        required : true
    },
    pageCount : {
        type : Number,
        required : true
    },
    createdAt : {
        type : Date,
        required : true,
        default : Date.now
    },
    coverImageName : {// pass the name of the image to database
        type : String,
        required : true
    },
    author : {
        type : mongoose.Schema.Types.ObjectId, // referencing another object => ???
        required : true,
        ref : 'Author'  // the name must match with the model name we set at author model
    }
});

// create virtual property ???
bookSchema.virtual('coverImagePath').get(function() {
    if(this.coverImageName != null) {
        return path.join('/', coverImageBasePath, this.coverImageName);
    }
});

module.exports = mongoose.model('Book', bookSchema); // params => table name, schema
module.exports.coverImageBasePath = coverImageBasePath;