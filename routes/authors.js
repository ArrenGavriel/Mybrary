const express = require('express');
const router = express.Router();
const Author = require('../models/author'); // access to model
const Books = require('../models/book');

// all authors route
router.get('/', async (req, res) => {
    let searchOptions = {};
    if(req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i') // params => ???
    }

    try {
        // const authors = await Author.find({}); // search all the objects
        const authors = await Author.find(searchOptions);
        res.render('authors/index', {
            authors : authors,
            searchOptions : req.query
        });
    } catch(err) {
        res.redirect('/');
    }
});

// new authors route
router.get('/new', (req, res) => {
    res.render('authors/new', { author : new Author() });
});

// create authors route
router.post('/', async (req, res) => {
    const author = new Author({
        name : req.body.name
    });

    try {
        // author is no longer accepting callback [deprecated]
        const newAuthor = await author.save();
        res.redirect(`/authors/${author.id}`);
    } catch(err) {
        // res.redirect(`authors/${newAuthor.id}`);

        let errorMessage = 'Error creating author';
        if(err.name === 'ValidationError') {
            errorMessage = 'Name is required';
        }

        res.render('authors/new', {
            author : author,
            errorMessage: errorMessage
        });
    }
    
    // deprecated
    /*await author.save((err, newAuthor) => {
        if(err) {
            res.render('authors/new', {
                author : author,
                errorMessage : 'Error creating author'
            });
        } else {
            res.redirect('authors');
        }
    });
    */
});





// ADD DYNAMIC ROUTES FOR EDITING AUTHORS
router.get('/:id', async (req, res) => {
    try {

        const author = await Author.findById(req.params.id);
        const books = await Books.find({ author : author.id }).limit(6).exec(); // ???
        res.render('authors/show', {
            author : author,
            booksByAuthor : books
        })

    } catch (error) {
        res.redirect('/');
    }
});

router.get('/:id/edit', async (req, res) => {
    
    try {
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', { author : author });
    } catch (error) {
        res.redirect('/authors');
    }
    
});

router.put('/:id', async (req, res) => {
    // same as post to `/authors/` endpoint

    let author; // put the author as global variable to be accessible inside the try and catch block

    try {
        author = await Author.findById(req.params.id); console.log('author object : ' + author);
        author.name = req.body.name; console.log('author name : ' + author.name + 'request body : ' + req.body.name);
        await author.save();
        res.redirect(`/authors/${author.id}`);
    } catch(err) {

        // if the author does not exist, then redirect to home page
        if(author == null) {

            res.redirect('/authors');

        } else {

            // else, fi there is an error while saving, it will log the error as well as render edit page again
            let errorMessage = 'Error updating author';
            if(err.name === 'ValidationError') {
                errorMessage = 'Name is required';
            }

            res.render('authors/edit', {
                author : author,
                errorMessage: errorMessage
            });

        }
    }
});

router.delete('/:id', async (req, res) => {

    try {
        const author = await Author.findById(req.params.id);
        if(author) {
            await author.deleteOne(); // delete the author from the database
            res.redirect('/authors');
        } else {
            console.log('no authors found');
            res.redirect('/authors');
        }

    } catch(err) {

        console.error(err);
        res.redirect(`/authors/${req.params.id}`);
    }
});

module.exports = router;