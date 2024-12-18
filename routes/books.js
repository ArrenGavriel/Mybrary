const express = require('express');
const router = express.Router();
const fs = require('fs');   // to remove mishandled book data that already inside /public directory
const Book = require('../models/book'); // access to model
const Author = require('../models/author')
// const multer = require('multer'); // ***
const path = require('path'); ///// ***for image file  handling
// const uploadPath = path.join('public', Book.coverImageBasePath); // *** join the `public` path with the path inside the model file
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
// const upload = multer({ // configure multer
//     dest : uploadPath,
//     fileFilter : (req, file, callback) => {
//         const isValid = imageMimeTypes.includes(file.mimetype); // ???
//         callback(null, isValid); // params => error, boolean true if the file accepted and false if the file not accepted
//     }
// });
/////

// show books route
router.get('/', async (req, res) => {

    let query = Book.find({});

    if(req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i')); // look for matching title in the array based on regular expression 
    }
    
    if(req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore);
    }

    if(req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter);
    }

    try {

        const books = await query.exec(); // query.exec means execute query [!!! => see the query available in monggose]
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
router.post('/', 
    // ***
    /*upload.single('cover'),*/ 
    async (req, res) => {
    // const fileName = req.file != null ? req.file.filename : null; // req.file is the extended property by the multer upload.single [!!!]
    
    const book = new Book({
        title : req.body.title,
        author : req.body.author,
        publishDate : new Date(req.body.publishDate),
        pageCount : req.body.pageCount,
        description : req.body.description
        // coverImageName : fileName // ***use the multer configuration
    });

    saveCover(book, req.body.cover); // params => book object, actual encoded JSON cover

    try {
        const newBook = await book.save();
        res.redirect(`/books/${newBook.id}`);
    } catch (err) {

        console.log('Error creating book: ', err);

        // if(book.coverImageName != null) {
        //     removeBookCover(book.coverImageName);
        // }
        
        renderNewPage(res, book, true);

    }
});





// ADD DYNAMIC ROUTES FOR EDITING AUTHORS
// get book by id route
router.get('/:id', async (req, res) => {
    try {

        const book = await Book.findById(req.params.id)
            .populate('author')
            .exec(); // populate the author collection inside the book object // ???
            res.render('books/show', { book : book });

    } catch (error) {
        res.redirect('/');
    }
});

// edit book route
router.get('/:id/edit', async (req, res) => {
    
    try {
        const book = await Book.findById(req.params.id); // acquire the book id from the url parameter
        renderEditPage(res, book);
    } catch (error) {
        res.redirect('/');
    }

});

// update book route
router.put('/:id',
    // ***
    /*upload.single('cover'),*/ 
    async (req, res) => {
    // same as post to `/books/` endpoint 

    // const fileName = req.file != null ? req.file.filename : null; // req.file is the extended property by the multer upload.single [!!!]
    
    let book;

    console.log('REQUEST BODY: ', req.body); // log

    try {

        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;

        if(req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover);
        }

        await book.save();
        res.redirect(`/books/${book.id}`);

    } catch (err) {

        console.log('Error updating book: ', err); // log

        if(book !=  null) {
            renderEditPage(res, book, true);
        } else {
            res.redirect('/');
        }
    }
});

// delete book route
router.delete('/:id', async (req, res) => {
    let book;

    try {
        book = await Book.findById(req.params.id);
        await book.deleteOne();
        res.redirect('/books');
    } catch (err) {

        console.error('DELETE BOOK FAILED: ', err);

        if(book != null) {
            res.render('books/show', {
                book : book,
                errorMessage : 'Could no remove book'
            });
        } else {
            res.redirect('/');
        }
    }
})









///// modularized function
async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError);
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError);
}

async function renderFormPage(res, book, form, hasError = false) {

    try {

        const authors = await Author.find({}); // authors here act as array containing all the found result of authors
        const params = { 
            authors : authors,
            book : book
        };

        if(hasError) {
            if(form === 'edit') {
                params.errorMessage = 'Error Updating Book';
            } else {
                params.errorMessage = 'Error Creating Book';
            }
        }

        if(hasError) {
            params.errorMessage = 'Error Creating Book';
            // console.error('PARAMS ERROR DETAILS:', params); // log
            // console.error('BOOK ERROR DETAILS:', book); // log
        }

        res.render(`books/${form}`, params);

    } catch(err) {
        console.error('ERROR RENDERING NEW PAGE: ', err);
        res.redirect('/books');
    }
}

// ***
// function removeBookCover(fileName) {
//     // fs.unlink used to delete a file in directory; params => the path where file is located, error handling callback
//     fs.unlink(path.join(uploadPath, fileName), err => {
//         if(err) console.error(err);
//     })
// }

function saveCover(book, coverEncoded) {
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded);
    if(cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}
/////

module.exports = router;