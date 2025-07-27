#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <img_file>"
    exit 1
fi

# Get the input IMG file
IMG_FILE="$1"

# Check if the input file exists
if [ ! -f "$IMG_FILE" ]; then
    echo "Error: File '$IMG_FILE' not found!"
    exit 1
fi

# Create the output directory if it doesn't exist
OUTPUT_DIR="images/favicon"
mkdir -p "$OUTPUT_DIR"

# Define the resolutions
# RESOLUTIONS=(16 32 48 72 96 128 144 192 256 512);
RESOLUTIONS=(16 32 48 72 144 192 512);

# Loop through each resolution and convert the IMG to PNG
for RES in "${RESOLUTIONS[@]}"; do
    OUTPUT_FILE="$OUTPUT_DIR/icon-${RES}.png"
    magick -background transparent -density 300 "$IMG_FILE" -resize "${RES}x${RES}" "$OUTPUT_FILE"
    echo "Created: $OUTPUT_FILE"
done

echo "All icons have been created in the '$OUTPUT_DIR' directory."
