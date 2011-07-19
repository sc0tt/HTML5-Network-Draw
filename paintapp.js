$(document).ready(function () {
	var canvasDiv = document.getElementById('painter');
	var canvas = document.createElement('canvas');
	//canvas.setAttribute('width', window.innerWidth-14);
	//canvas.setAttribute('height', window.innerHeight-14);
	canvas.setAttribute('id', 'paintapp');
	$('paintapp').css('cursor','pointer');
	
	
	canvasDiv.appendChild(canvas);
	context = canvas.getContext("2d");
	context.canvas.width  = window.innerWidth-14;
	context.canvas.height = window.innerHeight-14;
	context.lineWidth = 5;
	context.lineJoin = "round";
	context.strokeStyle = "#000000";
    var waiting = false, qX = new Array(), qY = new Array(), qDrag = new Array(), qsID = new Array();
	var cX = new Array();
	var cY = new Array();
	var cDrag = new Array();
	var sID = new Array();
	var tempX = new Array();
	var tempY = new Array();
	var tempDrag = new Array();
	var tempsID = new Array();
    var lastSentID = 0;
	var isPainting;
	var lasti = 0;
    var processing = false;
	context.fillStyle = '#ffffff';
	context.fillRect (0, 0, canvas.width, canvas.height);
    
	canvas.onselectstart = function () { return false; } 
	canvas.onmousedown = function () { return false; }
	
    var socket = io.connect('http://scottadie.com:6969');
	var sessionId;    
    //SOCKETSSS
    socket.on('connect', function() {
		sessionId = socket.socket.sessionid;
	})
	.on('clear', function() {
		var cX = new Array();
		var cY = new Array();
		var cDrag = new Array();
		var sID = new Array();
		context.fillStyle = '#ffffff';
		context.fillRect(0, 0, canvas.width, canvas.height);
		lasti = 0;
		update();
		
	})
	.on('add', function(x, y, drag, sid) {
        qX = qX.concat(x.split(','));;
		qY = qY.concat(y.split(','));
		qDrag = qDrag.concat(drag.split(','));
		qsID = qsID.concat(sid.split(','));
        waiting = true;
        update();
	});
	
    $('#clr').click(function() {
		socket.emit('clear', $('#login').val());
	});
	
    $(window).resize(function() {
        context.canvas.width  = window.innerWidth-14;
		context.canvas.height = window.innerHeight-14;
		lasti = 0;
        update();
        
    });
    
	$('#paintapp').mousedown(function(e) {
        if(processing == false){
            var mX = e.pageX - this.offsetLeft;
            var mY = e.pageY - this.offsetTop;
            isPainting = true;
            newClick(mX, mY);
            update();
        }
	})
    .mousemove(function(e) {
		if(isPainting && processing == false) {
			newClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
		}
        update();
	})
    .mouseleave(function(e) {
		isPainting = false;
		sendData();
	})
    .mouseup(function(e) {
		isPainting = false;
        update();
		sendData();
	});
	
	function sendData() {
		if(tempX.length > 0) {
			socket.emit('add', tempX.toString(), tempY.toString(), tempDrag.toString(), tempsID.toString());
			tempX = new Array();
			tempY = new Array();
			tempDrag = new Array();
			tempsID = new Array();
		}
	}
	function newClick(x, y, isDragging)	{
        cX.push(x);
        cY.push(y);
        cDrag.push(isDragging);
		sID.push(sessionId);
		tempX.push(x);
        tempY.push(y);
        tempDrag.push(isDragging);
		tempsID.push(sessionId);
	}

	function update(){
        //console.log("Painting: " + isPainting + "; Waiting: " + waiting + "; Processing: " + processing);
        if(isPainting == false && waiting == true && processing == false) {
            processing = true;
            cX = cX.concat(qX);
            cY = cY.concat(qY);
            cDrag = cDrag.concat(qDrag);
			sID = sID.concat(qsID);
            processing = false;
            waiting = false;
            qX = new Array();
            qY = new Array();
            qDrag = new Array();
            qsID = new Array();
        }
    
		for(var i=lasti; i < cX.length; i++) {	
			if(i > 0 && sID[i] != sID[i-1]) cDrag[i] = false;
			context.lineWidth = 5;
            context.lineJoin = "round";
            context.strokeStyle = "#000000";
			if(cDrag[i] && i){
				context.moveTo(cX[i-1], cY[i-1]);
			}else{
				context.moveTo(cX[i]-1, cY[i]);
			}
			context.lineTo(cX[i], cY[i]);
			context.closePath();
			context.stroke();
		}
		lasti = cX.length;
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
        update();
        requestAnimFrame(loop, canvas);
    })();
    $('.hide').click(function() { $('#head').fadeOut(300); });
});

