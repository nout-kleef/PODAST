function PODASTImage(x, y, w, h, type, img) {
	this.topLeft = {
		x: x,
		y: y
	};
	this.dimensions = {
		width: w,
		height: h
	};
	this.type = type === "output" ? "output" : "input";
	this.img = img;

	this.show = function() {
		if(typeof this.pixels === 'undefined') {
			if(typeof this.img !== 'undefined') {
				// show regular p5Image
				image(this.img, this.topLeft.x, this.topLeft.y);
			} else {
				// show box indicating where image can be shown
				noFill();
				stroke(127, 127, 0);
				strokeWeight(1);
				rect(this.topLeft.x, this.topLeft.y, this.dimensions.width, this.dimensions.height);
				// explanatory text
				textSize(headerHeight * 0.3);
				fill(217);
				noStroke();
				textAlign(CENTER);
				let str;
				if(this.type === "input") {
					str = "Upload an image to see it displayed here.";
				} else if(this.type === "output") {
					str = "Upload an image to see the image\n after encryption displayed here.";
				}
				text(str, this.topLeft.x + 0.5 * this.dimensions.width, this.topLeft.y + 0.5 * this.dimensions.height);
			}
		}
	}
}