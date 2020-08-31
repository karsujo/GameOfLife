//Comments : TODO: Fix the mouseover, Checkbox for GRID. fast slow settings<range slider>. !!
//Add moreconfigurations

//--CONSTANTS---//
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const GRID_UNIT = 8;
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const FRAME_HEIGHT = GAME_HEIGHT / GRID_UNIT;
const FRAME_WIDTH = GAME_WIDTH / GRID_UNIT;

//--GLOBALS---//
var GAME_START = true;
var GAME_PERIOD = 200;
var GENERATION = 0;
var CANVAS_SCOPE = false;
var IS_MOUSE_DOWN = false;
var TRACK_ENTITY = false;
var ENTITY_FRAME = null;
var MAP_NEIGHBOR = null;
var GAME_CONTROL = null;
//-----------//

class Entity {
    constructor(x, y, state) {
        this.x = x;
        this.y = y;
        this.state = state;
    }
}

//--MOUSE EVENT LISTENERS---//

canvas.addEventListener('mousedown', function (e) {
    spawnMousePathEntities(canvas, e)
})
canvas.addEventListener('mousemove', function (e) {
    getCursorPositionHover(canvas, e)
})

canvas.addEventListener('mouseover', function (e) {
    setCanvasScope();
})

canvas.addEventListener('mouseup', function (e) {
    updateMouseDown();
})

//-----------//


//--GAME INIT AND CONTROL---//

initBoard();

function startGame() {
    GAME_START = true;
    if (GAME_CONTROL != null) {
        clearInterval(GAME_CONTROL);
    }
    GAME_CONTROL = setInterval(nextGeneration, GAME_PERIOD);
};

function stopGame() {
    GAME_START = false;
}

function clearGame() {
    initBoard();
    stopGame();
    clearGameGeneration();
}

