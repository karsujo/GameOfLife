//Comments : TODO: Fix the mouseover, also make the grid lines visible. fast slow settings. !!
//Add moreconfigurations
//PERF: REFACTOR CODE FOR PERF!!


//--GLOBALS---//
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const GRID_UNIT = 8;
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
var GAME_START = true;
var GAME_PERIOD = 100;
var GENERATION = 0;
var CANVAS_SCOPE = false;
var IS_MOUSE_DOWN = false;
var TRACK_ENTITY = false;
//var KILL_RENDER = new Array();
//var SPAWN_RENDER = new Array();
//-----------//

//--MOUSE EVENT LISTENERS---//

canvas.addEventListener('mousedown', function(e) {
    spawnMousePathEntities(canvas, e)
})
canvas.addEventListener('mousemove', function(e) {
    getCursorPositionHover(canvas, e)
})

canvas.addEventListener('mouseover', function(e) {
    setCanvasScope();
})

canvas.addEventListener('mouseup', function(e) {
    updateMouseDown();
})

//-----------//


//--GAME INIT AND CONTROL---//

initializeBoard();

function startGame() {
    GAME_START = true;
    setInterval(nextGen, GAME_PERIOD);
};

function stopGame() {
    GAME_START = false;
}

function clearGame() {
    initializeBoard();
    stopGame();
    clearGameGeneration();
}

function stepGame() {
    let gameState = GAME_START;
    GAME_START = true;
    nextGen();
    GAME_START = gameState;
}

function setGameGeneration() {
    GENERATION++;
    document.getElementById("gen").innerText = GENERATION;
}

function clearGameGeneration() {
    GENERATION = 0;
    document.getElementById("gen").innerText = GENERATION;
}

function loadConfig() {
    clearGame();
    let selectVal = document.getElementById("config").value;
    switch (selectVal) {
        case "R-Pentomino":
            spawnConfig(R_PENTOMINO_CONFIG);
            break;

        case "Glider":
            spawnConfig(GLIDER_CONFIG);
            break;

        case "Ten-Cell":
            spawnConfig(TEN_CELL_EXPLODER);
            break;

        case "Small-Exploder":
            spawnConfig(SMALL_EXPLODER_CONFIG);
            break;

        case "Bloom":
            spawnConfig(BLOOM_CONFIG);
            break;

        case "Exploder":
            spawnConfig(EXPLODER_CONFIG);
            break;

        case "Gosper":
            spawnConfig(GOSPER_GUN);
            break;

        default:
            break;
    }

}

function nextGen() {

    if (GAME_START) {
        var t0 = performance.now();

        var entities_to_kill = new Array();
        var entities_to_spawn = new Array();

        for (i = 0; i < GAME_WIDTH; i = i + GRID_UNIT) {
            for (j = 0; j < GAME_HEIGHT; j = j + GRID_UNIT) {

                if ((i == 8 && j == 32) || (i == 16 && j == 32) || (i == 16 && j == 32 + 8)) {
                    // alert("Hit");
                    // TRACK_ENTITY = true;
                    var stub = false;
                }

                computeRules(computeNeighborValues(i, j), entities_to_kill, entities_to_spawn);
            }
        }

        RenderEntities(entities_to_kill, entities_to_spawn);
        setGameGeneration();
        var t1 = performance.now();
        console.log("Perf" + ":" + (t1 - t0));

        //   KILL_RENDER = new Array();
        //  SPAWN_RENDER = new Array();
    }
}
//-----------//

//---MOUSE CONTROLS---//

function getCursorPositionHover(canvas, event) {
    if (IS_MOUSE_DOWN && CANVAS_SCOPE) {
        spawnMousePathEntities(canvas, event);
    }
}

function setCanvasScope() {
    CANVAS_SCOPE = true;
}

function updateMouseDown() {
    IS_MOUSE_DOWN = false;
}

function spawnMousePathEntities(canvas, event) {
    IS_MOUSE_DOWN = true;
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left)
    const y = (event.clientY - rect.top)
    let xp = closestMultiple(x, 8);
    let yp = closestMultiple(y, 8);
    console.log(xp + "," + yp);
    spawnEntity(xp, yp);
}

//-----------//

//----ENTITY----//

class Entity {
    constructor(x, y, state) {
        this.x = x;
        this.y = y;
        this.state = state;
    }
}

function createEntity(x, y) {
    let currentEntity = new Entity();
    currentEntity.x = x;
    currentEntity.y = y;
    currentEntity.state = IsEntityWhite(context, x, y) == true ? 'alive' : 'dead';
    return currentEntity;
}

