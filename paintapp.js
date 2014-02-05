var board;
var cache;
var d;
$(document).ready(function () {  

  board = new DrawingBoard.Board("painter", {
    controlsPosition: "top left",
    webStorage: false,
    controls: [
      'Color',
      {Size: { type: "dropdown" } },
      { Navigation: { back: false, forward: false, reset: false } },
    ]

  });

  var socket = new WebSocket('ws://draw.scottadie.com/echo');    
  socket.onopen = function() {
    socket.send(JSON.stringify({cmd: "ping"}));
  }

  socket.onmessage = function(msg) {
    message = $.parseJSON(msg.data)
    if(message.cmd == "add") {
        board.isDrawing = true;

        var oldColor = board.color;
        board.color = message.data.color;

        var oldSize = board.ctx.lineWidth;
        board.ctx.lineWidth = message.data.size;
        console.log(message.data);
        for(var i = 0; i < message.data.strokes.length; i++)
        {
          board.coords = message.data.strokes[i];
          board.draw();
          console.log("Drew");
        }

        board.color = oldColor;
        board.ctx.lineWidth = oldSize;
        board.isDrawing = false;
    }
  }

  socket.onerror = function(err) { console.log(err); }

  function sendData(cmd, data) {
    socket.send(JSON.stringify({cmd: cmd, data: data}));
  }

  board.ev.bind('board:startDrawing', function(ev) {
      cache = {color: board.color, size: board.ctx.lineWidth, strokes: [board.coords]};
  });

  board.ev.bind('board:stopDrawing', function() {
    sendData('add', cache);
  });

  board.ev.bind('board:drawing', function(ev) {
    if(board.isDrawing)  {
      cache.strokes.push(board.coords);
    }
  });
});