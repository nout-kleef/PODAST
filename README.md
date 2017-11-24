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