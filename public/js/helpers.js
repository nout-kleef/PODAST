function decimalToBinary(decimal) {
	// return unpadded binary string
	return (decimal >>> 0).toString(2);
}