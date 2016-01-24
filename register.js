(function() {
	var width = 320;
	var height = 0;

	var streaming = false;

	var video = null;
	var canvas = null;
	var photo = null;
	var startbutton = null;
	var register = null;
	var photoname = Math.floor((Math.random()*1000000)+1).toString();

	function startup(){
		video = document.getElementById('video');
		canvas = document.getElementById('canvas');
		photo = document.getElementById('photo');
		startbutton = document.getElementById('startbutton');
		register = document.getElementById('register');
		navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

		navigator.getMedia(
		{
			video : true,
			audio : false
		},
		function(stream){
			if(navigator.moxGetUserMedia){
				video.mozSrcObject = stream;
			} else{
				var vendorURL = window.URL || window.webkitURL;
				video.src = vendorURL.createObjectURL(stream);
			}
			video.play();
		},
		function(err){
			console.log("An error occured! "+ err);
		});

		video.addEventListener('canplay',function(ev){
			if(!streaming){
				height = video.videoHeight/(video.videoWidth/width);
				if(isNaN(height)){
					height = width / (4/3);
				}
				video.setAttribute('width',width);
				video.setAttribute('height',height);
				canvas.setAttribute('width',width);
				canvas.setAttribute('height',height);
				streaming = true;
			}
		},false);

		startbutton.addEventListener('click', function(ev){
			$('#loader').css({'display':'block'});
      		takepicture();
      		ev.preventDefault();
    	}, false);

    	register.addEventListener('click',function(ev){
    		$('#loader').css({'display':'block'});
    		registerPhoto();
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
				alert("The picture is uploaded");
				$('#loader').css({'display':'none'});
			});
		} else{
			clearphoto();
		}
	}

	function registerPhoto(){
		var name = $('#name').val();
		var detecturl = 'http://api.skybiometry.com/fc/faces/detect.json?api_key=89fdc94f4d754cd099f0ce18380e3454&api_secret=984ce539ec7349c09178c16874c47c0d&urls=http://interiitfacerecog.comli.com/images/'+ photoname + '.png';
		$.getJSON(detecturl,function(json){
			console.log(json.photos[0].tags[0].tid);
			var tid = json.photos[0].tags[0].tid;
			var tagsave = 'http://api.skybiometry.com/fc/tags/save.json?api_key=89fdc94f4d754cd099f0ce18380e3454&api_secret=984ce539ec7349c09178c16874c47c0d&uid='+name+'@interiitphoto&tids=' + tid;
			$.getJSON(tagsave,function(json){
				var detectedtid = json.saved_tags[0].detected_tid;
				console.log(detectedtid);
				console.log(json.message);
				var trainurl = 'http://api.skybiometry.com/fc/faces/train.json?api_key=89fdc94f4d754cd099f0ce18380e3454&api_secret=984ce539ec7349c09178c16874c47c0d&&uids='+name+'@interiitphoto';
				$.getJSON(trainurl,function(json){
					console.log(json.status);
					console.log(json);
					$('#loader').css({'display':'none'});

					if((json.status)=="success"){
						document.getElementById('output').innerHTML = 'Successfully Registered';
					}
					else{
						document.getElementById('output').innerHTML = 'Registration failed.Please try again';
					}
				});
			});
		});
	}

	window.addEventListener('load',startup,false);
})();