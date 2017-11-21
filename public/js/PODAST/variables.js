// VARIABLES USED ACROSS GITHUB AND OTHER PODAST PROJECTS

const RGB = [8, 8, 8];

/* use this to extract private key attributes, or to validate
 * example:
 * P#i97#d2#p3 --> i: 97, d: 2, p: 3
 */
const validatePrivateKeyRegEx = /P#i(\d{1,7})#d([1-9]|(?:1\d)|(?:2[0-3]))#p([1-9]|(?:1\d)|(?:2[0-3]))/;

/* use this to generate a private key given i, p, d
 * example:
 * i: 97, d: 2, p: 3 --> P#i97#d2#p3
 */
const generatePrivateKey = (i, p, d) => "P#i" + i + "#d" + d + "#p" + p;