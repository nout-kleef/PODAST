// VARIABLES USED ON THIS DEVICE ONLY,
// NOT SYNCED TO GITHUB

/* debugging levels
 * 0: no debugging, production level
 * 1: higher level messages, for example:
 * if(DEBUGGING >= 1) {
 *	console.info("finished encryption of plain text into image in "+time+"ms");
 * }
 * 2: less important notifications, warnings etc.
 * 3: temporary debugging, for example:
 * if(DEBUGGING >= 3) {
 *	console.log(arr[i]); // just to check something temporarily
 * }
 */
const DEBUGGING = 1;
if(DEBUGGING > 0) {
	console.info("Debugging level: " + DEBUGGING);
}