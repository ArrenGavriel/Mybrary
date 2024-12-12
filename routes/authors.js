const express = require('express');
const router = express.Router();
const Author = require('../models/author'); // access to model

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
        res.redirect(`/authors`);
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

module.exports = router;