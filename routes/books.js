const express = require('express');
const router = express.Router();
const fs = require('fs');   // to remove mishandled book data that already inside /public directory
const Book = require('../models/book'); // access to model
const Author = require('../models/author')
const multer = require('multer');
const path = require('path'); ///// for image file  handling
const uploadPath = path.join('public', Book.coverImageBasePath); // join the `public` path with the path inside the model file
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const upload = multer({
    dest : uploadPath,
    fileFilter : (req, file, callback) => {
        const isValid = imageMimeTypes.includes(file.mimetype);
        callback(null, isValid); // params => error, boolean true if the file accepted and false if the file not accepted
    }
});
/////

// show books route
router.get('/', async (req, res) => {

    let query = Book.find({});

    if(req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i')); // regex literal and regex object??
    }
    
    if(req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore);
    }

    if(req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter);
    }

    try {

        const books = await query.exec(); // what is exec ??
        res.render('books/index', {
            books : books,
            searchOptions: req.query
        });

    } catch (error) {
        res.redirect('/');
    }
    
});

// new books route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
});

// create books route
// the image image name stored in the form of string to the document of the collection in mongoDB databaase
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    
    const book = new Book({
        title : req.body.title,
        author : req.body.author,
        publishDate : new Date(req.body.publishDate),
        pageCount : req.body.pageCount,
        description : req.body.description,
        coverImageName : fileName // use the multer configuration
    });

    try {
        const newBook = await book.save();
        // res.redirect(`/books/${newBook.id}`);
        res.redirect(`/books`);
    } catch (err) {

        console.log('Error creating book: ', err);

        if(book.coverImageName != null) {
            removeBookCover(book.coverImageName);
        }
        
        renderNewPage(res, book, true);

    }
});

///// modularized function
async function renderNewPage(res, book, hasError = false) {

    try {

        const authors = await Author.find({}); // authors here act as array containing all the found result of authors
        const params = { 
            authors : authors,
            book : book
        };

        if(hasError) {
            params.errorMessage = 'Error Creating Book';
            console.error('params Error Details:', params);
            console.error('book Error Details:', book);
        }

        res.render('books/new', params);

    } catch(err) {
        console.error('Error rendering new page: ', err);
        res.redirect('/books');
    }
}

function removeBookCover(fileName) {

    // fs.unlink used to delete a file in directory; params => the path where file is located, error handling callback
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err);
    })
}
/////

module.exports = router;