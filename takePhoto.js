(function(){
	var width = 320; // Setting the width of the streaming screen
	var height = 0; // Initialise the height to 0

	var streaming = false; // Initialise streaming to false

	var video = null; // Set video to null initially
	var canvas = null; // Set canvas to null initially
	var photo = null; // Set photo to null initially
	var takephoto = null; // Set takephoto button to null initially
	var check = null; // Set check button to null initially
	var photoname = Math.floor((Math.random()*10000000) + 1).toString(); // generate a random number and convert to string

	function startup(){
		video = document.getElementById('video'); // get the video element
		canvas = document.getElementById('canvas'); // get the canvas element 
		photo = document.getElementById('photo'); // get the photo button
		takephoto = document.getElementById('takephoto'); // get the takephoto element
		check = document.getElementById('check'); // get the check button
		
		// Getting the Media data 
		// Refer to Mozilla WebRTC docs
		navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);
		// Set getMedia parameters
		navigator.getMedia(
		{
			video : true,
			audio : false
		},
		function(stream){
			if(navigator.mozGetUserMedia){
				video.mozSrcObject = stream;
			}else{
				var vendorURL = window.URL || window.webkitURL;
				video.src = vendorURL.createObjectURL(stream);
			}
			video.play();
		},
		function(err){
			console.log("An error has occured" + err);
		});

		video.addEventListener('canplay',function(ev){
			if(!streaming){
				height = video.videoHeight/(video.videoWidth/width);
				if(isNaN(height)){
					height = width/(4/3);
				}
				video.setAttribute('width',width);
				video.setAttribute('height',height);
				canvas.setAttribute('width',width);
				canvas.setAttribute('height',height);
				streaming = true;
			}
		},false);

		takephoto.addEventListener('click',function(ev){
			takepicture();
			ev.preventDefault();
		},false);

		check.addEventListener('click',function(ev){
			checkPhoto();
		},false);

		clearphoto();
	}

	function clearphoto(){
		var context = canvas.getContext('2d');
		context.fillStyle = '#AAA';
		context.fillRect(0,0,canvas.width,canvas.height);
		var imgdata = canvas.toDataURL('image/png');
		photo.setAttribute('src',imgdata);
	}

	function takepicture(){
		var context = canvas.getContext('2d');
		if(width && height){
			canvas.width = width;
			canvas.height = height;
			context.drawImage(video,0,0,width,height);

			var imgdata = canvas.toDataURL('image/png');
			photo.setAttribute('src',imgdata);
			var data = {
				name : photoname,
				image : imgdata
			};
			$.post('upload.php',data,function(resp,status){
				alert('The picture is uploaded');
			});
		}
		else{
			clearphoto();
		}
	}

})();