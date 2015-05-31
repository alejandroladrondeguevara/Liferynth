


Walls = function (game) {

    //Variables del juego que necesitamos aquí
    this.game = game;
    this.scene = game.scene;
    this.walls = game.walls;
    this.binWalls = game.binWalls;  //Muros binarios (true o false) si están levantados o no (para WebCL)
    this.paintedWalls = game.paintedWalls;
    this.posMatrix = game.posMatrix;
    this.numWalls = game.numWalls;
    this.rows = game.rows;
    this.cols = game.cols;
    this.floorHeight = game.floorHeight;
    this.meshPlayer = game.meshPlayer;
    this.collidingBox = game.collidingBox;
    this.totalWalls = game.totalWalls;
    this.fogEnd = game.fogEnd;
    this.WallSound = game.WallSound;

    /*  Estado del muro: 
            0 : No hay muro creado
            1 : Muro activo
            2 : Muro no visible
            3 : Muro permanente (no bajará el muro nunca)
            4 : Hueco permanente (no habrá muro en esa posición)
    */
    this.WallState = { NonExisting: 0, Alive: 1, Dead: 2, PermaWall: 3, PermaGap: 4 }

    var wallWidth = 6;
    var wallHeight = 4;
    var wallDepth = 0.75;
    this.wallScale = new BABYLON.Vector3(wallDepth, wallHeight, wallWidth);
    var timeToNoCollisionOnHide = 1.1;

    binWalls = new Uint8Array(totalWalls); //Será el input del método kernel

    /*
        --------------------------------------------------------------------------------
        --------------------------------------------------------------------------------
                                        Funciones de binWalls 
        --------------------------------------------------------------------------------
        --------------------------------------------------------------------------------      
    */

    function linealToXY(z) {
        var x = Math.floor(z / cols);
        var y = z % cols;
        return [x, y];
    }

    this.linealFromXY = function (x, y) {
        return y + x * cols;
    }

    function fillBinWalls() {
        for (i in binWalls) {
            var aux = linealToXY(i);
            var x = aux[0]; var y = aux[1];
            var even = (x % 2 == 0);
            var c;
            if (even) c = cols - 1; //Las filas pares son muros horizontales, hay una columna menos
            else c = cols;
            if (x <= lastRow && y < c) {
                if (walls[x][y] == WallState.PermaWall || walls[x][y] == WallState.Alive)
                    binWalls[i] = 1;
                else binWalls[i] = 0;
            }
            else
                binWalls[i] = 0;
        }
    }

    this.updateWalls = function() {
        /*Actualiza la matriz walls en función de los resultados obtenidos por WebCL en el array results*/
        for (i in results) {
            var aux = linealToXY(i);
            var x = aux[0]; var y = aux[1];
            var even = (x % 2 == 0);
            var c;
            if (even) c = cols - 1; //Las filas pares son muros horizontales, hay una columna menos
            else c = cols;
            if (x <= lastRow && y < c) {
                if (walls[x][y] == WallState.Alive) {
                    if (results[i] == 0) this.HideWall(x, y);
                }
                else
                    if (!(this.UnderneathPlayer(x, y)) && (results[i] == 1)) {
                        if (walls[x][y] == WallState.Dead) {
                            this.ShowWall(x, y);
                        }
                        else if (walls[x][y] == WallState.NonExisting) {
                            this.CreateWall(x, y, even);
                            this.ShowAnimation(x, y);
                        }
                    }
            }
        }
    }


    /*
        --------------------------------------------------------------------------------
        --------------------------------------------------------------------------------
                                        Creación de Muros 
        --------------------------------------------------------------------------------
        --------------------------------------------------------------------------------                            
    */



    this.CreateDefaultWall = function () {

        var box = BABYLON.Mesh.CreateBox("Box", 1.0, this.scene);

        var material = new BABYLON.StandardMaterial("wallFront", this.scene);
        material.diffuseTexture = new BABYLON.Texture("images/MetalWallReplicaPeque.png", this.scene);
        material.diffuseTexture.wAng += Math.PI * 0.5;

        material.diffuseTexture.uScale = 1;
        material.diffuseTexture.vScale = 1;

        box.material = material;
        box.checkCollisions = true;
        box.scaling = this.wallScale;
        return box;

    }

    this.CreateWall = function (i, j, even) { // i = fila, j = columna, even = par (si es horizontal o vertical)
        paintedWalls[i][j] = Walls.CreateDefaultWall();
        paintedWalls[i][j].position = posMatrix[i][j];
        paintedWalls[i][j].hiding = false;
        walls[i][j] = WallState.Alive;
        AnimateWall(i, j);
        if (even) paintedWalls[i][j].rotation.y = 0.5 * Math.PI;
    }




    /*
        --------------------------------------------------------------------------------
        --------------------------------------------------------------------------------
                                Preparación de la matriz de Muros
        --------------------------------------------------------------------------------
        --------------------------------------------------------------------------------                            
    */


    function CreateMatrix(rows, cols) {
        var arr = [];

        for (var i = 0; i < rows; i++) {
            arr[i] = []; //Vacío
            for (var j = 0; j < cols; j++) {
                arr[i][j] = 0;
            }
        }

        return arr;
    }


    this.RandomWallMatrix = function () {
        var randomWallMatrix = [];
        var c;

        //PARALELO
        //Poca carga de trabajo, se realiza una vez al principio 
        for (var i = 0; i < (lastRow + 1) ; i++) {
            randomWallMatrix[i] = [];
            var even = (i % 2 == 0);
            if (even) c = cols - 1; //Las filas pares son muros horizontales, hay una columna menos
            else c = cols;
            //PARALELO
            for (var j = 0; j < c; j++) {
                if (Math.floor(Math.random() * 10) <= 3) {
                    //if( ((i+j)*7)%3 == 0)
                    randomWallMatrix[i][j] = WallState.Alive;
                    numWalls++;
                }
                else randomWallMatrix[i][j] = WallState.NonExisting;
            }
        }
        return randomWallMatrix;
    }

    this.PaintWalls = function (rows, cols) { //Devuelve un array de nodos Array tipo "objeto muro, fila, columna"
        var paintedWalls = [];
        var c;
        //PARALELO
        //Poca carga, se ejecutará una vez al principio del programa
        for (var i = 0; i < (lastRow + 1) ; i++) {
            paintedWalls[i] = [];
            var even = (i % 2 == 0);
            if (even) c = cols - 1; //Las filas pares son muros horizontales, hay una columna menos
            else c = cols;
            //PARALELO
            for (var j = 0; j < c; j++) {
                var entradaSalida = (walls[i][j] == WallState.PermaGap);
                if ((walls[i][j] == WallState.Alive) || (walls[i][j] == WallState.PermaWall) || entradaSalida) {
                    paintedWalls[i][j] = Walls.CreateDefaultWall();
                    paintedWalls[i][j].position = posMatrix[i][j];
                    paintedWalls[i][j].hiding = false;
                    if (even) paintedWalls[i][j].rotation.y = 0.5 * Math.PI;
                }
            }
        }
        fillBinWalls();
        return paintedWalls;
    }


    this.PositionsMatrix = function (rows, cols) {
        var positionMatrix = CreateMatrix(rows, cols);

        var zIni = (wallWidth / 2) + wallWidth * (rows / 2); //Cada celda está separada por 4 de distancia y vamos a empezar por el origen (centro del laberinto)
        var xIni = -wallWidth * (cols / 2);
        var yIni = floorHeight + wallHeight / 2;

        //PARALELO
        //Poca carga de trabajo, sólo se ejecuta una vez al principio del programa
        for (var i = 0; i < (lastRow + 1) ; i++) {
            var even = (i % 2) == 0;
            var zAct = zIni - i * (wallWidth / 2);
            var xAux = xIni;
            if (!even) xAux -= (wallWidth / 2); //Filas pares horizontales, impares verticales

            //PARALELO
            for (var j = 0; j < cols; j++) {
                var xAct = xAux + j * wallWidth; // En cada vuelta xAct += wallWidth;
                positionMatrix[i][j] = new BABYLON.Vector3(xAct, yIni, zAct);
            }

        }
        return positionMatrix;
    }

    function CreateBorder() {
        //PARALELO: Poca carga, una ejecución al principio
        for (var i = 1; i < (lastRow) ; i = i + 2) {
            walls[i][0] = WallState.PermaWall;
            walls[i][lastCol] = WallState.PermaWall;
        }
        //PARALELO: Poca carga, una ejecución al principio
        for (var j = 0; j < (lastCol) ; j++) {
            walls[0][j] = WallState.PermaWall;
            walls[lastRow][j] = WallState.PermaWall;
        }
    }

    function CreateEntranceAndExit(entranceCol, exitCol) {
        //La salida del laberinto será un hueco por el que salir
        walls[lastRow][entranceCol] = WallState.PermaGap;
        walls[exitRow][exitCol] = WallState.PermaGap;
        numWalls = numWalls - 2;
    }

    this.CreateLabyrinthBounding = function (entranceCol, exitCol) {
        CreateBorder();
        CreateEntranceAndExit(entranceCol, exitCol);
    }

    this.GeneratePermaWalls = function () {
        var minR = Math.round(rows / 3);
        var maxR = Math.round((2 * rows) / 3);
        var minC = Math.round(cols / 3);
        var maxC = Math.round((2 * cols) / 3);
        var numR = maxR - minR;
        var numC = maxC - minC;
        var numPerm = Math.round((numR * numC) / 4);
        var chances = numPerm / ((numR) * (numC)); //Número de muros permanentes entre número de muros
        chances *= 100; //Porcentaje de probabilidad
        //NO PARALELO: No se sabe hasta cuándo va a iterar
        //Poca carga de trabajo, se ejecuta una vez
        while (numPerm > 0) {
            var i = minR;
            while (i < maxR && numPerm > 0) {
                var j = minC;
                while (j < maxC && numPerm > 0) {
                    if (walls[i][j] != WallState.PermaWall) {
                        var random = Math.floor(Math.random() * 100);
                        if (random <= chances) {
                            if ((walls[i][j] == WallState.Dead) || (walls[i][j] == WallState.NonExisting))
                                numWalls++;
                            walls[i][j] = WallState.PermaWall;
                            numPerm--;
                            console.log("Muro permanente en: ", i, "-", j);
                        }
                    }
                    j++;
                }
                i++;
            }
        }
    }


    /*
        --------------------------------------------------------------------------------
        --------------------------------------------------------------------------------
                              Modificación de la matriz de Muros
        --------------------------------------------------------------------------------
        --------------------------------------------------------------------------------                            
    */



    this.ChangeExit = function (horizontal, northWest, pos) {
        /* Función que cambia la salida de sitio según los parámetros:
            -Si es horizontal o vertical
            -Si pertenece al muro contrario a la entrada o al izquierdo (northWest=true) (fila o columna 0 de la matriz de muros)
            -Columna o fila correspondiente donde se tiene que colocar la salida
        */
        var i, j;
        var auxExitRow = exitRow;
        var auxExitCol = exitCol;
        var distinta = true;
        if (horizontal) {
            j = pos;
            distinta = (j != exitCol);
            if (distinta) {
                exitCol = pos;
                if (northWest) { i = 0; exitRow = 0; }
                else { i = lastRow; exitRow = lastRow; };
            }
        } else {
            i = (pos * 2) + 1; /*Si identificamos los muros verticales del borde de 0 al último (lastRow-1)/2,
                                                no se corresponden con su posición en la matriz*/
            distinta = (i != exitRow);
            if (distinta) {
                exitRow = i;
                if (northWest) { j = 0; exitCol = 0; }
                else { j = lastCol; exitCol = lastCol; };
            }
        }
        if (distinta) {
            walls[auxExitRow][auxExitCol] = WallState.PermaWall; //Levantamos el muro de salida anterior
            this.ShowWall(auxExitRow, auxExitCol);
            walls[i][j] = WallState.PermaGap;
            this.HideWall(i, j);
        }

    }


    /*
        --------------------------------------------------------------------------------
        --------------------------------------------------------------------------------
                                     Animación de Muros
        --------------------------------------------------------------------------------
        --------------------------------------------------------------------------------                            
    */

    function AnimateWall(r, c) {
        var string1 = "animation " + r + " " + c;
        var animationBox = new BABYLON.Animation(string1, "position.y", 30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        // An array with all animation keys
        var keys = [];

        keys.push({
            frame: 0,
            value: floorHeight + wallHeight / 2
        });
        keys.push({
            frame: 8,
            value: floorHeight
        });
        keys.push({
            frame: 40,
            value: floorHeight - (wallHeight * margin) / 2
        });
        keys.push({
            frame: 48,
            value: floorHeight + wallHeight / 4
        });
        keys.push({
            frame: 80,
            value: floorHeight + wallHeight / 2
        });
        animationBox.setKeys(keys);
        paintedWalls[r][c].animations.push(animationBox);
    }

    this.AnimateWalls = function () {
        var c;
        //PARALELO
        for (var i = 0; i < (lastRow + 1) ; i++) {
            if ((i % 2) == 0) c = cols - 1;
            else c = cols;
            for (var j = 0; j < c; j++) {
                if ((walls[i][j] != WallState.NonExisting)) {
                    AnimateWall(i, j);
                }
            }
        }
    }

    function HideAnimation(r, c) {
        this.scene.beginAnimation(paintedWalls[r][c], 0, 40, false);
        numWalls--;
        // Sonido
        WallSound.play();
    }
    this.ShowAnimation = function (r, c) {
        this.scene.beginAnimation(paintedWalls[r][c], 40, 80, false);
        binWalls[this.linealFromXY(r, c)] = 1;
        numWalls++;
        // Sonido
        WallSound.play();
    }

    function HideNoAnimation(r, c) {
        paintedWalls[r][c].position.y = floorHeight - (wallHeight * margin) / 2;
        numWalls--;
    }

    this.ShowNoAnimation = function(r, c) {
        paintedWalls[r][c].position.y = floorHeight + wallHeight / 2;
        binWalls[this.linealFromXY(r, c)] = 1;
        numWalls++;
    }

    function PlayerTooFarFromWall(r, c) {
        if (collidingBox == null) return true; //Si no hay jugador, los muros pueden salir instantáneamente

        // La raíz cuadrada sería demasiado costosa, utilizamos una distancia más relativa
        return (Math.abs(paintedWalls[r][c].position.x - collidingBox.position.x) > fogEnd) ||
            (Math.abs(paintedWalls[r][c].position.z - collidingBox.position.z) > fogEnd);
    }

    this.HideWall = function (row, col) {
        if (walls[row][col] == WallState.Alive) //Si está vivo, muere
            walls[row][col] = WallState.Dead;
        binWalls[this.linealFromXY(row, col)] = 0;
        //Si el jugador no está cerca del muro, bajarlo instantáneamente
        if(PlayerTooFarFromWall(row,col)){
            paintedWalls[row][col].checkCollisions = false;
            HideNoAnimation(row, col);
        } else {
            paintedWalls[row][col].hiding = true;
            window.setTimeout(function () { paintedWalls[row][col].checkCollisions = false; paintedWalls[row][col].hiding = false; }, timeToNoCollisionOnHide * 1000);
            HideAnimation(row, col);
        }
    }

    this.ShowWall = function (row, col) {
        if (paintedWalls[row][col].hiding == false) {
            if (walls[row][col] == WallState.Dead) //Si está muerto, resucitamos
                walls[row][col] = WallState.Alive;
            //Si el jugador no está cerca del muro, subirlo instantáneamente
            if (PlayerTooFarFromWall(row, col)) {
                paintedWalls[row][col].checkCollisions = true;
                this.ShowNoAnimation(row, col);
            } else {
                paintedWalls[row][col].checkCollisions = true;
                this.ShowAnimation(row, col);
            }
        }
    }

    this.SetPermaWall = function (row, col) {
        walls[row][col] = WallState.PermaWall;
    }


    /*
        --------------------------------------------------------------------------------
        --------------------------------------------------------------------------------
                                     Funciones útiles
        --------------------------------------------------------------------------------
        --------------------------------------------------------------------------------                            
    */

    this.GetExitRow = function() {
        return exitRow;
    }

    this.GetExitCol = function () {
        return exitCol;
    }

    this.CopyWalls = function () { //Devuelve una copia de la matriz walls
        var w = [];
        var c;
        //PARALELO
        for (var i = 0; i < (lastRow + 1) ; i++) {
            w[i] = [];
            var even = ((i % 2) == 0);
            if (even) c = cols - 1;
            else c = cols;
            for (var j = 0; j < c; j++) {
                w[i][j] = walls[i][j];
            }
        }
        return w;
    }

    this.UnderneathPlayer = function (row, col) {
        var under = false;
        var xPlayer = meshPlayer.position.x;
        var zPlayer = meshPlayer.position.z;
        var mismoPlano = true; /// TODO Si hay varios niveles de laberinto, diferenciar
        var xWallMin, xWallMax, zWallMin, zWallMax;
        var xWall = posMatrix[row][col].x;
        var zWall = posMatrix[row][col].z;
        var even = ((row % 2) == 0);
        var playerWidth = meshPlayer.scaling.x;
        var aux = 1.01;
        if (even) {
            xWallMin = xWall - wallWidth - playerWidth * aux;
            xWallMax = xWall + wallWidth + playerWidth * aux;
            zWallMin = zWall - wallDepth - playerWidth * aux;
            zWallMax = zWall + wallDepth + playerWidth * aux;
        } else {
            xWallMin = xWall - wallDepth - playerWidth * aux;
            xWallMax = xWall + wallDepth + playerWidth * aux;
            zWallMin = zWall - wallWidth - playerWidth * aux;
            zWallMax = zWall + wallWidth + playerWidth * aux;
        }
        if (mismoPlano && (xPlayer <= xWallMax) && (xPlayer >= xWallMin) && (zPlayer <= zWallMax) && (zPlayer >= zWallMin))
            under = true;
        return under;
    }

    this.CellContainsPlayer = function (i, j) {
        /* Devuelve verdadero o falso en función de si el personaje
            se encuentra sobre la celda i(fila),j(columna) de la matriz de celdas
            NOTA: La matriz de celdas es el hueco que queda dentro de los muros vecinos
                 _ _
                |_|_|
                |_|_|   Matriz de celdas 2 filas, 2 columnas (hueco)
        */
        var iMuro = (2 * i) + 1; //Cada celda de la matriz de celdas está rodeada por 4 muros, al ser mayor el nº de filas, que de columnas...
        return (meshPlayer.position.x >= posMatrix[iMuro][j].x && meshPlayer.position.x <= posMatrix[iMuro][j + 1].x
         && meshPlayer.position.z <= posMatrix[iMuro - 1][j].z && meshPlayer.position.z >= posMatrix[iMuro + 1][j].z);
    }
}

