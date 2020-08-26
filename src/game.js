//Comments : TODO: Fix the mouseover, add stop button, and fix the rule engine, also make the grid lines visible. !!

//--GLOBALS---//
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const GRID_UNIT = 8;
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
var GAME_START = true;
var CANVAS_SCOPE = false;
var IS_MOUSE_DOWN = false;
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
    setInterval(nextGen, 1000);
};

function stopGame() {
    GAME_START = false;
}

function clearGame() {
    initializeBoard();
    stopGame();
}

function nextGen() {
    if (GAME_START) {
        for (i = 0; i < GAME_WIDTH; i = i + GRID_UNIT) {
            for (j = 0; j < GAME_HEIGHT; j = j + GRID_UNIT) {

                computeRules(computeNeighborValues(i, j));
            }
        }
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
    console.log(xp);
    console.log(yp);
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

//-----------//

//---BOARD-CONTROLS---///
function initializeBoard() {

    context.fillStyle = 'gray';
    context.fillRect(0, 0, canvas.width, canvas.height);
    //   drawGrid(GAME_WIDTH, GAME_HEIGHT, "canvas");

    //let seedEntity = new entity();
    // seedEntity.x = Math.floor(Math.random() * (8 - 1) + 1)*boxUnit;
    // seedEntity.y = Math.floor(Math.random() * (8 - 1) + 1*boxUnit);

    // seedEntity.x = 64;
    // seedEntity.y = 128;
    // seedEntity.state = 'alive';
    // spawnEntity(seedEntity, context);

    initializeEntities();
}


function initializeEntities() {

    spawnEntity(16, 24);

    spawnEntity(16, 32);

    spawnEntity(24, 32);

    spawnEntity(32, 32);

}

function computeNeighborValues(x, y) {
    var neighborMatrix = new Array();
    //  ________
    // |X||_||_|
    // |_||_||_|
    // |_||_||_|
    var xpos = x - GRID_UNIT;
    var ypos = y + GRID_UNIT;
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[0] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||X||_|
    // |_||_||_|
    // |_||_||_|
    (xpos = x), (ypos = y + GRID_UNIT);
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[1] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||X|
    // |_||_||_|
    // |_||_||_|
    (xpos = x + GRID_UNIT), (ypos = y + GRID_UNIT);
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[2] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |_||_||X|
    // |_||_||_|
    (xpos = x + GRID_UNIT), (ypos = y);
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[3] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |_||_||_|
    // |_||_||X|
    (xpos = x - GRID_UNIT), (ypos = y + GRID_UNIT);
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[4] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |_||_||_|
    // |_||X||_|
    (xpos = x), (ypos = y - GRID_UNIT);
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[5] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |_||_||_|
    // |X||_||_|
    (xpos = x - GRID_UNIT), (ypos = y - GRID_UNIT);
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[6] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |X||_||_|
    // |_||_||_|
    (xpos = x - GRID_UNIT), (ypos = y);
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[7] = createEntity(xpos, ypos);
    }
    //current cell
    //  ________
    // |_||_||_|
    // |_||X||_|
    // |_||_||_|
    (xpos = x), (ypos = y);
    if (IsWithinGrid(xpos, ypos)) {
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


function computeRules(entities) {
    if (entities.length >= 8) {
        let currentEntity = entities[8];
        let neighborLiveCount = getNeighborLiveCount(entities);
        if (currentEntity.state == 'alive') {
            neighborLiveCount--; //Ignore current cell from neighnor count.
        }

        //Rule: live cell whose neighbor live cell count <2 -> die
        if (currentEntity.state == 'alive' && neighborLiveCount < 2) {
            //kill entity
            killEntity(currentEntity.x, currentEntity.y);
        }
        if (currentEntity.state == 'alive' && (neighborLiveCount == 2 || neighborLiveCount == 3)) {
            //remain alive
        }
        if (currentEntity.state == 'alive' && neighborLiveCount > 3) {
            //kill entity
            killEntity(currentEntity.x, currentEntity.y);
        }
        if (currentEntity.state == 'dead' && neighborLiveCount == 3) {
            //entity born
            spawnEntity(currentEntity.x, currentEntity.y);
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


function drawGrid(w, h, id) {
    var canvas = document.getElementById(id);
    var ctx = canvas.getContext('2d');
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    CanvasRenderingContext2D.fillStyle = 'white';


    for (x = 0; x <= w; x += 20) {
        for (y = 0; y <= h; y += 20) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    }

};

//-----------//

////////////////////////////////////////////////////////////////////////