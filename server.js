var io = require('socket.io').listen(6969);
var Canvas = require('canvas'),
canvas = new Canvas(800,480),
context = canvas.getContext('2d'),
fs = require('fs');
// Turn off socket.io debug messages
io.set('log level', 2);
var adminPW = "hello";
var history = [];
io.sockets.on('connection', function(socket) {	
  for(var i = 0; i < history.length; i++) {
    socket.emit('add', history[i]);
  }
  socket.on('clear', function(pass) {
    if(pass == adminPW) {
      io.sockets.emit('clearUser');
      history = [];
    }
  });
  socket.on('add', function(data) {
    history.push(data);
    drawToCanvas(data);
    socket.broadcast.emit('add', data);
  });
});
var minutes = 5 * 60 * 1000;

function drawToCanvas(data)
{
  context.lineWidth = 5;
  context.lineJoin = "round";
  context.strokeStyle = "#000000";
  var currLine = JSON.parse(data);
  for(var z = 1; z < currLine.x.length; z++) {   
    context.beginPath();
    if(currLine.drag[z]){
      context.moveTo(currLine.x[z-1], currLine.y[z-1]);
    }else{
      context.moveTo(currLine.x[z-1], currLine.y[z]);
    }
    context.lineTo(currLine.x[z], currLine.y[z]);
    context.closePath();
    context.stroke();
  }
}

setInterval(function() {
  if(history.length > 0) {
    fs.unlinkSync('./last.png');
    stream = canvas.toDataURL().replace(/^data:image\/png;base64,/,""),
    buffer = new Buffer(stream, 'base64');
    fs.writeFile('./last.png', buffer, function(error) {
      if(error != null) console.log(error);
    });
  }
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.restore();
  history = [];
  io.sockets.emit('clearUser');
}, minutes);
