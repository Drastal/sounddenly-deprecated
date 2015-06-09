Number.prototype.toHHMMSS = function () {
	//Returns a number of seconds in traditionnal time format

    var hours   = Math.floor(this / 3600);
    var minutes = Math.floor((this - (hours * 3600)) / 60);
    var seconds = Math.floor(this - (hours * 3600) - (minutes * 60));

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    if (hours   == 0) {
    	var time = minutes+':'+seconds;
	}
	else {
    	var time = hours+':'+minutes+':'+seconds;
	}

    return time;
}