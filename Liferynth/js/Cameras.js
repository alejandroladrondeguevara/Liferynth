
Cameras = function (game) {

    //Variables del juego que necesitamos aquí
    this.game = game;
    this.scene = game.scene;   
    this.floorHeight = game.floorHeight;
    this.playerHeight = game.playerHeight;
    this.meshPlayer = game.meshPlayer;


    topDownCameraHeight = 40;       // Altura de la cámara topdown
    activeCamera = 0;               // 0 = FollowCam, 1 = TopDownCamera
    numCameras = 2;                 // Número de cámaras
    distanceCamera = 3;            // Distancia de la cámara (FolowCam) al jugador

    //Creación de las cámaras
    camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(meshPlayer.position.x, floorHeight + (playerHeight / 2), meshPlayer.position.z - distanceCamera), scene);
    topDownCamera = new BABYLON.FollowCamera("TopDownCam", new BABYLON.Vector3(0, 0, 0), scene);
    //camera2 = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 8, 50, BABYLON.Vector3.Zero(), scene);

    this.Initialize = function () {

        //Cámara que sigue al jugador
        camera.target = meshPlayer; // target any mesh or object with a "position" Vector3
        camera.maxCameraSpeed = 20;
        camera.applyGravity = true;
        camera.radius = -3.5;
        camera.heightOffset = 0.5;
        camera.keysUp = [];
        camera.keysDown = [];
        camera.keysLeft = [];
        camera.keysRight = [];
        scene.activeCamera = camera;

        //Cámara "libre" fija       
        //scene.activeCamera = camera2;
        //camera2.attachControl(canvas, false);

        //Cámara desde arriba
        topDownCamera.position.y = topDownCameraHeight;
        topDownCamera.target = meshPlayer;
        topDownCamera.heightOffset = topDownCameraHeight;
        topDownCamera.radius = -0.1;
        topDownCamera.keysUp = [];
        topDownCamera.keysDown = [];
        topDownCamera.keysLeft = [];
        topDownCamera.keysRight = [];

    }

    window.addEventListener("keydown", function (evt) {

        if (!scene)
            return;
        if (evt.keyCode == 74) {
            activeCamera = (activeCamera + 1) % numCameras;
            switch (activeCamera) {
                case 0:
                    scene.activeCamera = camera;
                    break;
                case 1:
                    scene.activeCamera = topDownCamera;
                    //Registra la distancia actual entre la cámara (FollowCamera) y el jugador 
                    distanceCamera = BABYLON.Vector3.Distance(camera.position, meshPlayer.position);
                    break;
                default:
                    break;
            }
        }
    });

    //BeforeRender
    scene.registerBeforeRender(function () {

        topDownCamera.rotation.y = meshPlayer.rotation.y;

        switch (activeCamera) {
            //FollowCamera
            case 0:
                break;
            //TopDownCamera
            case 1:
                //Actualiza la posición de la cámara 
                camera.position.x = meshPlayer.position.x;// - distanceCamera;
                camera.position.z = meshPlayer.position.z - distanceCamera;
                break;
            default:
                break;
        }

    });


}