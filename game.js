
//Todo track entity selection/spwn/kill based upon GUI visz\

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const boxUnit = 8;

//set background color to black


class entity{
	constructor(x,y,state)
	{
		this.x = x;
		this.y = y;
		this.state = state;
	}
}

initializeBoard();

let game = setInterval(nextGen(context), 100);

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
	let seedEntity = new entity();
	seedEntity.x = Math.floor(Math.random() * (8 - 1) + 1)*boxUnit;
	seedEntity.y = Math.floor(Math.random() * (8 - 1) + 1*boxUnit);
	seedEntity.state = 'alive';
	spawnEntity(seedEntity, context);
}
function createEntity(x,y,state)
{
	let currentEntity = new entity();
	currentEntity.x = x;
	currentEntity.y = y;
	currentEntity.state  = state;
	return currentEntity;
}
function computeNeighborValues(context, x, y) {
	var values = new Array();
	var entities = new Array();
	var xpos = x - boxUnit;
	var ypos = y + boxUnit;
	if (xpos > 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {		
		
		entities[0] = createEntity(xpos, ypos, IsEntityWhite(context, x - boxUnit, y + boxUnit) == true?'alive':'dead');
	}
	(xpos = x), (ypos = y + boxUnit);
	if (xpos >= 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		entities[1] = createEntity(xpos, ypos, IsEntityWhite(context, x - boxUnit, y + boxUnit) == true?'alive':'dead');
	}
	(xpos = x + boxUnit), (ypos = y + boxUnit);
	if (xpos >= 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		entities[2] = createEntity(xpos, ypos, IsEntityWhite(context, x - boxUnit, y + boxUnit) == true?'alive':'dead');
	}
	(xpos = x + boxUnit), (ypos = y);
	if (xpos >= 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		entities[3] = createEntity(xpos, ypos, IsEntityWhite(context, x - boxUnit, y + boxUnit) == true?'alive':'dead');
	}
	(xpos = x - boxUnit), (ypos = y + boxUnit);
	if (xpos >= 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		entities[4] = createEntity(xpos, ypos, IsEntityWhite(context, x - boxUnit, y + boxUnit) == true?'alive':'dead');
	}
	(xpos = x), (ypos = y - boxUnit);
	if (xpos >= 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		entities[5] = createEntity(xpos, ypos, IsEntityWhite(context, x - boxUnit, y + boxUnit) == true?'alive':'dead');
	}
	(xpos = x - boxUnit), (ypos = y - boxUnit);
	if (xpos >= 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		entities[6] = createEntity(xpos, ypos, IsEntityWhite(context, x - boxUnit, y + boxUnit) == true?'alive':'dead');
	}
	(xpos = x - boxUnit), (ypos = y);
	if (xpos >= 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		entities[7] = createEntity(xpos, ypos, IsEntityWhite(context, x - boxUnit, y + boxUnit) == true?'alive':'dead');
	}
	//current cell
	(xpos = x), (ypos = y);
	if (xpos >= 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		entities[8] = createEntity(xpos, ypos, IsEntityWhite(context, x - boxUnit, y + boxUnit) == true?'alive':'dead');
	}
	return entities;
}
function getNeighborLiveCount(entities) {
	let count = 0;
	entities.forEach((entity) => {
		if(entity.state=='alive')
		{
			count++;
		}
		
	});
	return count;

}
function killEntity(entity, context)
{
	let ctxt  = canvas.getContext('2d');
	ctxt.fillStyle = 'red';
	ctxt.fillRect(entity.x, entity.y, boxUnit, boxUnit);
}
function spawnEntity(entity, context)
{  let ctxt  = canvas.getContext('2d');
ctxt.fillStyle = 'white';
ctxt.fillRect(entity.x, entity.y, boxUnit, boxUnit);
}
function computeRules(entities, context) {
	if(entities.length>=8){
    let currentEntity = entities[8];
	let neighborLiveCount = getNeighborLiveCount(entities);
	//Rule: live cell whose neighbor live cell count <2 -> die
	if (currentEntity.state == 'alive' && neighborLiveCount < 2) {
		//kill entity
	      killEntity(currentEntity, context)
	}
	if (currentEntity.state == 'alive' && (neighborLiveCount == 2 || neighborLiveCount == 3)) {
		//remain alive
	}
	if (currentEntity.state == 'alive' && neighborLiveCount > 3) {
		//kill entity
		killEntity(currentEntity, context)
	}
	if (currentEntity.state == 'dead' && neighborLiveCount == 3) {
		//entity born
	    spawnEntity(currentEntity, context);
	}
}
}

function nextGen(context) {
	for (i = 0; i < canvas.width; i = i + boxUnit) {
		for (j = 0; j < canvas.height; j = j + boxUnit) {
			
			computeRules(computeNeighborValues(context, i, j),context);
			}	}
	}



