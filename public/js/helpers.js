const decimalToBinary = (decimal) => (decimal >>> 0).toString(2);

// add leading zeroes
// NOTE: only works for up to 24 characters
const addLeadingZeroes = (input, length) => ('000000000000000000000000' + input).substr(-length);