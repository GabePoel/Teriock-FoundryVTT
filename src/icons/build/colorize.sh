#!/bin/bash

# Image colorizer

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed. Please install it first."
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install it for JSON parsing."
    exit 1
fi

# Check if reference file exists
if [ ! -f "./ref.json" ]; then
    echo "Error: ./ref.json reference file not found."
    exit 1
fi

# Check if templates directory exists
if [ ! -d "./templates" ]; then
    echo "Error: ./templates directory not found."
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "../general"

# Find all files in templates directory containing "ELEMENT"
TEMPLATE_FILES=(./templates/*ELEMENT*)

# Check if any template files were found
if [ ${#TEMPLATE_FILES[@]} -eq 0 ] || [ ! -e "${TEMPLATE_FILES[0]}" ]; then
    echo "No files containing 'ELEMENT' found in ./templates directory."
    exit 1
fi

echo "Found ${#TEMPLATE_FILES[@]} template file(s) to process:"
for file in "${TEMPLATE_FILES[@]}"; do
    echo "  $(basename "$file")"
done
echo ""

# Read color schemes from JSON
echo "Loading color schemes from ref.json..."
ELEMENTS=$(jq -r '.ELEMENT | keys[]' ./ref.json)

echo "Available elements with color variants:"
for element in $ELEMENTS; do
    dark=$(jq -r ".ELEMENT.${element}.dark" ./ref.json)
    mid=$(jq -r ".ELEMENT.${element}.mid" ./ref.json)
    light=$(jq -r ".ELEMENT.${element}.light" ./ref.json)
    echo "  ${element}: Dark=$dark, Mid=$mid, Light=$light"
done
echo ""

# Process each template file
for template_file in "${TEMPLATE_FILES[@]}"; do
    if [ ! -f "$template_file" ]; then
        continue
    fi
    
    filename=$(basename "$template_file")
    base_name="${filename%.*}"
    extension="${filename##*.}"
    
    echo "Processing template: $filename"
    
    # Create colorized versions for each element and each color variant
    for element in $ELEMENTS; do
        dark_color=$(jq -r ".ELEMENT.${element}.dark" ./ref.json)
        mid_color=$(jq -r ".ELEMENT.${element}.mid" ./ref.json)
        light_color=$(jq -r ".ELEMENT.${element}.light" ./ref.json)
        
        # Create dark version
        dark_output="${base_name/ELEMENT/${element}_dark}.${extension}"
        dark_path="../general/$dark_output"
        echo "  Creating: ${element}_dark ($dark_color) -> $dark_output"
        
        # Create gradient for colorization that preserves blacks and whites
        temp_dark_gradient=$(mktemp --suffix=.png)
        convert -size 256x1 \
            \( -size 128x1 gradient:"#000000"-"$dark_color" \) \
            \( -size 128x1 gradient:"$dark_color"-"#ffffff" \) \
            +append "$temp_dark_gradient"
        
        convert "$template_file" \
            -colorspace Gray \
            "$temp_dark_gradient" \
            -clut \
            "$dark_path"
        
        rm "$temp_dark_gradient"
        
        if [ $? -eq 0 ]; then
            echo "    ✓ Created: $dark_path"
        else
            echo "    ✗ Failed: $dark_path"
        fi
        
        # Create mid version
        mid_output="${base_name/ELEMENT/${element}_mid}.${extension}"
        mid_path="../general/$mid_output"
        echo "  Creating: ${element}_mid ($mid_color) -> $mid_output"
        
        temp_mid_gradient=$(mktemp --suffix=.png)
        convert -size 256x1 \
            \( -size 128x1 gradient:"#000000"-"$mid_color" \) \
            \( -size 128x1 gradient:"$mid_color"-"#ffffff" \) \
            +append "$temp_mid_gradient"
        
        convert "$template_file" \
            -colorspace Gray \
            "$temp_mid_gradient" \
            -clut \
            "$mid_path"
        
        rm "$temp_mid_gradient"
        
        if [ $? -eq 0 ]; then
            echo "    ✓ Created: $mid_path"
        else
            echo "    ✗ Failed: $mid_path"
        fi
        
        # Create light version
        light_output="${base_name/ELEMENT/${element}_light}.${extension}"
        light_path="../general/$light_output"
        echo "  Creating: ${element}_light ($light_color) -> $light_output"
        
        temp_light_gradient=$(mktemp --suffix=.png)
        convert -size 256x1 \
            \( -size 128x1 gradient:"#000000"-"$light_color" \) \
            \( -size 128x1 gradient:"$light_color"-"#ffffff" \) \
            +append "$temp_light_gradient"
        
        convert "$template_file" \
            -colorspace Gray \
            "$temp_light_gradient" \
            -clut \
            "$light_path"
        
        rm "$temp_light_gradient"
        
        if [ $? -eq 0 ]; then
            echo "    ✓ Created: $light_path"
        else
            echo "    ✗ Failed: $light_path"
        fi
        
        # Create merged tritone version
        merged_output="${base_name/ELEMENT/$element}.${extension}"
        merged_path="../general/$merged_output"
        echo "  Creating: ${element} (two-step blend) -> $merged_output"
        
        # Blend dark and light images
        temp_dark_light=$(mktemp --suffix=.png)
        convert "$dark_path" "$light_path" \
            \( "$template_file" -colorspace Gray \) \
            -fx "u[0]*(1-u[2]) + u[1]*u[2]" \
            "$temp_dark_light"
        
        # Blend that result with mid image using a middle range mask
        convert "$temp_dark_light" "$mid_path" \
            \( "$template_file" -colorspace Gray -level 25%,75% \) \
            -fx "u[0]*(1-u[2]) + u[1]*u[2]" \
            "$merged_path"
        
        # Clean up
        rm "$temp_dark_light"
        
        # Clean up intermediate images
        rm "$dark_path" "$mid_path" "$light_path"
        
        if [ $? -eq 0 ]; then
            echo "    ✓ Created merged: $merged_path"
            echo "    ✓ Cleaned up intermediate files"
        else
            echo "    ✗ Failed merged: $merged_path"
        fi
    done
    echo ""
done

echo "Colorization complete!"
echo ""
echo "Output files created in ../general directory:"
ls -1 ../general/ | grep -v "ELEMENT" | sort