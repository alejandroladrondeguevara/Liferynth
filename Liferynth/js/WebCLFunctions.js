

function listDevices(platforms) {

    for (var i in platforms) {
        var plat = platforms[i];
        var nameP = plat.getInfo(WebCL.PLATFORM_NAME);
        var devices = plat.getDevices();
        for (var j in devices) {
            var nameD = devices[j].getInfo(WebCL.DEVICE_NAME);
            console.log('Platform: ', nameP, 'Device: ', nameD);
        }
    }
}