
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

    //Vistas
    completView = new BABYLON.Viewport(0, 0, 1, 1);
    smallView = new BABYLON.Viewport(0, 0, 0.2, 0.2);

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
        topDownCamera.radius = -0.75;
        topDownCamera.keysUp = [];
        topDownCamera.keysDown = [];
        topDownCamera.keysLeft = [];
        topDownCamera.keysRight = [];

        //Se fija la cámara FollowCamera como principal
        scene.activeCameras[0] = camera;
        //scene.activeCameras[1] = topDownCamera;
        //Se liga la vista completa a la cámara FollowCamera
        camera.viewport = completView;
        //topDownCamera.viewport = smallView;
    }
    
    window.addEventListener("keydown", function (evt) {

        if (!scene)
            return;
        if (evt.keyCode == 74) {
            activeCamera = (activeCamera + 1) % numCameras;
            switch (activeCamera) {
                //Se activa la cámara FollowCamera como principal
                case 0:
                    //Se fija la cámara FollowCamera como principal
                    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
                    scene.activeCameras[0] = camera;
                    //scene.activeCameras[1] = topDownCamera;
                    //Se liga la vista complata a la cámara FollowCamera
                    //topDownCamera.viewport = smallView;
                    camera.viewport = completView;
                    break;
                //Se activa la cámara TopDownCamera como principal
                case 1:
                    //Se fija la cámara TopDownCamera como principal
                    scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
                    scene.activeCameras[0] = topDownCamera;
                    //scene.activeCameras[1] = camera;
                    //Se liga la vista complata a la cámara TopDownCamera
                    topDownCamera.viewport = completView;
                    //camera.viewport = smallView;
                    break;
                default:
                    break;
            }
        }
    });

}