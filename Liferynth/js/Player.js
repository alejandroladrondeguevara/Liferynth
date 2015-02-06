

Player = function (game) {

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

        this.jumping = game.jumping;
        this.crouching = game.crouching;

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
    }
    this.TurnRight = function () {
        collidingBox.rotation.y += 0.05;
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
}
