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
        this.meshPlayer = game.meshPlayer;
        this.Player = game.Player;


    // Mismo tamaño que el jugador por ahora (diversos enemigos, diversos tamaños) //TODO
    this.height = 1.75;
    this.width = 0.5;
    this.length = 0.5;
    var ellipsoid = new BABYLON.Vector3(this.width, this.height / 4, this.length); //Colisionador del enemigo

    //var i = row * 2;
    var i = row;
    var j = col;
    //var p = new BABYLON.Vector3(posMatrix[i][j].x,posMatrix[i][j].y,posMatrix[i][j].z);
    //var position = new BABYLON.Vector3(p.x, floorHeight + this.height / 2, p.z - game.wallScale.z/2);
    var position = new BABYLON.Vector3(i, floorHeight + this.height / 2, j);

    var mesh = BABYLON.Mesh.CreateBox("enemy", 1, scene);
    var collider = BABYLON.Mesh.CreateBox("colEnemy", 1, scene);

    var orientation = true; //{Horizotal:false, Vertical: true}
    var direction = true; //{Positivo: true, Negativo: false}
    var diagonal = false; //{}

    this.Initialize = function () {
        //this.mesh = BABYLON.Mesh.CreateBox("enemy", 1, scene);
        //collider = BABYLON.Mesh.CreateBox("colEnemy", 1, scene);
        mesh.scaling = new BABYLON.Vector3(this.width, this.height, this.length);
        collider.scaling = new BABYLON.Vector3(this.width, this.height, this.length);
        mesh.position = position;
        collider.position = mesh.position;
        collider.checkCollisions = true;
        collider.applyGravity = true;
        collider.ellipsoid = ellipsoid;

        //collider.showBoundingBox = true;

        var material = new BABYLON.StandardMaterial("enemy", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0, 0);

        var material2 = new BABYLON.StandardMaterial("collider", this.scene);
        material2.alpha = 0;

        mesh.material = material;
        collider.material = material2;
    }
    
    var act =   0;          //  Indica el estado actual
    var offsetX = +1.0;
    var offsetZ = +1.0;

    /**************************************************************************
                Diagrama de estados para las colisiones 
                (0)(1)(2)(3) : Estados

                         ---------------------- 
                                (**)
                            (1) D=2 -> (3)                      (**) -> Indica la posición del jugador en la colisión con la pared
                                D=0 -> (2)                      D -> random [0-2]
                                D=1 -> (0)
       |                                                          |
       |         D=2 -> (1)                        D=2 -> (2)     |
       |(**) (0) D=0 -> (3)                    (3) D=0 -> (0) (**)|
       |         D=1 -> (2)                        D=1 -> (1)     |                                                          
       |                    (2) D=2 -> (0)                        |
                                D=0 -> (1)                   
                                D=1 -> (3)
                                (**)
                        ------------------------

    ******************************************************************************/
    this.Move = function (Knock) {
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

                        var random = Math.floor((Math.random() * 3));

                        switch (random)
                        {
                            case 0: 

                                switch (act)
                                {
                                    case 0:
                                        act = 3;
                                        offsetX = -0.1;
                                        offsetZ = 0.0;
                                        break;
                                    case 1:
                                        act = 2;
                                        offsetX =  0.0;
                                        offsetZ = -0.1;
                                        break;
                                    case 2:
                                        act = 1;
                                        offsetX = 0.0;
                                        offsetZ = +0.1;
                                        break;
                                    case 3:
                                        act = 0;
                                        offsetX = +0.1;
                                        offsetZ = 0.0;
                                        break;
                                }

                                break;
                            case 1: 
                                switch (act) {
                                    case 0:
                                        act = 2;
                                        offsetX = -0.1;
                                        offsetZ = -0.1;
                                        break;
                                    case 1:
                                        act = 0;
                                        offsetX = +0.1;
                                        offsetZ = -0.1;
                                        break;
                                    case 2:
                                        act = 3;
                                        offsetX = -0.1;
                                        offsetZ = +0.1;
                                        break;
                                    case 3:
                                        act = 1;
                                        offsetX = +0.1;
                                        offsetZ = +0.1;
                                        break;
                                }
                            
                                break;
                            case 2: 
                                switch (act) {
                                    case 0:
                                        act = 1;
                                        offsetX = -0.1;
                                        offsetZ = +0.1;
                                        break;
                                    case 1:
                                        act = 3;
                                        offsetX = -0.1;
                                        offsetZ = -0.1;
                                        break;
                                    case 2:
                                        act = 0;
                                        offsetX = +0.1;
                                        offsetZ = +0.1;
                                        break;
                                    case 3:
                                        act = 2;
                                        offsetX = +0.1;
                                        offsetZ = -0.1;
                                        break;
                                }
                            
                                break;
                        }                        

                        foundIt = true;
                    }
                }
                k++;
            }
            j++;
        }

        position.x += offsetX;
        position.z += offsetZ;

        RefreshEnemy();

        // Colisión con el jugador
        if (meshPlayer.intersectsMesh(collider, true)) {
            Player.DecrementLifes();
            Player.DisplayInfo();
            // Sonido
            Knock.play();
        }

        // El enemigo se sale del laberinto

    };         

    function RefreshEnemy() {
        mesh.position = position;
        collider.position = position;
    }
    
    this.getCollider = function(){
        return collider;
    }
    
    this.dispose = function () {
        collider.dispose();
        mesh.dispose();
    }
}