function stepGame() {
    let gameState = GAME_START;
    GAME_START = true;
    nextGeneration();
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

function loadConfig(selectVal) {
    clearGame();
    switch (selectVal) {
        case "R-Pentomino":
            applyConfigToFrame(R_PENTOMINO_CONFIG)
            spawnConfig(R_PENTOMINO_CONFIG);
            break;

        case "Glider":
            applyConfigToFrame(GLIDER_CONFIG);
            spawnConfig(GLIDER_CONFIG);
            break;

        case "Ten-Cell":
            applyConfigToFrame(TEN_CELL_EXPLODER);
            spawnConfig(TEN_CELL_EXPLODER);
            break;

        case "Small-Exploder":
            applyConfigToFrame(SMALL_EXPLODER_CONFIG);
            spawnConfig(SMALL_EXPLODER_CONFIG);
            break;

        case "Bloom":
            applyConfigToFrame(BLOOM_CONFIG);
            spawnConfig(BLOOM_CONFIG);
            break;

        case "Exploder":
            applyConfigToFrame(EXPLODER_CONFIG);
            spawnConfig(EXPLODER_CONFIG);
            break;

        case "Gosper":
            applyConfigToFrame(GOSPER_GUN);
            spawnConfig(GOSPER_GUN);
            break;

        default:
            break;
    }

}

function nextGeneration() {

    if (GAME_START) {
        //var t0 = performance.now();
        var killEntities = new Array();
        var spawnEntities = new Array();

        for (i = 0; i < FRAME_HEIGHT; i++) {
            for (j = 0; j < FRAME_WIDTH; j++) {
                let neighborContext = computeNeighborContext(i, j);
                applyConwayRules(neighborContext[0], neighborContext[1], neighborContext[2], killEntities, spawnEntities);
            }
        }

        updateFrameState(killEntities, spawnEntities);
        renderEntities(killEntities, spawnEntities);
        setGameGeneration();
        drawGrid(GAME_WIDTH, GAME_HEIGHT, 0, 8);

        // var t1 = performance.now();
        //console.log('perf :' + (t1 - t0));

    }
}

function updateFrameState(killEntities, spawnEntities) {
    killEntities.forEach((entity) => {
        ENTITY_FRAME[entity.x / GRID_UNIT][entity.y / GRID_UNIT].state = 'dead';

    });

    spawnEntities.forEach((entity) => {
        ENTITY_FRAME[entity.x / GRID_UNIT][entity.y / GRID_UNIT].state = 'alive';
    })

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
    let xpos = closestMultiple((event.clientX - rect.left), 8);
    let ypos = closestMultiple((event.clientY - rect.top), 8);
    //update frame
    let t_X = xpos / GRID_UNIT;
    let t_Y = ypos / GRID_UNIT
    if ((t_X >= 0 && t_Y > 0 && t_X < (FRAME_WIDTH) && t_Y < (FRAME_HEIGHT))) {
        ENTITY_FRAME[t_X][t_Y].state = 'alive';


        spawnEntity(xpos, ypos);
    }
}

//-----------//

//----ENTITY----//


function createEntity(x, y) {
    let currentEntity = new Entity();
    currentEntity.x = x;
    currentEntity.y = y;
    currentEntity.state = IsEntityWhite(context, x, y) == true ? 'alive' : 'dead';
    return currentEntity;
}

function killEntity(x, y) {
    context.fillStyle = 'gray';
    context.fillRect(x, y, GRID_UNIT, GRID_UNIT);
}

function spawnEntity(x, y) {
    context.fillStyle = 'white';
    context.fillRect(x, y, GRID_UNIT, GRID_UNIT);
}

function trackEntity(x, y) {
    context.fillStyle = 'blue';
    context.fillRect(x, y, GRID_UNIT, GRID_UNIT);
}

function renderEntities(entitiesToKill, entitiesToSpawn) {
    entitiesToKill.forEach((entity) => {
        killEntity(entity.x, entity.y);

    });

    entitiesToSpawn.forEach((entity) => {
        console
        spawnEntity(entity.x, entity.y);
    })
}
//-----------//

//---BOARD-CONTROLS---///
function initBoard() {

    context.fillStyle = 'gray';
    context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    initEntityFrame();
    if (MAP_NEIGHBOR == null) {
        navigateNeighborMap();
    }
    drawGrid(GAME_WIDTH, GAME_HEIGHT, 0, 8);

}



function initEntityFrame() {
    ENTITY_FRAME = new Array(FRAME_HEIGHT);
    for (var i = 0; i < ENTITY_FRAME.length; i++) {
        ENTITY_FRAME[i] = new Array(FRAME_WIDTH);
    }

    for (var i = 0; i < FRAME_HEIGHT; i++) {
        for (var j = 0; j < FRAME_WIDTH; j++) {
            let e = new Entity(i * GRID_UNIT, j * GRID_UNIT, 'dead');
            ENTITY_FRAME[i][j] = e;
        }
    }

}

function applyConfigToFrame(config) {
    for (var j = 0; j < config.length - 1; j = j + 2) {
        let k = j + 1;
        let transformX = config[j] / GRID_UNIT;
        let transformY = config[k] / GRID_UNIT
        ENTITY_FRAME[transformX][transformY].state = 'alive';
    }
}

function navigateNeighborMap() {
    MAP_NEIGHBOR = new Map();
    MAP_NEIGHBOR.set(0, function (x, y) { return [x - 1, y - 1] });
    MAP_NEIGHBOR.set(1, function (x, y) { return [x, y - 1] });
    MAP_NEIGHBOR.set(2, function (x, y) { return [x + 1, y - 1] });
    MAP_NEIGHBOR.set(3, function (x, y) { return [x + 1, y] });
    MAP_NEIGHBOR.set(4, function (x, y) { return [x + 1, y + 1] });
    MAP_NEIGHBOR.set(5, function (x, y) { return [x, y + 1] });
    MAP_NEIGHBOR.set(6, function (x, y) { return [x - 1, y + 1] });
    MAP_NEIGHBOR.set(7, function (x, y) { return [x - 1, y] });

}

function computeNeighborContext(x, y) {
    var neighbor_count = 0;
    var entities_encountered = 0;
    for (var i = 0; i < 8; i++) {
        let c_map = MAP_NEIGHBOR.get(i)(x, y);
        let t_X = c_map[0]; let t_Y = c_map[1];

        if ((t_X >= 0 && t_Y > 0 && t_X < (FRAME_WIDTH) && t_Y < (FRAME_HEIGHT))) {
            entities_encountered++;
            let entity = ENTITY_FRAME[t_X][t_Y];

            //if (TRACK_ENTITY) {
            //console.log(entity);
            // trackEntity(entity.x, entity.y);
            // }
            if (entity.state == 'alive') { neighbor_count++; }
        }

    }
    // TRACK_ENTITY = false;
    return [ENTITY_FRAME[x][y], neighbor_count, entities_encountered];
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

//-----------//


//---GAME RULES---//

function applyConwayRules(currentEntity, neighborLiveCount, entities_encountered, entities_to_kill, entities_to_spawn) {

    if (entities_encountered >= 8) {

        //Rule: live cell whose neighbor live cell count <2 -> die
        if (currentEntity.state == 'alive' && neighborLiveCount < 2) {
            //kill entity
            entities_to_kill.push(currentEntity);
        }
        // if (currentEntity.state == 'alive' && (neighborLiveCount == 2 || neighborLiveCount == 3)) {
        //     //remain alive
        // }

        if (currentEntity.state == 'alive' && neighborLiveCount > 3) {
            //kill entity
            entities_to_kill.push(currentEntity);
        }
        if (currentEntity.state == 'dead' && neighborLiveCount == 3) {
            //entity born
            entities_to_spawn.push(currentEntity);

        }
    }
}
//-----------//

//--UTILITY FUNCTIONS---//

function closestMultiple(n, x) {
    if (x > n) {
        return x;
    }
    n = n + x / 2;
    n = n - (n % x);
    return n;
}

function drawGrid(bw, bh, p, u) {
    for (var x = 0; x <= bw; x += u) {
        context.moveTo(0.5 + x + p, p);
        context.lineTo(0.5 + x + p, bh + p);
    }

    for (var x = 0; x <= bh; x += u) {
        context.moveTo(p, 0.5 + x + p);
        context.lineTo(bw + p, 0.5 + x + p);
    }
    context.strokeStyle = "#cccccc";
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

function spawnConfig(config) {
    for (j = 0; j < config.length - 1; j = j + 2) {
        let k = j + 1;
        spawnEntity(config[j], config[k]);
    }
}

//-----------//

////////////////////////////////////////////////////////////////////////

