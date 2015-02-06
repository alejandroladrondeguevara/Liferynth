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
        /*Crea un enemigo en la posición row,col de la matriz de celdas del laberinto
        NOTA: La matriz de celdas es el hueco que queda dentro de los muros vecinos
                     _ _
                    |_|_|   Matriz de muros 5 filas, 3 columnas
                    |_|_|   Matriz de celdas 2 filas, 2 columnas (hueco)
        */
        var e = new Enemy(game, row, col);
        e.Initialize();
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

