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
	setInterval(update, 1000/60);
}

function update() {
	if (kb.ArrowRight) {
		camera.a += 0.04;
	}
	if (kb.ArrowLeft) {
		camera.a -= 0.04;
	}
	if (kb.w) {
		camera.x += Math.cos(camera.a) * 0.005;
		camera.y += Math.sin(camera.a) * 0.005;
	}
	if (kb.s) {
		camera.x -= Math.cos(camera.a) * 0.005;
		camera.y -= Math.sin(camera.a) * 0.005;
	}
	if (kb.a) {
		camera.x += Math.sin(camera.a) * 0.005;
		camera.y -= Math.cos(camera.a) * 0.005;
	}
	if (kb.d) {
		camera.x -= Math.sin(camera.a) * 0.005;
		camera.y += Math.cos(camera.a) * 0.005;
	}
}

let kb = {};
addEventListener("keydown", e => kb[e.key] = true);
addEventListener("keyup", e => kb[e.key] = false);

async function render() {
	map.clearRect(0, 0, map.width, map.height);
	view.clearRect(0, 0, view.width, view.height);
	map.strokeStyle = "black";
	map.lineWidth = 5;
	for (let wall of walls) {
		map.beginPath();
		map.moveTo(wall.x1 * map.width, wall.y1 * map.height);
		map.lineTo(wall.x2 * map.width, wall.y2 * map.height);
		map.stroke();
	}
	map.strokeStyle = "gray";
	map.lineWidth = 1;

	view.fillStyle = "red";

	let rays = 200;
	for (let i = 0; i < rays; i++) {
		let a = camera.a + map_val(i, 0, rays-1, -camera.fov/2, camera.fov/2);
		map.beginPath();
		map.moveTo(
			camera.x * map.width,
			camera.y * map.height,
		);
		let ray_end = {
			x: camera.x + Math.cos(a)*2,
			y: camera.y + Math.sin(a)*2,
		};
		let hit = cast_ray(camera, ray_end, walls);
		if (hit) {
			map.lineTo(
			(hit ? hit.x : 0) * map.width,
			(hit ? hit.y : 0) * map.height,
			);
			map.stroke();
			
			let x = i/rays;
			let w = 1/rays;
			let h = hit.h / Math.tan(camera.fov/2) / hit.d * view.height / 2;
			let y = (view.height - h)/2;

			view.fillRect(x * view.width, y, w * view.width, h);
		}
	}

	window.requestAnimationFrame(render);
}

function cast_ray(ray_start, ray_end, walls) {
	let x1 = ray_start.x;
	let y1 = ray_start.y;
	let x2 = ray_end.x;
	let y2 = ray_end.y;
	let shortest = { x: 0, y: 0, d: Infinity, h: 0 };
	for (let w of walls) {
		let x3 = w.x1;
		let y3 = w.y1;
		let x4 = w.x2;
		let y4 = w.y2;
		let px =
			((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) /
			((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
		let py =
			((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) /
			((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));

		if (between(x1, px, x2) &&
			between(x3, px, x4) &&
			between(y1, py, y2) &&
			between(y3, py, y4)) {
			let d = Math.sqrt((x1-px)*(x1-px)+(y1-py)*(y1-py));
			let h = w.h;

			if (d < shortest.d) {
				shortest = { x: px, y: py, d, h };
			}
		}
	}

	if (shortest.d != Infinity) {
		return shortest;
	} else {
		return null;
	}
}

const between = (v0, v1, v2) => v0 <= v1 && v1 <= v2 || v2 <= v1 && v1 <= v0;

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
