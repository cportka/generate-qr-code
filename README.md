# QR Code Generator

This is a simple Python script that generates a QR code for a given URL. The QR code is saved as a 2048x2048 PNG image. The filename of the image is a sanitized version of the input URL.

## Requirements

- Python 3
- pip (Python package installer)

The script will automatically install the `qrcode` Python library if it's not already installed.

## Usage

1. Save the script to a file, for example `generate_qr.py`.

2. Open a terminal or command prompt.

3. Navigate to the directory where you saved the script. For example, if you saved the script in a directory called `scripts` on your desktop, you would use the command `cd Desktop/scripts`.

4. Run the script using Python. The command to do this is `python generate_qr.py` if you're using Python 3. If you have both Python 2 and Python 3 installed, you might need to use `python3 generate_qr.py` instead.

5. The script will prompt you to enter a URL. Type the URL and press Enter.

6. If everything goes well, the script will generate a QR code and save it as a PNG image in the same directory. The filename of the image is a sanitized version of the input URL. If the `qrcode` library is not installed, the script will attempt to install it first.

Here's an example of what you might see in the terminal:

    $ python generate_qr.py
    Please enter the URL you want to generate a QR code for: https://www.example.com
    QR code generated successfully!

After running this, you should see a file in the same directory. This file is a PNG image of the QR code for the URL you entered. The filename of the image is a sanitized version of the input URL.

## License

This project is licensed under the terms of the MIT license.
