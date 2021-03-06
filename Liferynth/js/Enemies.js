﻿Enemies = function (game) {

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
        this.Player = game.Player;

        this.enemies = game.enemies;
        this.numEnemies = game.numEnemies;
        this.Walls = game.Walls;

    this.CreateEnemy = function (row, col) {
        /*Crea un enemigo en la posición row,col de la matriz de celdas del laberinto
        NOTA: La matriz de celdas es el hueco que queda dentro de los muros vecinos
                     _ _
                    |_|_|   Matriz de muros 5 filas, 3 columnas
                    |_|_|   Matriz de celdas 2 filas, 2 columnas (hueco)
        */
        var e = new Enemy(game, row, col);
        e.Initialize();
        enemies.push(e);
    }


    
    this.ManageEnemies = function (Knock) {
        //PARALELO
        // No se modifica el mapa de muros, si un enemigo lo modificara, 
        // se llevaría a cabo al finalizar el bucle (Tareas pendientes)
        this.scene.registerBeforeRender(function () {
            
            for (var i = 0; i < enemies.length; i++) {
                enemies[i].Move(Knock);
            }

        });

    }
    
    this.getCollider = function (i) {
        return enemies[i].getCollider();
    }

    this.killEnemy = function (i) {
        var _enemy = enemies[i];
        enemies.splice(i, 1);//"Elimina" la posición i reordenando el array
        _enemy.dispose();
    }
    
}