function killEntity(x, y) {
    let ctxt = canvas.getContext('2d');
    ctxt.fillStyle = 'gray';
    ctxt.fillRect(x, y, GRID_UNIT, GRID_UNIT);
}

function spawnEntity(x, y) {
    let ctxt = canvas.getContext('2d');
    ctxt.fillStyle = 'white';
    ctxt.fillRect(x, y, GRID_UNIT, GRID_UNIT);
}

function trackEntity(x, y) {
    let ctxt = canvas.getContext('2d');
    ctxt.fillStyle = 'blue';
    ctxt.fillRect(x, y, GRID_UNIT, GRID_UNIT);
}


function RenderEntities(entitiesToKill, entitiesToSpawn) {
    entitiesToKill.forEach((entity) => {
        killEntity(entity.x, entity.y);

    });

    entitiesToSpawn.forEach((entity) => {
        spawnEntity(entity.x, entity.y);
    })
}
//-----------//

//---BOARD-CONTROLS---///
function initializeBoard() {

    context.fillStyle = 'gray';
    context.fillRect(0, 0, canvas.width, canvas.height);

    //drawBoard(GAME_WIDTH, GAME_HEIGHT, 0, 8);
    //   drawGrid(GAME_WIDTH, GAME_HEIGHT, "canvas");

    // initializeEntities();
}


function initializeEntities() {

    spawnEntity(16, 24);

    spawnEntity(16, 32);

    spawnEntity(16, 32 + 8);


}

