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
	if (kb.d) {
		camera.a += 0.04;
	}
	if (kb.a) {
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
}

let kb = {};
addEventListener("keydown", e => kb[e.key] = true);
addEventListener("keyup", e => kb[e.key] = false);

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
	map.strokeStyle = "gray";
	map.lineWidth = 1;

	let rays = 20;
	for (let i = 0; i < rays; i++) {
		let a = camera.a + map_val(i, 0, rays-1, -camera.fov/2, camera.fov/2);
		map.beginPath();
		map.moveTo(
			camera.x * map.width,
			camera.y * map.height,
		);
		let hit = cast_ray(camera.x, camera.y, a, walls);
		map.lineTo(
			(hit ? hit.x : camera.x + Math.cos(a)) * map.width,
			(hit ? hit.y : camera.y + Math.sin(a)) * map.height,
		);
		map.stroke();
	}

	view.clearRect(0, 0, view.width, view.height);
	view.strokeStyle = "black";
	map.lineWidth = 5;
	for (let i = 0; i < 100; i++);

	window.requestAnimationFrame(render);
}

function cast_ray(x, y, a, walls) {
	let s = { x: 0, y: 0, d: Infinity };
	for (let w of walls) {
		let w1 = {
			x: w.x1 - x,
			y: w.y1 - y,
		};
		let w2 = {
			x: w.x2 - x,
			y: w.y2 - y,
		};

		const rotate = (p, a) => { return { x: p.x*Math.cos(a) + p.y*Math.sin(a), y: p.y*Math.cos(a) - p.x*Math.sin(a) } };

		w1 = rotate(w1, a);
		w2 = rotate(w2, a);

		let k = (w2.y - w1.y) / (w2.x - w1.x);
		let m = w1.y-k*w1.x;

		let d = -m/k;
		let px = d*Math.cos(-a);
		let py = d*Math.sin(-a);

		if (d < s.d) s = { x: px, y: py, d };
	}
	if (s.d === Infinity) {
		return null;
	} else {
		return s;
	}
}

function old_cast_ray(x, y, a, walls) {
	const { tan, sqrt, pow, PI } = Math;
	const A = tan(a);
	const B = x*tan(a)-y;
	let s = { x: 0, y: 0, d: Infinity };
	for (let w of walls) {
		const C = (w.y2-w.y1)/(w.x2-w.x1);
		const D = w.x1*(w.y2-w.y1)/(w.x2-w.x1)-w.y1;

		const px = (B-D)/(A-C);
		const py = C*(B-D)/(A-C)-D;

		if (((w.x1 <= px && px <= w.x2) || (w.x1 >= px && px >= w.x2)) &&
			((w.y1 <= py && py <= w.y2) || (w.y1 >= py && py >= w.y2))) {
			const d = sqrt(pow(x-px, 2) + pow(y-py, 2));
			if (d < s.d) {
				s = { x: px, y: py, d };
			}
		}
	}

	if (s.d === Infinity) {
		return null;
	} else {
		return s;
	}
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
