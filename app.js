var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var chat = require('./routes/chat');

var app = express();

var io = require('socket.io').listen('8010');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/chat', chat);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}

    });
});

var rooms = [];

var room;
var nickname;

io.sockets.on('connection', function (socket) {
    socket.on('joinroom', function (data) {

        room = data.room;
        nickname = data.nickname;

        socket.join(data.room);

        console.log("(socket id):" + socket.id + ", (nickname):" + data.nickname);

        // Create Room
        if (rooms[room] == undefined) {
            console.log('room create :' + room);
            rooms[room] = new Object();
            rooms[room].socket_ids = new Object();
        }

        // 닉네임 중복 체크 
        if (rooms[room].socket_ids[data.nickname]) {
            console.log("data.nickname(" + data.nickname + ")은 중복되는 nickname 입니다.");
            socket.emit("chat_fail", data.nickname);
            //return;
        } else {
            // Store current user's nickname and socket.id to MAP
            rooms[room].socket_ids[data.nickname] = socket.id;
            socket.broadcast.to(data.room).emit('new', data.nickname);
        }

        //user list 
        var userList = [];
        for (nickname in rooms[room].socket_ids) {
            userList.push(nickname);
            console.log(nickname);
        }
        io.sockets.in(room).emit("user_list", userList);

    });

    socket.on('sendmsg', function (data) {
        if (data.to === "ALL") {
            console.log("send ALL msg");
            io.sockets.in(room).emit('broadcast_msg', data);
        } else {
            console.log("send secrect msg");
            // 귓속말
            var socket_id = rooms[room].socket_ids[data.to];
            if (socket_id != undefined) {
                data.msg = '(귓속말) :' + data.msg;
                io.sockets.connected[socket_id].emit('broadcast_msg', data);

                //test
            }
        }
    });

    socket.on('disconnect', function () {
        if (rooms[room].socket_ids[nickname] === socket.id) {
            delete rooms[room].socket_ids[nickname];
        }
        io.sockets.in(room).emit("disconnected", nickname);
        socket.leave(room);
    });
});

function test() {
    console.log("test");
}

module.exports = app;
