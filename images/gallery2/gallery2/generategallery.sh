#!/bin/bash

if ! command -v jq &> /dev/null; then
    echo "jq is required but it's not installed. Install it and run this script again."
    exit 1
fi

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path_to_json_file>"
    exit 1
fi

JSON_FILE="$1"
DIR_PATH=$(dirname "$JSON_FILE")
OUTPUT_FILE="${DIR_PATH}/data-gallery.json"

echo "[" > "$OUTPUT_FILE"

first=true
while IFS= read -r line; do
    if [ "$first" = true ]; then
        first=false
    else
        echo "," >> "$OUTPUT_FILE"
    fi

    id=$(echo "$line" | jq -r '.src')
    metadata=$(yt-dlp --skip-download --write-thumbnail --dump-json "https://www.youtube.com/watch?v=$id")

    title=$(echo "$metadata" | jq -r '.title' | jq -aRs .)
    description=$(echo "$metadata" | jq -r '.description' | jq -aRs .)

    timestamp=$(date +"%Y%m%d%H%M%S")
    thumbnail_file_template="${DIR_PATH}/${timestamp}_${id}_thumbnail.%(ext)s"
    yt-dlp --skip-download --write-thumbnail --get-filename -o "$thumbnail_file_template" "https://www.youtube.com/watch?v=$id"
    yt-dlp --skip-download --write-thumbnail -o "$thumbnail_file_template" "https://www.youtube.com/watch?v=$id"

    # Finding the correct thumbnail file
    thumbnail_file_path=""
    for ext in jpg jpeg png webp; do
        if [[ -f "${DIR_PATH}/${timestamp}_${id}_thumbnail.${ext}" ]]; then
            thumbnail_file_path="${timestamp}_${id}_thumbnail.${ext}"
            break
        fi
    done

    if [[ -z "$thumbnail_file_path" ]]; then
        thumbnail_rel_path="thumbnail_missing"
    else
        thumbnail_rel_path="${DIR_PATH#$PWD/}/$thumbnail_file_path"
    fi

    echo "{ \"type\": \"youtube\", \"src\": \"$id\", \"thumbnail\": \"$thumbnail_rel_path\", \"title\": $title, \"description\": $description }" >> "$OUTPUT_FILE"
done < <(jq -c '.[] | select(.type == "youtube")' "$JSON_FILE")

echo "]" >> "$OUTPUT_FILE"

echo "Download complete and $OUTPUT_FILE created."
