function exitArrow(window, BABYLON, scene, meshPlayer, exitWall) {

    var material1 = new BABYLON.StandardMaterial("material01", scene);
    var material2 = new BABYLON.StandardMaterial("material02", scene);

    material1.diffuseColor = new BABYLON.Color3.Black();
    material2.diffuseColor = new BABYLON.Color3.White();

    material1.specularColor = new BABYLON.Color3.White();
    //material1.wireframe = true;

    //var arrow;
    BABYLON.SceneLoader.ImportMesh("Arrow", "meshes/", "arrow.babylon", scene, function (newMeshes) {
        //var arrow = scene.getMeshByID("Arrow");
        var arrow = newMeshes[0];
        arrow.position.y = meshPlayer.position.y + 1.0;
        arrow.position.z = meshPlayer.position.z + 0.5;
        arrow.position.x = meshPlayer.position.x + 1.0;
        arrow.rotation.x = -Math.PI / 2;
        arrow.material = material1;
        //arrow.scaling = new Babylon.vector3(0.5, 0.5, 0.5);

        scene.registerBeforeRender(function () {

            arrow.lookAt(exitWall.position, 0, -Math.PI / 2, 0);
            arrow.position.y = meshPlayer.position.y + 1.0;
            arrow.position.z = meshPlayer.position.z - 0.5;
            arrow.position.x = meshPlayer.position.x + 1.0;

            //window.setInterval(function () { arrow.material = arrow.material == material1 ? material2 : material1; }, 3000);
            //window.setInterval(function () { arrow.material = material2; }, 500);

        });

    });

}