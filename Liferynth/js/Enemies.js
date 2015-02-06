Enemies = function (game) {

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

        this.enemies = game.enemies;
        this.numEnemies = game.numEnemies;


    this.CreateEnemy = function (row, col) {
        /*Crea un enemigo en la posición row,col de la matriz de posiciones del laberinto*/
        var e = new Enemy(game);
        e.walls = walls;
        var testPos = paintedWalls[lastRow][5].position; //TODO
        e.position = new BABYLON.Vector3(testPos.x, testPos.y, testPos.z - 3);
        e.move = function (horizontal, positive) {
            /* 
                Mueve al enemigo en una dirección dentro del laberinto
            */
            //Si (horizontal == true) --> Eje x
            if (horizontal) {
                if (positive) { e.position.x += wallWidth; }
                else { e.position.x -= wallWidth; }
            } else {
                if (positive) { e.position.z += wallWidth; }
                else { e.position.z -= wallWidth; }
            }
        };
        enemies[numEnemies] = e;
        numEnemies++;
    }



    this.ManageEnemies = function () {
        //PARALELO
        // No se modifica el mapa de muros, si un enemigo lo modificara, 
        // se llevaría a cabo al finalizar el bucle (Tareas pendientes)
        for (var i = 0; i < numEnemies; i++) {
            enemies[i];
        }

    }
}