﻿

Player = function (game) {

    //Variables del juego que necesitamos aquí
        this.game = game;
        this.scene = game.scene;
        this.walls = game.walls;
        this.paintedWalls = game.paintedWalls;
        this.posMatrix = game.posMatrix;
        this.numWalls = game.numWalls;
        this.rowsSettings = game.rowsSettings;
        this.columnsSettings = game.columnsSettings;
        this.rows = game.rows;
        this.cols = game.cols;
        this.floorHeight = game.floorHeight;
        this.meshPlayer = game.meshPlayer;
        this.collidingBox = game.collidingBox;
        this.gravity = game.gravity;
        this.camera = game.camera;

        this.jumping = game.jumping;
        this.crouching = game.crouching;

        this.entranceRow = game.entranceRow;
        this.entranceCol = game.entranceCol;

        this.Walls = game.Walls;
        this.planeWidthSize = game.planeWidthSize;      
        
    jumpHeight = 1.5;              // Altura del salto del jugador
    jumpTime = 0.3;                // Tiempo de salto (vuelo) del jugador

    defaultSpeed = 0.14;           // Velocidad del jugador
    speed = defaultSpeed;
    backSpeed = -0.07;             // Velocidad del jugador retrocediendo
    speedReduceCrouching = 0.4 * defaultSpeed;    // Velocidad del jugador agachado

    playerHeight = 1.75;            // Altura del jugador
    playerWidth = 0.5;              // Anchura del jugador
    playerLength = 0.5;             // Longitud del jugador

    ellipsoidPlayer = new BABYLON.Vector3(0.5, playerHeight / 4, 0.5); //Colisionador del jugador
    
    this.Initialize = function () {
        meshPlayer = BABYLON.Mesh.CreateBox("player", 1, scene);
        collidingBox = BABYLON.Mesh.CreateBox("colPlayer", 1, scene);
        meshPlayer.scaling = new BABYLON.Vector3(playerWidth, playerHeight, playerLength);
        collidingBox.scaling = new BABYLON.Vector3(playerWidth, playerHeight, playerLength);
        meshPlayer.position.y = floorHeight + (meshPlayer.scaling.y / 2);
        collidingBox.position.y = meshPlayer.position.y;
        collidingBox.checkCollisions = true;
        collidingBox.applyGravity = true;
        collidingBox.ellipsoid = ellipsoidPlayer;
        collidingBox.showBoundingBox = true;

        //Posición incial del jugador
        collidingBox.position.x = paintedWalls[entranceRow][entranceCol].position.x;
        collidingBox.position.z = paintedWalls[entranceRow][entranceCol].position.z + 3;
        meshPlayer.position.x = collidingBox.position.x
        meshPlayer.position.z = collidingBox.position.z

        // Se sube la pared de la entrada y se convierte en una pared permanente
        Walls.ShowAnimation(entranceRow, entranceCol);
        Walls.ShowWall(entranceRow, entranceCol);
        Walls.SetPermaWall(entranceRow, entranceCol);

        //Número de disparos, se carga después de 5 segundos
        setTimeout(function () {
            DisplayLabelMissiles();
            SetNumOfShoots();
        },5000);

        //Animaciones
        this.AnimatePlayer();
    }

    this.Reset = function () {

        //Posición incial del jugador
        collidingBox.position.x = paintedWalls[entranceRow][entranceCol].position.x;
        collidingBox.position.z = paintedWalls[entranceRow][entranceCol].position.z + 2;
        collidingBox.position.y = floorHeight + (meshPlayer.scaling.y / 2);
        meshPlayer.position.y = collidingBox.position.y;
        meshPlayer.position.x = collidingBox.position.x
        meshPlayer.position.z = collidingBox.position.z

        //Número de disparos
        SetNumOfShoots();
    }

    this.AnimatePlayer = function () {
        var string1 = "Player position";
        var animationPosition = new BABYLON.Animation(string1, "position.y", 100 / jumpTime,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        // An array with all animation keys
        var keys = [];

        // 0-100 Animación salto
        // 100-200 Animación aterrizaje
        keys.push({
            frame: 0,
            value: floorHeight + playerHeight / 2
        });
        keys.push({
            frame: 55,
            value: floorHeight + playerHeight / 2 + jumpHeight * (3 / 4)
        });
        keys.push({
            frame: 100,
            value: floorHeight + playerHeight / 2 + jumpHeight
        });
        keys.push({
            frame: 140,
            value: floorHeight + playerHeight / 2 + jumpHeight * (3 / 4)
        });
        keys.push({
            frame: 200,
            value: floorHeight + playerHeight / 2
        });
        keys.push({
            frame: 250,
            value: floorHeight + playerHeight / 3
        });
        keys.push({
            frame: 300,
            value: floorHeight + playerHeight / 2
        });

        animationPosition.setKeys(keys);

        // An array with all animation keys
        var keys2 = [];
        var string2 = "Player scaling";
        var animationCrouch = new BABYLON.Animation(string2, "scaling.y", 100 / jumpTime,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        // 200-250 Animación agacharse
        // 250-300 Animación levantarse
        keys2.push({
            frame: 200,
            value: playerHeight
        });
        keys2.push({
            frame: 250,
            value: playerHeight * (2 / 3)
        });
        keys2.push({
            frame: 300,
            value: playerHeight
        });
        animationCrouch.setKeys(keys2);

        collidingBox.animations.push(animationPosition);
        collidingBox.animations.push(animationCrouch);
    }

    
    this.JumpAnimation = function () {
        scene.beginAnimation(collidingBox, 0, 100, false);
        window.setTimeout(Player.LandAnimation, jumpTime * 1000);
    }
    this.LandAnimation = function () {
        scene.beginAnimation(collidingBox, 100, 200, false);
        window.setTimeout(function () { jumping = false; }, jumpTime * 1000);
    }
    this.CrouchAnimation = function () {
        scene.beginAnimation(collidingBox, 200, 250, false);
        collidingBox.ellipsoid = new BABYLON.Vector3(0.5, (playerHeight * (2 / 3)) / 4, 0.5);
    }
    this.StandUpAnimation = function () {
        crouching = false;
        scene.beginAnimation(collidingBox, 250, 300, false);
        collidingBox.ellipsoid = ellipsoidPlayer;
    }

    this.TurnLeft = function () {
        collidingBox.rotation.y -= 0.05;
        meshPlayer.rotation.y = collidingBox.rotation.y;
    }
    this.TurnRight = function () {
        collidingBox.rotation.y += 0.05;
        meshPlayer.rotation.y = collidingBox.rotation.y;
    }

    this.MoveForward = function () {
        var vel, velZ, velX;
        velZ = Math.cos(collidingBox.rotation.y) * speed;
        velX = Math.sin(collidingBox.rotation.y) * speed;
        vel = gravity.add(new BABYLON.Vector3(velX, 0, velZ));
        collidingBox.moveWithCollisions(vel);
    }

    this.MoveBackwards = function () {
        var vel, velZ, velX;
        velZ = Math.cos(collidingBox.rotation.y) * backSpeed;
        velX = Math.sin(collidingBox.rotation.y) * backSpeed;
        vel = gravity.add(new BABYLON.Vector3(velX, 0, velZ));
        collidingBox.moveWithCollisions(vel);
    }

    //-------------------------------------------- Habilidades del jugador ---------------------------------------------
   


    //Disparar
        //Constantes
        var MISSILE_SPEED = 500.0;              //Disminuye la velocidad si se aumenta el valor
        var MISSILE_SIZE = 0.5;                 //Tamaño del misil
        var MISSILE_OFFSET = planeWidthSize*2;    //Distancia máxima a la que se puede llegar el misil
        //Variables
        var missiles = [];                      //Array de misiles 
        var directions = [];                    //Array de direcciones de cada misil
        var numMissiles = 0;
        var maxNumMissiles = 0;       
        var numMissilesDisplay = document.getElementById("numMissiles_display");
        var labelMissilesDisplay = document.getElementById("labelMissiles_display");

        //Establece el número máximo e inicial de misiles
        function SetNumOfShoots()
        {
            switch (this.rowsSettings)
            {
                case "m":
                    maxNumMissiles = 20;
                    break;
                case "n":
                    maxNumMissiles = 10;
                    break;
                case "f":
                    maxNumMissiles = 5;
                    break;
                default:
                    maxNumMissiles = 10;
                    break;
            }
            numMissiles = maxNumMissiles;
            DisplayNumMissiles();
        }

        //Muestra en pantalla el label 'Misiles: '
        function DisplayLabelMissiles()
        {

            labelMissilesDisplay.innerHTML = "Misiles: ";
        }

        //Muestra en pantalla el valor actual
        function DisplayNumMissiles()
        {
            //Actualiza el valor que se muestra en la pantalla            
            numMissilesDisplay.innerHTML = numMissiles;
        }

        //Incrementa el número de misiles
        this.IncrementMissiles = function()// incrementMissiles()
        {
            if (numMissiles<maxNumMissiles)
                numMissiles++;
            DisplayNumMissiles();
        }

        // Devuelve el número máximo de misiles
        this.GetMaxMissiles = function ()
        {
            return maxNumMissiles;
        }

        // Devuelve el número actual de misiles
        this.GetNumMissiles = function () {
            return numMissiles;
        }

        //Decrementa el número de misiles
       function DecrementMissiles()
        {
            if (numMissiles>0)
                numMissiles--;
            DisplayNumMissiles();
        }

        window.addEventListener("keydown", function (evt) {
            //Tacla E para disparar
            if (evt.keyCode == 69 && numMissiles > 0) {

                //Decrementa el número de disparos
                DecrementMissiles();

                //Instancia un nuevo misil
                var missile = BABYLON.Mesh.CreateSphere("Sphere", 20, 1, scene);
                missile.scaling = new BABYLON.Vector3(MISSILE_SIZE, MISSILE_SIZE, MISSILE_SIZE);
                missile.position = new BABYLON.Vector3(meshPlayer.position.x, meshPlayer.position.y, meshPlayer.position.z);
                missile.rotation = new BABYLON.Vector3(meshPlayer.rotation.x, meshPlayer.rotation.y, meshPlayer.rotation.z);
                missiles.push(missile);

                //Dirección actual entre la cámara y el jugador
                var x, z;
                if (activeCameraNum == 0) { x = camera.position.x; z = camera.position.z; }
                else { x = topDownCamera.position.x; z = topDownCamera.position.z; }
                var direction = new BABYLON.Vector3(meshPlayer.position.x - x, 0, meshPlayer.position.z - z);            
                directions.push(direction);

                
            }
        });

        this.scene.registerBeforeRender(function () {

            var deltaTime = engine.getDeltaTime();
            /// Misiles: Animación y detección de colisiones 
            for (var i = 0; i < missiles.length; i++) {

                //Movimiento del misil
                missiles[i].position.x += (directions[i].x * deltaTime / MISSILE_SPEED);
                missiles[i].position.z += (directions[i].z * deltaTime / MISSILE_SPEED);

                var foundIt = false;

                //Si el misil no impacta y se aleja una determinada distancia desaparece
                if (BABYLON.Vector3.Distance(camera.position, missiles[i].position) > MISSILE_OFFSET) {
                    //Destruye la malla (objeto)
                    var _missile = missiles[i];
                    missiles.splice(i, 1);//"Elimina" la posición i reordenando el array
                    _missile.dispose();
                    directions.splice(i, 1);//"Elimina" la posición i reordenando el array
                    foundIt = true;
                }

                //Detección de colisiones
                var j = 0;
                while (j < (rows - 1) && !foundIt) {
                    var k = 0;
                    while (k < cols && !foundIt) {
                        // Si es una pared viva
                        if ((walls[j][k] == Walls.WallState.Alive)) {
                            if (paintedWalls[j][k].intersectsMesh(missiles[i], true)) {
                                //Oculta la pared en la que ha impactado el misil
                                Walls.HideWall(j, k);
                                //Destruye la malla (objeto)
                                var _missile = missiles[i];
                                missiles.splice(i, 1);//"Elimina" la posición i reordenando el array
                                _missile.dispose();
                                directions.splice(i, 1);//"Elimina" la posición i reordenando el array
                                foundIt = true;
                            }
                            // Sino si es una pared permanente
                        } else if ((walls[j][k] == Walls.WallState.PermaWall)) {
                            if (paintedWalls[j][k].intersectsMesh(missiles[i], true)) {
                                //Destruye la malla (objeto)
                                var _missile = missiles[i];
                                missiles.splice(i, 1);//"Elimina" la posición i reordenando el array
                                _missile.dispose();
                                directions.splice(i, 1);//"Elimina" la posición i reordenando el array
                                foundIt = true;
                            }
                        }
                        k++;
                    }
                    j++;
                }
            }

        });


}