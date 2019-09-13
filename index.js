function map_val(value, inMin, inMax, outMin, outMax) {
	return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

let canvas = document.querySelectorAll("canvas");
let map = canvas[0].getContext("2d");
let view = canvas[1].getContext("2d");

function resize() {
	map.width =
	map.height =
	view.width =
	view.height =
	canvas[0].height =
	canvas[1].height =
	canvas[0].width =
	canvas[1].width =
	window.innerWidth / 2 * 0.8;
}
window.addEventListener("resize", resize);

function main() {
	for (let i = 0; i < 5; i++) {
		walls.push(new Wall());
	}
	walls.push(new Wall(0, 0, 1, 0));
	walls.push(new Wall(1, 0, 1, 1));
	walls.push(new Wall(1, 1, 0, 1));
	walls.push(new Wall(0, 1, 0, 0));
	camera = new Camera();
	resize();
	render();
}

function render() {
	map.clearRect(0, 0, map.width, map.height);
	map.strokeStyle = "black";
	map.lineWidth = 5;
	for (let wall of walls) {
		map.beginPath();
		map.moveTo(wall.x1 * map.width, wall.y1 * map.height);
		map.lineTo(wall.x2 * map.width, wall.y2 * map.height);
		map.stroke();
	}

	map.beginPath();
	map.moveTo(camera.x, camera.y);
	map.lineTo(camera.x + Math.cos(camera.a - camera.fov/2), camera.y + Math.sin(camera.a - camera.fov/2));
	map.stroke();
	console.log(camera.x);

	view.clearRect(0, 0, view.width, view.height);
	view.strokeStyle = "black";
	map.lineWidth = 5;
	for (let i = 0; i < 100; i++);

	window.requestAnimationFrame(render);
}

let walls = [];
class Wall {
	constructor(x1, y1, x2, y2) {
		if (typeof x1 == "number") {
			this.x1 = x1;
			this.y1 = y1;
			this.x2 = x2;
			this.y2 = y2;
		} else {
			this.x1 = Math.random();
			this.y1 = Math.random();
			this.x2 = Math.random();
			this.y2 = Math.random();
		}
		this.h = 0.2;
	}
}

let camera;
class Camera {
	constructor() {
		this.x = 0.1;
		this.y = 0.1;
		this.a = 0;
		this.fov = Math.PI / 2;
	}
}

main();
