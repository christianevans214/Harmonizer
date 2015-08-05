var mic;

function setup() {
	// uncomment this line to make the canvas the full size of the window
	// createCanvas(windowWidth, windowHeight);
	// createCanvas(640, 480);
	mic = new p5.AudioIn()
	mic.start();
}

function draw() {
	// draw stuff here
	// ellipse(width / 2, height / 2, 50, 50);
	// if (mouseIsPressed) {
	// 	fill(0);
	// } else {
	// 	fill(255);
	// }
	// ellipse(mouseX, mouseY, 80, 80);
	background(0);
	micLevel = mic.getLevel();
	ellipse(width / 2, constrain(height - micLevel * height * 5, 0, height), 10, 10)
}