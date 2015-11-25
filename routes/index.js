var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'wegweg', content: 'wefwef'});
});

router.post('/:nickname', function (req, res, next) {
    res.render('room', {info: 'room create', nickname: req.params.nickname});
});

module.exports = router;
