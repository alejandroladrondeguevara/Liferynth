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
        this.Walls = game.Walls;


    // Mismo tamaño que el jugador por ahora (diversos enemigos, diversos tamaños) //TODO
    this.height = 1.75;
    this.width = 0.5;
    this.length = 0.5;
    ellipsoid = new BABYLON.Vector3(this.width, this.height / 4, this.length); //Colisionador del enemigo

    //var i = row * 2;
    var i = row;
    var j = col;
    p = new BABYLON.Vector3(posMatrix[i][j].x,posMatrix[i][j].y,posMatrix[i][j].z);
    position = new BABYLON.Vector3(p.x, floorHeight + this.height / 2, p.z - game.wallScale.z/2);

    mesh = BABYLON.Mesh.CreateBox("enemy", 1, scene);
    collider = BABYLON.Mesh.CreateBox("colEnemy", 1, scene);

    orientation = true; //{Horizotal: true, Vertical: false}
    direction = true; //{Positivo: true, Negativo: false}    

    this.Move = function () {
        /* 
            Mueve al enemigo en una dirección dentro del laberinto
        */
        //Detección de colisiones
        var foundIt = false;
        var j = 0;  
        while (j < (rows - 1) && !foundIt) {
            var k = 0;
            while (k < cols && !foundIt) {
                if ((walls[j][k] == Walls.WallState.Alive) || (walls[j][k] == Walls.WallState.PermaWall)) {
                    if (paintedWalls[j][k].intersectsMesh(collider, true)) {

                        var random = Math.floor((Math.random() * 10) + 1);

                        if (random < 5) {
                            if (orientation)
                                orientation = false;
                            else
                                orientation = true;
                        } else {
                            if (direction)
                                direction = false;
                            else
                                direction = true;
                        }
                        foundIt = true;
                    }
                }
                k++;
            }
            j++;
        }

        //Si (horizontal == true) --> Eje x
        if (orientation) {
            if (direction) { position.x += 0.1; }//game.wallWidth; }
            else { position.x -= 0.1; }//game.wallWidth; }
        } else {
            if (direction) { position.z += 0.1; }//game.wallWidth; }
            else { position.z -= 0.1; }//game.wallWidth; }
        }

        RefreshEnemy();
    };

    

    this.Initialize = function () {
        //this.mesh = BABYLON.Mesh.CreateBox("enemy", 1, scene);
        //this.collider = BABYLON.Mesh.CreateBox("colEnemy", 1, scene);
        mesh.scaling = new BABYLON.Vector3(this.width, this.height, this.length);
        collider.scaling = new BABYLON.Vector3(this.width, this.height, this.length);
        mesh.position = position;
        collider.position = mesh.position;
        collider.checkCollisions = true;
        collider.applyGravity = true;
        collider.ellipsoid = ellipsoid;
        collider.showBoundingBox = true;

        var material = new BABYLON.StandardMaterial("enemy", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0, 0); 

        var material2 = new BABYLON.StandardMaterial("collider", this.scene);
        material2.alpha = 0;

        mesh.material = material;
        collider.material = material2;
    }

    function RefreshEnemy() {
        mesh.position = position;
        collider.position = position;
    }
}

