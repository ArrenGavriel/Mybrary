const mongoose = require('mongoose');
const Book = require('./book');

// create schema
const authorSchema = new mongoose.Schema({
    // define the column of schema
    name : {
        type : String,
        required : true
    }
});

// ???
authorSchema.pre('deleteOne', { document : true, query : false }, async function(next) {

    try {
        const books = await Book.find({ author : this._id});
        if(books.length > 0) {
            next(new Error('This auther has books still'));
        } else {
            next();
        }
    } catch (error) {
        next(error);
    }
    
});

module.exports = mongoose.model('Author', authorSchema); // params => table name, schema