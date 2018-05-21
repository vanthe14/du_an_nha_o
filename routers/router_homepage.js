var express = require('express');
var router = express.Router();

router.route('/')
    .get(function(req, res) {   
        res.render('homepage');
    })
    
module.exports = router;