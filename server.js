var io = require('socket.io').listen(6969);

// Turn off socket.io debug messages
io.set('log level', 2);

io.sockets.on('connection', function(socket) {
	socket.on('add', function(x, y, drag) {
		socket.broadcast.emit('add', x, y, drag);
	});
});