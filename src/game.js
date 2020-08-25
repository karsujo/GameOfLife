//Comments : 

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const boxUnit = 8;

//set background color to black


class entity {
    constructor(x, y, state) {
        this.x = x;
        this.y = y;
        this.state = state;
    }
}

initializeBoard();

function startGame() {
    setInterval(nextGen, 1000);
};

////////////////////////////////////////////////////////////////////////

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255) throw 'Invalid color component';
    return ((r << 16) | (g << 8) | b).toString(16);
}

function getEntityColor(context, x, y) {
    var p = context.getImageData(x, y, boxUnit, boxUnit).data;
    var hex = '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6);
    return hex;
}

function IsEntityWhite(context, x, y) {
    let entityColor = getEntityColor(context, x, y);
    if (entityColor == '#ffffff') return true;
    return false;
}

function initializeBoard() {
    context.fillStyle = 'gray';
    context.fillRect(0, 0, canvas.width, canvas.height);
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
    let e1 = new entity();
    e1.x = 64;
    e1.y = 128;
    spawnEntity(e1, context);

    let e2 = new entity();
    e2.x = 80;
    e2.y = 136;
    spawnEntity(e2, context);


    let e3 = new entity();
    e3.x = 64;
    e3.y = 128 + 8;
    spawnEntity(e3, context);

    let e4 = new entity();
    e4.x = 64 + 8;
    e4.y = 128 + 8;
    spawnEntity(e4, context);

}

function createEntity(x, y, state) {
    let currentEntity = new entity();
    currentEntity.x = x;
    currentEntity.y = y;
    currentEntity.state = IsEntityWhite(context, x, y) == true ? 'alive' : 'dead';
    return currentEntity;
}

function trackEntity(x, y) {
    let ctxt = canvas.getContext('2d');
    ctxt.fillStyle = 'blue';
    ctxt.fillRect(x, y, boxUnit, boxUnit);
}

function computeNeighborValues(x, y) {
    var neighborMatrix = new Array();
    //  ________
    // |X||_||_|
    // |_||_||_|
    // |_||_||_|
    var xpos = x - boxUnit;
    var ypos = y + boxUnit;
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[0] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||X||_|
    // |_||_||_|
    // |_||_||_|
    (xpos = x), (ypos = y + boxUnit);
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[1] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||X|
    // |_||_||_|
    // |_||_||_|
    (xpos = x + boxUnit), (ypos = y + boxUnit);
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[2] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |_||_||X|
    // |_||_||_|
    (xpos = x + boxUnit), (ypos = y);
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[3] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |_||_||_|
    // |_||_||X|
    (xpos = x - boxUnit), (ypos = y + boxUnit);
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[4] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |_||_||_|
    // |_||X||_|
    (xpos = x), (ypos = y - boxUnit);
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[5] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |_||_||_|
    // |X||_||_|
    (xpos = x - boxUnit), (ypos = y - boxUnit);
    if (IsWithinGrid(xpos, ypos)) {
        neighborMatrix[6] = createEntity(xpos, ypos);
    }
    //  ________
    // |_||_||_|
    // |X||_||_|
    // |_||_||_|
    (xpos = x - boxUnit), (ypos = y);
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
    return (x >= 0 && y > 0 && x < canvas.width && y < canvas.height);
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

function killEntity(entity) {
    let ctxt = canvas.getContext('2d');
    ctxt.fillStyle = 'gray';
    ctxt.fillRect(entity.x, entity.y, boxUnit, boxUnit);
}

function spawnEntity(entity) {
    let ctxt = canvas.getContext('2d');
    ctxt.fillStyle = 'white';
    ctxt.fillRect(entity.x, entity.y, boxUnit, boxUnit);
}

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
            killEntity(currentEntity)
        }
        if (currentEntity.state == 'alive' && (neighborLiveCount == 2 || neighborLiveCount == 3)) {
            //remain alive
        }
        if (currentEntity.state == 'alive' && neighborLiveCount > 3) {
            //kill entity
            killEntity(currentEntity)
        }
        if (currentEntity.state == 'dead' && neighborLiveCount == 3) {
            //entity born
            spawnEntity(currentEntity);
        }
    }
}

function go() {}


function nextGen() {
    for (i = 0; i < canvas.width; i = i + boxUnit) {
        for (j = 0; j < canvas.height; j = j + boxUnit) {
            // trackEntity(i, j);
            // if(i==64 && j==128)
            // {
            // 	alert("Hit");
            // }
            computeRules(computeNeighborValues(i, j));
        }
    }
}