// routes for index of application
const express = require('express');
const router = express.Router();



router.get('/', (req, res) => {
    // res.send('Hello World - Anything');
    res.render('index');
});
 
module.exports = router;