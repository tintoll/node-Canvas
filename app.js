/**
 * Created by tinoll on 2017. 2. 7..
 */

//모듈 추출
var socketio = require('socket.io');
var express = require('express');
var fs = require('fs');
var http = require('http');
var ejs = require('ejs');

//웹 서버 생성
var app = express();
app.use(express.static(__dirname+'/public'));


//웹 서버 실행
var server = http.createServer(app);
server.listen(52273, function () {
    console.log('Server running http://localhost:52273 ');
});


//라우터 구성
app.get('/',function (req,res,next) {
   fs.readFile('Lobby.html',function (error,data) {
       res.send(data.toString());
   });
});


app.get('/canvas/:room',function (req, res) {
   fs.readFile('Canvas.html','utf8',function (error, data) {
      res.send(ejs.render(data,{
          room : req.params.room
      }));
   });
});

/*
 방을 json 파일로 제공하여 줍니다
 */
app.get('/room',function (req, res) {
    /*
     Object.keys(object) : 개체의 열거 가능한 속성 및 메서드 이름을 반환합니다
     */
    var rooms = Object.keys(io.sockets.adapter.rooms).filter(function (item) {
       return item.indexOf('/') < 0;
    });
    res.send(rooms);
});

//소켓 서버를 생성
var io = socketio.listen(server);
io.sockets.on('connection',function (socket) {
   var roomId = '';

    socket.on('join',function (data) {
        socket.join(data);
        roomId = data;
    });

    socket.on('draw',function (data) {
       io.sockets.in(roomId).emit('line',data);
    });

    socket.on('create_room',function (data) {
        io.sockets.emit('create_room',data.toString());
    })
});