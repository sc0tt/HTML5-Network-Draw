$(document).ready(function () {
  var canvasDiv = document.getElementById('painter');
  var canvas = document.createElement('canvas');
  canvas.setAttribute('id', 'paintapp');
  canvasDiv.appendChild(canvas);
  var context = canvas.getContext("2d");
  context.canvas.width  = 800;
  context.canvas.height = 480;
  context.lineWidth = 5;
  context.lineJoin = "round";
  context.strokeStyle = "#000000";
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  var lineData = [];
  var currLine = "",
    lasti = 0,
    isPainting = false;
  canvas.onselectstart = function () { return false; } 
  canvas.onmousedown = function () { return false; }
  
  var socket = io.connect('http://radicalwhale.net:6969'),
    sessionId;    
  socket.on('connect', function() {
    sessionId = socket.socket.sessionid;
  })
  .on('clearUser', function() {
    clear();
    lineData = [];
  })
  .on('add', function(data) {
    lineData.push(JSON.parse(data));
    update();
  }); 
  
  $('#clr').click(function() {
    socket.emit('clear', $('#login').val());
  });
  
  $('.hide').click(function() {
    $('#head').css('display','none');
  });
  
  /* $(window).resize(function() {
    context.canvas.width  = window.innerWidth-14;
    context.canvas.height = window.innerHeight-14;
    lasti = 0;
    update();
  }); */
  
  $('#paintapp').mousedown(function(e) {
    var mouseX = e.pageX - this.offsetLeft;
    var mouseY = e.pageY - this.offsetTop;
    isPainting = true;
    currLine = new Line(mouseX,mouseY,false);
    update();
  })
  .mousemove(function(e) { 
    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop; 
    if(isPainting /* && lineData.length > 0 */) {
      if((currLine.x[currLine.x.length-1] != x) && (currLine.y[currLine.y.length-1].y != y)) {
        currLine.add(x, y, true);
        update();
      }
    }
  })
  .mouseleave(function(e) {
    finishLine();
  })
  .mouseup(function(e) {
    finishLine();
  });
  
  function finishLine() {
    if(isPainting) {
      isPainting = false;
      lineData.push(currLine);
      sendData();
      currLine = null;
      update();
    }
  }
  
  function sendData() {
    socket.emit('add', JSON.stringify(lineData[lineData.length-1],null,2));
  }

  function update(){
    if(currLine != null && currLine.x != undefined) {
      lasti++;
      for(var z = 0; z < currLine.x.length; z++) {   
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
    for(var i=lasti; i < lineData.length; i++) {	
      context.lineWidth = 5;
      context.lineJoin = "round";
      context.strokeStyle = "#000000";
      for(var z = 0; z < lineData[i].x.length; z++) {   
        context.beginPath();
        if(lineData[i].drag[z]){
          context.moveTo(lineData[i].x[z-1], lineData[i].y[z-1]);
        }else{
          context.moveTo(lineData[i].x[z-1], lineData[i].y[z]);
        }
        context.lineTo(lineData[i].x[z], lineData[i].y[z]);
        context.closePath();
        context.stroke();
      }
    }
    lasti = lineData.length;
  }
  
  function clear() {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }
  
  window.requestAnimFrame = (function(){
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(/* function */ callback, /* DOMElement */ element){
      window.setTimeout(callback, 1000 / 60);
    };
  })();	

  (function loop() {
    requestAnimFrame(loop, canvas);
  })();
});

var Line = function(x,y,drag)
{
  this.x = [x];
  this.y = [y];
  this.drag = [drag];
  this.add = function(x,y,drag)
  {
    this.x.push(x);
    this.y.push(y);
    this.drag.push(drag);
  }
}