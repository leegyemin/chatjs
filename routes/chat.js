var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('chat', {info: '입장'});
});

router.post('/:room/:nickname', function (req, res, next) {
    res.render('chat', {room: req.params.room, nickname: req.params.nickname});
});


module.exports = router;
