function PODASTPixel(value) {
	this.value = value.splice(0, 2); // opacity is not needed
	this.binaryData = null;
	this.binaryPointer = null;
}

PODASTPixel.prototype.isAltered = () => this.binaryData && this.binaryPointer;