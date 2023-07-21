import os
import subprocess
import sys
import re

# Check if qrcode module is installed, if not, install it
try:
    import qrcode
except ImportError:
    print("qrcode module not found. Installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "qrcode[pil]"])

# Re-import after installing
import qrcode

def sanitize_filename(filename):
    """
    Sanitize the filename by removing special characters.
    """
    return re.sub(r'[\\/*?:"<>|]', "", filename)

def generate_qr_code(url):
    """
    Generate a QR code for the given URL and save it as a PNG image.
    """
    # Create a QR code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )

    # Add data to the QR code
    qr.add_data(url)
    qr.make(fit=True)

    # Create an image from the QR Code instance
    img = qr.make_image(fill='black', back_color='white')

    # Save it somewhere, change the extension as needed:
    img = img.resize((2048, 2048))
    filename = sanitize_filename(url) + '.png'
    img.save(filename)

if __name__ == "__main__":
    # Ask the user for a URL
    url = input("Please enter the URL you want to generate a QR code for: ")
    if url:
        try:
            # Generate the QR code
            generate_qr_code(url)
            print("QR code generated successfully!")
        except Exception as e:
            # Catch and display any errors
            print(f"An error occurred: {e}")
    else:
        print("Invalid URL. Please try again.")
