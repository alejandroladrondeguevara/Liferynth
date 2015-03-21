

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

function getKernel(id) {
    var kernelScript = document.getElementById(id);
    if (kernelScript === null || kernelScript.type !== "x-kernel")
        return null;
    return kernelScript.firstChild.textContent;
}

function initWebCLKernel() {

    // Obtenemos las plataformas e información de ellas
    device = null; var u = 0; platform = null;

    for (var i = 0, il = platforms.length; i < il; ++i) {
        var p = platforms[i];
        var profile = p.getInfo(WebCL.PLATFORM_PROFILE);
        var version = p.getInfo(WebCL.PLATFORM_VERSION);
        var extensions = p.getInfo(WebCL.PLATFORM_EXTENSIONS);

        // Dispositivos en la plataforma p
        var devices = p.getDevices(WebCL.DEVICE_TYPE_ALL);

        for (var j = 0, jl = devices.length; j < jl; ++j) {
            var d = devices[j];
            var devCompUnits = d.getInfo(WebCL.DEVICE_MAX_COMPUTE_UNITS);

            if (device == null || u < devCompUnits) {
                device = d;
                u = devCompUnits;
                platform = p;
            }
        }

        var nameP = platform.getInfo(WebCL.PLATFORM_NAME);
        var nameD = device.getInfo(WebCL.DEVICE_NAME);
    }

    // Creamos el contexto con el dispositivo seleccionado
    var context = webcl.createContext(device.getInfo(WebCL.DEVICE_TYPE));
    console.log('Platform: ', nameP, 'Device: ', nameD);

    DATA_SIZE = totalWalls; //Tantas posiciones en el array como muros pueda llegar a haber
    count = DATA_SIZE;
    results = new Uint8Array(DATA_SIZE);
    globalWorkSize = new Array(1);
    localWorkSize = new Array(1);

    // Creamos una cola de comandos
    queue = context.createCommandQueue(device, null);

    // Obtenemos el programa life (del script)
    kernelSource = getKernel("life");
    if (kernelSource == null) {
        console.error("No hay un kernel de nombre: " + "life"); exit(-1);
    }
    // Lo creamos
    program = context.createProgram(kernelSource);

    // Lo compilamos
    program.build([device]);

    kernel = program.createKernel("life");

    // Crear los arrays de entrada y salida (buffers)
    input = context.createBuffer(webcl.MEM_READ_ONLY, Uint8Array.BYTES_PER_ELEMENT * count);
    output = context.createBuffer(webcl.MEM_WRITE_ONLY, Uint8Array.BYTES_PER_ELEMENT * count);
    if (input == null || output == null) {
        console.error("Fallo al intentar reservar memoria.");
        exit(-1);
    }

}

function runKernel() {

    

    // Escribir los datos en el array de entrada
    queue.enqueueWriteBuffer(input, true, 0, Uint8Array.BYTES_PER_ELEMENT * count, binWalls);
    // Argumentos para nuestro programa Kernel
    kernel.setArg(0, input);
    kernel.setArg(1, output);
    kernel.setArg(2, new Uint32Array([count]));
    kernel.setArg(3, new Uint32Array([rows]));
    kernel.setArg(4, new Uint32Array([cols]));
    kernel.setArg(5, new Uint32Array([lastRow]));
    kernel.setArg(6, new Uint32Array([lastCol]));
    // Obtenemos el tamaño del grupo de trabajo máximo en el dispositivo
    workGroupSize = kernel.getWorkGroupInfo(device, webcl.KERNEL_WORK_GROUP_SIZE);
    // globalWorkSize % workGroupSize tiene que dar 0
    globalWorkSize[0] = count + workGroupSize - (count % workGroupSize);
    localWorkSize[0] = workGroupSize;

    var t0 = performance.now();

    // Ejecutamos el kernel usando el máximo número de "work group items" en este dispositivo
    queue.enqueueNDRangeKernel(kernel, globalWorkSize.length, null, globalWorkSize, localWorkSize);
    // Esperamos a que acaba para recopilar los resultados
    queue.finish();
    // Recuperamos los resultados
    queue.enqueueReadBuffer(output, true, 0, Uint8Array.BYTES_PER_ELEMENT * count, results);

    var t1 = performance.now();
    console.log("Llamada a 'life' (con WebCL) tardó: " + (t1 - t0).toFixed(2) + " milisegundos.");

    /*
    // Validate our results (to 6 figure accuracy)
    var TOINT = function (x) { return Math.floor(1000000 * x); };
    var correct = 0;
    for (var i = 0; i < count; i++) {
        if (TOINT(results[i]) == TOINT(data[i] * data[i]))
            correct++;
    }
    // Print a brief summary detailing the results 
    var msg = "Computed " + correct + "/" + count + " correct values";
    */
    Walls.updateWalls();


}