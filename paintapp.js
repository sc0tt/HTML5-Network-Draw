$(document).ready(function () {
  var canvasDiv = document.getElementById('painter');
  var canvas = document.createElement('canvas');
  canvas.setAttribute('id', 'paintapp');
  canvasDiv.appendChild(canvas);
  var context = canvas.getContext("2d");
  context.canvas.width  = window.innerWidth - 14;
  context.canvas.height = window.innerHeight - 14;
  context.lineWidth = 5;
  context.lineJoin = "round";
  context.strokeStyle = "#000000";
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  var lineData = [],
    currLine,
    lasti = 0,
    isPainting = false;
  canvas.onselectstart = function () { return false; } 
  canvas.onmousedown = function () { return false; }
  
  /* var socket = io.connect('http://localhost:6969'),
    sessionId;    
  //SOCKETSSS
  socket.on('connect', function() {
    sessionId = socket.socket.sessionid;
  })
  .on('clear', function() {
    //lineData = [];
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  })
  .on('add', function(data) {
    
  }); */
  
  $('#clr').click(function() {
    /* socket.emit('clear', $('#login').val()); */
  });
  
  $(window).resize(function() {
    context.canvas.width  = window.innerWidth-14;
    context.canvas.height = window.innerHeight-14;
    lasti = 0;
  });
  
  $('#paintapp').mousedown(function(e) {
    var mouseX = e.pageX - this.offsetLeft;
    var mouseY = e.pageY - this.offsetTop;
    isPainting = true;
    currLine = new Line(mouseX,mouseY,false);
  })
  .mousemove(function(e) { 
    if(isPainting) {
      currLine.add(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
    }
  })
  .mouseleave(function(e) {
    if(isPainting) {
      isPainting = false;
      lineData.push(currLine);
      update();
    }
  })
  .mouseup(function(e) {
    if(isPainting) {
      isPainting = false;
      lineData.push(currLine);
      update();
    }
  });
  
  function sendData() {
    /* if(tempX.length > 0) {
      console.log("test");
      socket.emit('add', JSON.stringify(pointData,null,2));
    } */
  }

  function update(){
    //console.log("Painting: " + isPainting + "; Waiting: " + waiting + "; Processing: " + processing);   
    for(var i=lasti; i < lineData.length; i++) {	
      context.lineWidth = 5;
      context.lineJoin = "round";
      context.strokeStyle = "#000000";
      for(var z = 0; z < lineData[i].x.length; z++) {   
        if(lineData[i].drag[z]){
          context.moveTo(lineData[i].x[z-1], lineData[i].y[z-1]);
        }else{
          context.moveTo(lineData[i].x[z-1], lineData[i].y[z]);
        }
      }
      context.lineTo(lineData[i].x[z], lineData[i].y[z]);
      context.closePath();
      context.stroke();
    }
    lasti = lineData.length;
  }
  function clear() { //never used, for debugging
    context.clearRect(0, 0, canvas.width, canvas.height);
    var w = canvas.width;
    canvas.width = 1;
    canvas.width = w;
    context.fillRect (0, 0, canvas.width, canvas.height);
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
    //update();
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
    console.log("Adding data to my arrays");
    this.x.push(x);
    this.y.push(y);
    this.drag.push(drag);
  }
}

