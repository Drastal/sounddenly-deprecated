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
};

function extractRadioDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    // Remove sub-domain and extension
    domain = domain.slice(domain.lastIndexOf(".", domain.lastIndexOf(".") - 1) + 1, domain.lastIndexOf("."));

    // Will return 'Radio' if domain is an IP
    if(!isNaN(domain))
        domain = 'Radio';

    return domain;
}