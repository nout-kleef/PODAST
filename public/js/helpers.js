const decimalToBinary = (decimal) => (decimal >>> 0).toString(2);

// add leading zeroes
// NOTE: only works for up to 8 characters
const addLeadingZeroes = (input, length) => ('00000000' + input).substr(-length);