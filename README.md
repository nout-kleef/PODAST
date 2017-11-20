# PODAST
Pointer Data Steganography: new approach to hide data in media
PODAST is being developed as an educational project by Daan Velthuis and Nout Kleef.

Steganography is a way of keeping a message from being intercepted by a third party.
This is often achieved by converting the message into binary, and dividing the binary message into smaller pieces,
which are inserted into the binary values of pixels in an image.
The goal is to make as few alterations as possible, as too many changes to the image will result in a noticeable difference.

PODAST tries to make these changes even less obvious, by choosing pixels in such a way that there is often not even a need to alter the binary value of a pixel.
This is achieved by assigning the least significant bits in a pixel to a "pointer", which indicates the next pixel that is to be used for storing data.
By doing so, we can point to the next pixel, which already stores the correct data without even altering any bits in the process.

# Pseudocode

```{javascript, eval=FALSE}
Set i # index of first pixel
Set p # amount of pointer bits
Set d # amount of data bits
Set plaintext # binary representation (with leading 0's) of text to be hidden in image
Set image # array of PODASTPixel instances
Set image_binary # array of binary representations (with leading 0's) of pixels

# we need to edit plaintext.length / d + 1 [contains pointer terminator]
# example 1:
	# plaintext = "0100", i = 0, p = 3, d = 2
	# step 1:
		# data_bin = "01"																	  ddppp
		# next_index = 2 (pixel at current_index + next_index will be altered to "xx..(14)..xx01xxx")
		# 

For pixel In 

While plaintext.length > 0 And pixel_available(image_binary, current_index, p):

	Set data_bin = plaintext.splice(0, d)
	# choose a pixel
	Set next_index = get_relative_nextpixel_index(current_index, p, data_bin) # decimal
	Set currentpixel
	...
	current_index += next_index

pixel_available(image_binary, i, p):
	# 2^p - 1 potential pixels (-1, because 111..(p times) is used as a terminator)
	Set potential_pixels = image_binary.slice(i, i + 2^p - 1)
	For pixel in potential_pixels:
		If pixel Is Not altered: # we have not altered this pixel before
			return True
	return False

get_relative_nextpixel_index(current_index, )
```