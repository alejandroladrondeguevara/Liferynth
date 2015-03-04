/****************************************************************************
 ****************************************************************************
 *****************       Métodos Gestión del Laberinto      *****************
 ****************************************************************************
 ****************************************************************************/


/* Devuelve verdadero o falso en función de si el personaje
    se encuentra sobre la celda i(fila),j(columna) de la matriz de celdas
    NOTA: La matriz de celdas es el hueco que queda dentro de los muros vecinos
         _ _
        |_|_|
        |_|_|   Matriz de celdas 2 filas, 2 columnas (hueco)
*/
function CellContainsPlayer(i, j) {
    //Cada celda de la matriz de celdas está rodeada por 4 muros, al ser mayor el nº de filas, que de columnas...
    var iMuro = (2 * i) + 1;
    return (meshPlayer.position.x >= posMatrix[iMuro][j].x && meshPlayer.position.x <= posMatrix[iMuro][j + 1].x
     && meshPlayer.position.z <= posMatrix[iMuro - 1][j].z && meshPlayer.position.z >= posMatrix[iMuro + 1][j].z);
}

function AliveNeighbours8(w, row, col) { //Recibe muro (fila y columna) y devuelve el número de vecinos vivos (muros activos) en 8-vecindad
    var n = 0;
    var state;
    //PARALELO, variable contador n (de reducción)
    for (var i = row - 1; i <= row + 1; i++)
        for (var j = col - 1; j <= col + 1; j++)
            if (!(i == row && j == col))    //No somos nosotros mismos
                if (i >= 0 && i <= lastRow && j >= 0 && j < lastCol) { //No nos salimos de rango
                    state = w[i][j];
                    if ((state == WallState.Alive) || (state == WallState.PermaWall))
                        n++;
                }
    return n;

}

function ChangeWallsLife() {
    var w = Walls.CopyWalls(); //Necesitamos tener una matriz estática hasta pasar una generación para no influir con cambios sucesivos en la misma
    console.log("Muros vivos: ", numWalls);
    var c;
    //PARALELO: Se escribe en una posición distinta de la matriz cada vuelta del bucle interno
    //Gran carga de trabajo, ejecución periódica y costosa
    for (var i = 0; i < (lastRow + 1) ; i++) {
        var even = ((i % 2) == 0);
        if (even) c = cols - 1;
        else c = cols;
        //PARALELO
        for (var j = 0; j < c; j++) {
            var state = walls[i][j];
            if (state != WallState.PermaWall && state != WallState.PermaGap) {
                var n = AliveNeighbours8(w, i, j);
                if ((n == 3) && (!Walls.UnderneathPlayer(i, j)) && (numWalls < maxWalls)) {
                    //Genera vida
                    if (state == WallState.Dead)
                        Walls.ShowWall(i, j);
                    else if (state == WallState.NonExisting) {
                        Walls.CreateWall(i, j, even);
                        Walls.ShowAnimation(i, j);
                    }
                }
                else if ((n > 3) && (state == WallState.Alive) && (numWalls > minWalls)) {
                    //Muerte por inanición 
                    Walls.HideWall(i, j);
                }
                else if ((n < 2) && (state == WallState.Alive) && (numWalls > minWalls)) {
                    //Muerte por aislamiento
                    Walls.HideWall(i, j);
                }
                else if (Math.floor(Math.random() * 100) <= 2) {//Con una probabilidad de 2% cambia
                    if (state == WallState.Alive)
                        Walls.HideWall(i, j);
                    else if (state == WallState.Dead)
                        Walls.ShowWall(i, j);
                    else {
                        Walls.CreateWall(i, j, even);
                        Walls.ShowAnimation(i, j);
                    }
                }
            }
        }
    }
}

function ChangeWalls() {
    var c;
    //PARALELO:
    //Gran carga de trabajo, se ejecuta periódicamente y recorre toda la matriz
    for (var i = 0; i < (lastRow + 1) ; i++) {
        var even = ((i % 2) == 0);
        if (even) c = cols - 1;
        else c = cols;
        for (var j = 0; j < c; j++) {
            if ((walls[i][j] == WallState.Alive) && (numWalls > minWalls)) {
                if (Math.floor(Math.random() * 10) <= 1)
                    Walls.HideWall(i, j);
            } else if ((!Walls.UnderneathPlayer(i, j)) && (numWalls < maxWalls)) {
                if (walls[i][j] == WallState.Dead) {
                    if (Math.floor(Math.random() * 10) <= 1)
                        Walls.ShowWall(i, j);
                } else if ((walls[i][j] == WallState.NonExisting) && (numWalls < maxWalls)) {
                    if (Math.floor(Math.random() * 10) <= 1) {
                        CreateWall(i, j, even);
                        ShowAnimation(i, j);
                    }
                }
            }
        }
    }
}