function computeNeighborValues(x, y) {
    var neighborMatrix = new Array();
    //  ________
    // |X||_||_|
    // |_||_||_|
    // |_||_||_|
    var xpos = x - GRID_UNIT;
    var ypos = y - GRID_UNIT;
    if (IsWithinGrid(xpos, ypos)) {
        if (TRACK_ENTITY) {
            trackEntity(xpos, ypos);
        }

        neighborMatrix[0] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||X||_|
    // |_||_||_|
    // |_||_||_|
    (xpos = x), (ypos = y - GRID_UNIT);
    if (IsWithinGrid(xpos, ypos)) {
        if (TRACK_ENTITY) {
            trackEntity(xpos, ypos);
        }

        neighborMatrix[1] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||X|
    // |_||_||_|
    // |_||_||_|
    (xpos = x + GRID_UNIT), (ypos = y - GRID_UNIT);
    if (IsWithinGrid(xpos, ypos)) {
        if (TRACK_ENTITY) {
            trackEntity(xpos, ypos);
        }

        neighborMatrix[2] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |_||_||X|
    // |_||_||_|
    (xpos = x + GRID_UNIT), (ypos = y);
    if (IsWithinGrid(xpos, ypos)) {
        if (TRACK_ENTITY) {
            trackEntity(xpos, ypos);
        }

        neighborMatrix[3] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |_||_||_|
    // |_||_||X|
    (xpos = x + GRID_UNIT), (ypos = y + GRID_UNIT);
    if (IsWithinGrid(xpos, ypos)) {
        if (TRACK_ENTITY) {
            trackEntity(xpos, ypos);
        }

        neighborMatrix[4] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |_||_||_|
    // |_||X||_|
    (xpos = x), (ypos = y + GRID_UNIT);
    if (IsWithinGrid(xpos, ypos)) {
        if (TRACK_ENTITY) {
            trackEntity(xpos, ypos);
        }

        neighborMatrix[5] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |_||_||_|
    // |X||_||_|
    (xpos = x - GRID_UNIT), (ypos = y + GRID_UNIT);
    if (IsWithinGrid(xpos, ypos)) {
        if (TRACK_ENTITY) {
            trackEntity(xpos, ypos);
        }

        neighborMatrix[6] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |X||_||_|
    // |_||_||_|
    (xpos = x - GRID_UNIT), (ypos = y);
    if (IsWithinGrid(xpos, ypos)) {
        if (TRACK_ENTITY) {
            trackEntity(xpos, ypos);
        }

        neighborMatrix[7] = createEntity(xpos, ypos);
    }
    //current cell
    //  ________
    // |_||_||_|
    // |_||X||_|
    // |_||_||_|
    (xpos = x), (ypos = y);
    if (IsWithinGrid(xpos, ypos)) {
        if (TRACK_ENTITY) {
            trackEntity(xpos, ypos);
        }

        neighborMatrix[8] = createEntity(xpos, ypos);
    }
    return neighborMatrix;
}

function IsWithinGrid(x, y) {
    return (x >= 0 && y > 0 && x < GAME_WIDTH && y < GAME_HEIGHT);
}

function getNeighborLiveCount(entities) {
    let count = 0;
    entities.forEach((entity) => {
        if (entity.state == 'alive') {
            count++;
        }

    });
    return count;

}


function getEntityColor(context, x, y) {
    var p = context.getImageData(x, y, GRID_UNIT, GRID_UNIT).data;
    var hex = '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6);
    return hex;
}

function IsEntityWhite(context, x, y) {
    let entityColor = getEntityColor(context, x, y);
    if (entityColor == '#ffffff') return true;
    return false;
}
//-----------//


//---GAME RULES---//

function computeRules(entities, entities_to_kill, entities_to_spawn) {
    if (entities.length >= 8) {
        let currentEntity = entities[8];
        let neighborLiveCount = getNeighborLiveCount(entities);
        if (currentEntity.state == 'alive') {
            neighborLiveCount--; //Ignore current cell from neighnor count.
        }

        //Rule: live cell whose neighbor live cell count <2 -> die
        if (currentEntity.state == 'alive' && neighborLiveCount < 2) {
            //kill entity
            entities_to_kill.push(currentEntity);
            //  killEntity(currentEntity.x, currentEntity.y);
        }
        if (currentEntity.state == 'alive' && (neighborLiveCount == 2 || neighborLiveCount == 3)) {
            //remain alive
        }
        if (currentEntity.state == 'alive' && neighborLiveCount > 3) {
            //kill entity
            entities_to_kill.push(currentEntity);
            //  killEntity(currentEntity.x, currentEntity.y);
        }
        if (currentEntity.state == 'dead' && neighborLiveCount == 3) {
            //entity born
            entities_to_spawn.push(currentEntity);
            // spawnEntity(currentEntity.x, currentEntity.y);
        }
    }
}
//-----------//

//--UTILITY FUNCTIONS---//

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255) throw 'Invalid color component';
    return ((r << 16) | (g << 8) | b).toString(16);
}


function closestMultiple(n, x) {
    if (x > n) {
        return x;
    }
    n = n + x / 2;
    n = n - (n % x);
    return n;
}


class Position {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}






function drawBoard(bw, bh, p, u) {
    for (var x = 0; x <= bw; x += u) {
        context.moveTo(0.5 + x + p, p);
        context.lineTo(0.5 + x + p, bh + p);
    }

    for (var x = 0; x <= bh; x += u) {
        context.moveTo(p, 0.5 + x + p);
        context.lineTo(bw + p, 0.5 + x + p);
    }
    context.strokeStyle = "white";
    context.stroke();
}


//-----------//

//---STATIC CONFIGURATIONS ---//
const R_PENTOMINO_CONFIG = [288, 200, 288, 208, 288, 216, 296, 200, 280, 208];
const TEN_CELL_EXPLODER = [232, 216, 240, 216, 248, 216, 256, 216, 264, 216, 272, 216, 280, 216, 288, 216, 296, 216, 304, 216];
const SMALL_EXPLODER_CONFIG = [264, 232, 272, 232, 280, 232, 272, 224, 264, 240, 280, 240, 272, 248];
const GLIDER_CONFIG = [248, 216, 256, 216, 264, 216, 264, 208, 256, 200];
const BLOOM_CONFIG = [280, 176, 280, 184, 280, 192, 288, 176, 288, 192, 272, 184];
const EXPLODER_CONFIG = [248, 200, 248, 208, 248, 216, 248, 224, 248, 232, 264, 200, 280, 200, 280, 208, 280, 216, 280, 224, 280, 232, 264, 232]
const GOSPER_GUN = [136, 152, 136, 152, 144, 152, 136, 160, 144, 160, 216, 152, 208, 152, 216, 160, 200, 160, 200, 168, 208, 168, 264, 168, 272, 168, 264, 176, 264, 184, 280, 176, 312, 152, 320, 152, 312, 144, 320, 136, 328, 136, 328, 144, 408, 136, 416, 136, 408, 144, 416, 144, 416, 192, 416, 200, 416, 208, 424, 192, 432, 200, 328, 232, 336, 232, 344, 232, 328, 240, 336, 248];

//Untested
function spawnConfig(config) {
    for (j = 0; j < config.length - 1; j = j + 2) {
        let k = j + 1;
        spawnEntity(config[j], config[k]);
    }
}

function spawnRPentomino() {
    spawnEntity(288, 200);
    spawnEntity(288, 208);
    spawnEntity(288, 216);
    spawnEntity(296, 200);
    spawnEntity(280, 208);
}


function spawnGlider() {
    spawnEntity(248, 216);
    spawnEntity(256, 216);
    spawnEntity(264, 216);
    spawnEntity(264, 208);
    spawnEntity(256, 200);
}

//-----------//

////////////////////////////////////////////////////////////////////////