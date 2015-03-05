

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

        //Posición inicial del jugador
        collidingBox.position.x = paintedWalls[entranceRow][entranceCol].position.x;
        collidingBox.position.z = paintedWalls[entranceRow][entranceCol].position.z;
        meshPlayer.position.x = collidingBox.position.x;
        meshPlayer.position.z = collidingBox.position.z;


        //Posición incial del jugador
        collidingBox.position.x = paintedWalls[entranceRow][entranceCol].position.x;
        collidingBox.position.z = paintedWalls[entranceRow][entranceCol].position.z;
        meshPlayer.position.x = collidingBox.position.x
        meshPlayer.position.z = collidingBox.position.z

        //Número de disparos
        this.setNumOfShoots();

        //Animaciones
        this.AnimatePlayer();
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
        var MISSILE_SPEED = 200.0;              //Disminuye la velocidad si se aumenta el valor
        var MISSILE_SIZE = 0.5;                 //Tamaño del misil
        var MISSILE_OFFSET = planeWidthSize*2;    //Distancia máxima a la que se puede llegar el misil
        //Variables
        var missiles = [];                      //Array de misiles 
        var directions = [];                    //Array de direcciones de cada misil
        var numMissiles = 0;
        var maxNumMissiles = 0;
        var numMissilesDisplay = document.getElementById("numMissiles_display");

        //Establece el número máximo e inicial de misiles
        this.setNumOfShoots = function()
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
            displayNumMissiles();
        }

        //Muestra en pantalla el valor actual
        function displayNumMissiles()
        {
            //Actualiza el valor que se muestra en la pantalla
            numMissilesDisplay.innerHTML = numMissiles;
        }

        //Incrementa el número de misiles
        function incrementMissiles()
        {
            if (numMissiles<maxNumMissiles)
                numMissiles++;
            displayNumMissiles();
        }

        //Decrementa el número de misiles
       function decrementMissiles()
        {
            if (numMissiles>0)
                numMissiles--;
            displayNumMissiles();
        }

        window.addEventListener("keydown", function (evt) {
            //Tacla E para disparar
            if (evt.keyCode == 69 && numMissiles > 0) {

                //Decrementa el número de disparos
                decrementMissiles();

                //Instancia un nuevo misil
                var missile = BABYLON.Mesh.CreateSphere("Sphere", 20, 1, scene);
                missile.scaling = new BABYLON.Vector3(MISSILE_SIZE, MISSILE_SIZE, MISSILE_SIZE);
                missile.position = new BABYLON.Vector3(meshPlayer.position.x, meshPlayer.position.y, meshPlayer.position.z);
                missile.rotation = new BABYLON.Vector3(meshPlayer.rotation.x, meshPlayer.rotation.y, meshPlayer.rotation.z);
                missiles.push(missile);

                //Dirección actual entre la cámara y el jugador
                var direction = new BABYLON.Vector3(meshPlayer.position.x - camera.position.x, 0, meshPlayer.position.z - camera.position.z);            
                directions.push(direction);

                this.scene.registerBeforeRender(function () {

                    /// Misiles: Animación y detección de colisiones 
                    for (var i = 0; i < missiles.length; i++) {

                        //Movimiento del misil
                        missiles[i].position.x += (directions[i].x / MISSILE_SPEED);
                        missiles[i].position.z += (directions[i].z / MISSILE_SPEED);

                        var foundIt = false;

                        //Si el misil no impacta y se aleja una determinada distancia, desaparece
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
                                if ((walls[j][k] == Walls.WallState.Alive)){
                                    if (paintedWalls[j][k].intersectsMesh(missiles[i], true)) {
                                        //Oculta la parede en la que ha impacto el misil
                                        Walls.HideWall(j, k);
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
        });       


}