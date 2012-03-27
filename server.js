var io = require('socket.io').listen(6969);

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
      history = [];
			io.sockets.emit('clearUser');
		}
	});
	socket.on('add', function(data) {
    history.push(data);
		socket.broadcast.emit('add', data);
	});
});
var minutes = 5 * 60 * 1000;
setInterval(function() {
  history = [];
  history = [];
  io.sockets.emit('clearUser');
}, minutes);