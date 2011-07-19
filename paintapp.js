$(document).ready(function () {
	var canvasDiv = document.getElementById('painter');
	var canvas = document.createElement('canvas');
	canvas.setAttribute('width', window.innerWidth-14);
	canvas.setAttribute('height', window.innerHeight-14);
	canvas.setAttribute('id', 'paintapp');
	canvasDiv.appendChild(canvas);
	context = canvas.getContext("2d");
	context.lineWidth = 5;
	context.lineJoin = "round";
	context.strokeStyle = "#000000";
    var waiting = false, tempX = new Array(), tempY = new Array(), tempDrag = new Array();
	var cX = new Array();
	var cY = new Array();
	var cDrag = new Array();
    var lastSentID = 0;
	var isPainting;
	var lasti = 0;
    var processing = false;
	context.fillStyle = '#ffffff';
	context.fillRect (0, 0, canvas.width, canvas.height);
    
    var socket = io.connect('http://radicalwhale.net:6969');
	var sessionId;    
    //SOCKETSSS
    socket.on('connect', function() {
		sessionId = socket.socket.sessionid;
	});
    
    socket.on('add', function(x, y, drag) {
        tempX.push(x);
		tempY.push(y);
		tempDrag.push(drag);
        waiting = true;
        update(); //Easier than doing newClick() a bunch of times
	});
    
    $(window).resize(function() {
        canvas.setAttribute('width', window.innerWidth-11);
        canvas.setAttribute('height', window.innerHeight-11);
        update();
        lasti = 0;
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
	})
    .mouseup(function(e) {
		isPainting = false;
        update();
         //Will eventually send only new data
	});
	/* .mouseup(function(e) {
		isPainting = false;
        var tX, tY, tDrag;
        for(var i = lastSentID; i < cX.length; i++) {
            tX = tX + cX[i] + (i < cX.length-1 ? "," : "");
            tY = tY + cY[i] + (i < cY.length-1 ? "," : "");;
            tDrag = tDrag + cDrag[i] + (i < cDrag.length-1 ? "," : "");;     
        }
        socket.emit('add', tX, tY, tDrag); //Will eventually send only new data
	}); */
	function newClick(x, y, isDragging)	{
        cX.push(x);
        cY.push(y);
        cDrag.push(isDragging);
        socket.emit('add', x, y, isDragging);
	}

	function update(){
        //console.log("Painting: " + isPainting + "; Waiting: " + waiting + "; Processing: " + processing);
        if(isPainting == false && waiting == true && processing == false) {
            processing = true;
            cX = cX.concat(tempX);
            cY = cY.concat(tempY);
            cDrag = cDrag.concat(tempDrag);
            processing = false;
            waiting = false;
            tempX = new Array();
            tempY = new Array();
            tempDrag = new Array();
        }
    
		for(var i=lasti; i < cX.length; i++) {	
			context.beginPath();
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
    
});

