function PODASTPixel(value) {
	this.value = value;
	this.binaryData = null;
	this.binaryPointer = null;
	this.significanceArray = this.getSignificanceArray();
}

PODASTPixel.prototype.isAltered = () => this.binaryData || this.binaryPointer;

PODASTPixel.prototype.getSignificanceArray = () => {
	const r = addLeadingZeroes(decimalToBinary(this.value[0]), 8);
	const g = addLeadingZeroes(decimalToBinary(this.value[1]), 8);
	const b = addLeadingZeroes(decimalToBinary(this.value[2]), 8);
	// const a = addLeadingZeroes(decimalToBinary(this.value[3]), 8);
	if(DEBUGGING >= 3) {
		console.log(r,g,b);
	}
	let responseString = "";
	for(var i = 0; i < 8; i++) {
		responseString += r.charAt(i) + g.charAt(i) + b.charAt(i);
	}
	return responseString.split("");
};

PODASTPixel.prototype.updateValueFromSignificanceArray = (significanceArray) => {
	let r = [];
	let g = [];
	let b = [];
	for(var i = 0; i < significanceArray.length - 2; i++) {
		r.push(significanceArray[i]);
		g.push(significanceArray[i + 1]);
		b.push(significanceArray[i + 2]);
	}
	this.value[0] = binaryToDecimal(r.join(""));
	this.value[1] = binaryToDecimal(g.join(""));
	this.value[2] = binaryToDecimal(b.join(""));
}