Enemy = function (game, row, col) {

    //Variables del juego que necesitamos aquí
        this.game = game;
        this.scene = game.scene;
        this.walls = game.walls;
        this.paintedWalls = game.paintedWalls;
        this.posMatrix = game.posMatrix;
        this.numWalls = game.numWalls;
        this.rows = game.rows;
        this.cols = game.cols;
        this.floorHeight = game.floorHeight;
        this.meshPlayer = game.meshPlayer;
        this.collidingBox = game.collidingBox;
        this.gravity = game.gravity;


    // Mismo tamaño que el jugador por ahora (diversos enemigos, diversos tamaños) //TODO
    this.height = 1.75;
    this.width = 0.5;
    this.length = 0.5;
    this.ellipsoid = new BABYLON.Vector3(this.width, this.height / 4, this.length); //Colisionador del enemigo

    var i = row * 2;
    var j = col;
    var p = new BABYLON.Vector3(posMatrix[i][j].x,posMatrix[i][j].y,posMatrix[i][j].z);
    this.position = new BABYLON.Vector3(p.x, floorHeight + this.height / 2, p.z - game.wallScale.z/2);

    this.Move = function (horizontal, positive) {
        /* 
            Mueve al enemigo en una dirección dentro del laberinto
        */
        //Si (horizontal == true) --> Eje x
        if (horizontal) {
            if (positive) { position.x += game.wallWidth; }
            else { position.x -= game.wallWidth; }
        } else {
            if (positive) { position.z += game.wallWidth; }
            else { position.z -= game.wallWidth; }
        }

        RefreshEnemy();
    };

    this.Initialize = function () {
        this.mesh = BABYLON.Mesh.CreateBox("enemy", 1, scene);
        this.collider = BABYLON.Mesh.CreateBox("colEnemy", 1, scene);
        this.mesh.scaling = new BABYLON.Vector3(this.width, this.height, this.length);
        this.collider.scaling = new BABYLON.Vector3(this.width, this.height, this.length);
        this.mesh.position = this.position;
        this.collider.position = this.mesh.position;
        this.collider.checkCollisions = true;
        this.collider.applyGravity = true;
        this.collider.ellipsoid = this.ellipsoid;
        this.collider.showBoundingBox = true;

        var material = new BABYLON.StandardMaterial("enemy", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0, 0); 

        var material2 = new BABYLON.StandardMaterial("collider", this.scene);
        material2.alpha = 0;

        this.mesh.material = material;
        this.collider.material = material2;
    }

    function RefreshEnemy() {
        this.mesh.position = this.position;
        this.collider.position = this.position;
    }
}

