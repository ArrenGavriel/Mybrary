const mongoose = require('mongoose');

const coverImageBasePath = 'uploads/bookCovers'; // *** specify the path where the image stored in local server inside the `views`
const path = require('path'); // ***

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
    coverImage : { // ???
        type : Buffer,
        required : true
    },
    coverImageType : { // ???
        type : String,
        required : true
    },
    // coverImageName : {// ***pass the name of the image to database
    //     type : String,
    //     required : true
    // },
    author : {
        type : mongoose.Schema.Types.ObjectId, // referencing another object => special datatype in mongoDB [!!!]
        required : true,
        ref : 'Author'  // the name must match with the model name we set at author model
    }
});

// create virtual property for getting the resource path for which the cover image resource located in local web server
// ***
// bookSchema.virtual('coverImagePath').get(function() {
//     if(this.coverImageName != null) {
//         return path.join('/', coverImageBasePath, this.coverImageName);
//     }
// });

// this is 
bookSchema.virtual('coverImagePath').get(function() {
    // ??? why it i
    if(this.coverImage != null && this.coverImageType != null) {
        return `data: ${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`;
    }
});

module.exports = mongoose.model('Book', bookSchema); // params => table name, schema
// module.exports.coverImageBasePath = coverImageBasePath;  // ***