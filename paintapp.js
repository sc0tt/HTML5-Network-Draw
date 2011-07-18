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
	var cX = new Array();
	var cY = new Array();
	var cDrag = new Array();

	var isPainting;
	var lasti = 0;
	context.fillStyle = '#ffffff';
	context.fillRect (0, 0, canvas.width, canvas.height);
    
    $(window).resize(function() {
        canvas.setAttribute('width', window.innerWidth-11);
        canvas.setAttribute('height', window.innerHeight-11);
        update();
        lasti = 0;
    });
    
	$('#paintapp').mousedown(function(e) {
		var mX = e.pageX - this.offsetLeft;
		var mY = e.pageY - this.offsetTop;
		isPainting = true;
		newClick(mX, mY);
		update();
	})
    .mousemove(function(e) {
		if(isPainting) {
			newClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
			update();
		}
	})
    .mouseleave(function(e) {
		isPainting = false;
	})
    .mouseup(function(e) {
		isPainting = false;
	});
	
	function newClick(x, y, isDragging)	{
		cX.push(x);
		cY.push(y);
		cDrag.push(isDragging);
	}

	function update(){
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
	function clear() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		var w = canvas.width;
		canvas.width = 1;
		canvas.width = w;
		context.fillRect (0, 0, canvas.width, canvas.height);
	}
});

