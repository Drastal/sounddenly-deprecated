angular.module('sounddenly', [
	'ngRoute',
	'ngAnimate',
	'sounddenly.services',
	'sounddenly.directives',
	'sounddenly.filters',
	'sounddenly.controllers',
	'ngSanitize',
	'LocalStorageModule',
	'snap'
	])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
        .when('/', {controller:'HomeCtrl', templateUrl: 'views/home.html'})
        .otherwise({redirectTo: '/'});
    }])

	.config(['localStorageServiceProvider', function(localStorageServiceProvider){
		localStorageServiceProvider.setPrefix('sounddenly');
		localStorageServiceProvider.setNotify(true, true);
	}])

	.config(function() {
	    try {
	        // Fix up for prefixing
	        window.AudioContext = window.AudioContext || window.webkitAudioContext;
			console.log("Audio context created");


			var audioBuffer;
			var sourceNode;

	    } catch (e) {
	        alert('Web Audio API is not supported in this browser');
	    }
	})

	.run(function($rootScope, localStorageService) {

		$rootScope.background = localStorageService.get('backgroundColor') ? localStorageService.get('backgroundColor') : 'dark';
		$rootScope.color = localStorageService.get('accentColor') ? localStorageService.get('accentColor') : 'turquoise';

		var context;
		        context = new AudioContext();
				// load the sound
				setupAudioNodes();
				loadSound("sounds/loop.mp3");

		function setupAudioNodes() {
		    // create a buffer source node
		    sourceNode = context.createBufferSource();
		    // and connect to destination
		    sourceNode.connect(context.destination);
		    sourceNode.loop = false;

		    console.log("Audio Nodes setup");
		}

		// load the specified sound
		function loadSound(url) {
		    var request = new XMLHttpRequest();
		    request.open('GET', url, true);
		    request.responseType = 'arraybuffer';

		    // When loaded decode the data
		    request.onload = function() {

		        // decode the data asynchronously
		        context.decodeAudioData(request.response, function(buffer) {
		            // when the audio is decoded play the sound
		            playSound(buffer);
		        }, onError);
		    }
		    request.send();

		    console.log("Sound loaded");
		}

		function playSound(buffer) {
		    sourceNode.buffer = buffer;
		    sourceNode.start(0);
		}

		// log if an error occurs
		function onError(e) {
		    console.log(e);
		}
	});