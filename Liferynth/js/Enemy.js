Enemy = function (game) {

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
    enemyHeight = 1.75;
    enemyWidth = 0.5;
    enemyLength = 0.5;
    ellipsoidEnemy = new BABYLON.Vector3(0.5, playerHeight / 4, 0.5); //Colisionador del enemigo

}