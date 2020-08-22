const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const boxUnit = 8;

//set background color to black

context.fillStyle = 'gray';
context.fillRect(0, 0, canvas.width, canvas.height);
let entity = {
	x: 0,
	y: 0,
	state: 'dead'
};

function rgbToHex(r, g, b) {
	if (r > 255 || g > 255 || b > 255) throw 'Invalid color component';
	return ((r << 16) | (g << 8) | b).toString(16);
}

function getEntityColor(context, x, y) {
	var p = context.getImageData(x, y, boxUnit, boxUnit).data;
	console.log(p);
	var hex = '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6);
	return hex;
}

function IsEntityWhite(context, x, y) {
	let entityColor = getEntityColor(context, x, y);
	if (entityColor == '#ffffff') return true;
	return false;
}

function initializeBoard() {
	entity.x = Math.floor(Math.random() * (canvas.width - 1) + 1);
	entity.y = Math.floor(Math.random() * (canvas.height - 1) + 1);
	entity.state = 'alive';
	context.fillStyle = 'white';
	context.fillRect(entity.x, entity.y, boxUnit, boxUnit);
}
function computeNeighborValues(context, x, y) {
	var values = new Array();
	var xpos = x - boxUnit;
	var ypos = y + boxUnit;
	if (xpos > 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		values[0] = IsEntityWhite(context, x - boxUnit, y + boxUnit);
	}
	(xpos = x), (ypos = y + boxUnit);
	if (xpos > 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		values[1] = IsEntityWhite(context, x - boxUnit, y + boxUnit);
	}
	(xpos = x + boxUnit), (ypos = y + boxUnit);
	if (xxpos > 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		values[2] = IsEntityWhite(context, x - boxUnit, y + boxUnit);
	}
	(xpos = x + boxUnit), (ypos = y);
	if (xpos > 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		values[3] = IsEntityWhite(context, x - boxUnit, y + boxUnit);
	}
	(xpos = x - boxUnit), (ypos = y + boxUnit);
	if (xpos > 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		values[4] = IsEntityWhite(context, x - boxUnit, y + boxUnit);
	}
	(xpos = x), (ypos = y - boxUnit);
	if (xpos > 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		values[5] = IsEntityWhite(context, x - boxUnit, y + boxUnit);
	}
	(xpos = x - boxUnit), (ypos = y - boxUnit);
	if (xpos > 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		values[6] = IsEntityWhite(context, x - boxUnit, y + boxUnit);
	}
	(xpos = x - boxUnit), (ypos = y);
	if (xpos > 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		values[7] = IsEntityWhite(context, x - boxUnit, y + boxUnit);
	}
	//current cell
	(xpos = x), (ypos = y);
	if (xpos > 0 && ypos > 0 && xpos < canvas.width && ypos < canvas.height) {
		values[8] = IsEntityWhite(context, x - boxUnit, y + boxUnit);
	}
	return values;
}
function getNeighborLiveCount(values) {
	let count = 0;
	for (let i = 0; i < 8; i++) {
		if (values[i] == '#ffffff') {
			count++;
		}
	}
	return count;
}
function computeRules(values, x, y) {
	var currentEntity = new entity();
	currentEntity.x = x;
	currentEntity.y = y;
	currentEntity.state = values[8] == true ? 'alive' : 'dead';
	let neighborLiveCount = getNeighborLiveCount(values);
	//Rule: live cell whose neighbor live cell count <2 -> die
	if (entity.state == 'alive' && neighborLiveCount < 2) {
		//kill entity
		context.fillStyle = 'gray';
		context.fillRect(entity.x, entity.y, boxUnit, boxUnit);
	}
	if (entity.state == 'alive' && (neighborLiveCount == 2 || neighborLiveCount == 3)) {
		//remain alive
	}
	if (entity.state == 'alive' && neighborLiveCount > 3) {
		//kill entity
		context.fillStyle = 'gray';
		context.fillRect(entity.x, entity.y, boxUnit, boxUnit);
	}
	if (entity.state == 'dead' && neighborLiveCount == 3) {
		//entity born
		context.fillStyle = 'white';
		context.fillRect(entity.x, entity.y, boxUnit, boxUnit);
	}
}

function nextGen(context) {
	for (i = 0; i < canvas.width; i = i + boxUnit) {
		for (j = 0; j < canvas.height; j = j + boxUnit) {
			computeRules(computeNeighborValues(context, i, j), i, j);
		}
	}
}

initializeBoard();

//let game = setInterval(draw, 100);
