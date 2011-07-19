var io = require('socket.io').listen(6969);

// Turn off socket.io debug messages
io.set('log level', 2);
var adminPW = "hello";
io.sockets.on('connection', function(socket) {
	socket.on('add', function(x, y, drag, sid) {
		socket.broadcast.emit('add', x, y, drag, sid);
	});
	socket.on('clear', function(pass) {
		if(pass == adminPW) {
			socket.emit('clear');
		}
	});
});