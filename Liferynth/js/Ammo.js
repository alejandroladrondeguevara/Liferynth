Ammo = function (game) {

    //Variables del juego que necesitamos aquí
    this.game = game;
    this.scene = game.scene;
    this.rows = game.rows;
    this.cols = game.cols;
    this.meshPlayer = game.meshPlayer;
    this.planeWidthSize = game.planeWidthSize;
    this.planeDepthSize = game.planeDepthSize;
    this.Player = game.Player;

    //Constantes
    var MISSILE_SIZE = 0.5;         //Tamaño del misil
    var wallWidth = 6;
    var planePosXini = -wallWidth * (cols / 2);
    var planePosZini = (wallWidth / 2) + wallWidth * (rows / 2);   

    //Variables
    var ammo = []; 

    this.Initialize = function (numAmmo) {
                
        for (var i = 0; i < numAmmo; i++) {

            // Material 
            var material = new BABYLON.StandardMaterial("ammoMaterial1", scene);
            material.diffuseColor = new BABYLON.Color3.Black();

            //Instancia un nuevo misil
            var missile = BABYLON.Mesh.CreateSphere("Sphere", 20, 1, scene);
            missile.scaling = new BABYLON.Vector3(MISSILE_SIZE, MISSILE_SIZE, MISSILE_SIZE);
            missile.position = new BABYLON.Vector3(Math.floor((Math.random() * planeWidthSize) + planePosXini), meshPlayer.position.y, Math.floor((Math.random() * (-planeDepthSize)) + planePosZini));
            missile.material = material;

            ammo[i] = missile;
        }

        this.scene.registerBeforeRender(function () {
            
            for (var j = 0; j < numAmmo; j++) {
                // Si el jugador "coge" el misil
                if (meshPlayer.intersectsMesh(ammo[j], true) && Player.GetNumMissiles() < Player.GetMaxMissiles()) {
                    // Se cambia la posisción del misil
                    ammo[j].position.x = Math.floor((Math.random() * planeWidthSize) + planePosXini);
                    ammo[j].position.z = Math.floor((Math.random() * (-planeDepthSize)) + planePosZini);
                    // Se incrementa la munición del jugador
                    Player.IncrementMissiles();                    
                }
            }
        });

        return ammo;
    }
}