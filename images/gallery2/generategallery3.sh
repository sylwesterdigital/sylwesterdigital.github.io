k#!/bin/bash
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
jq -c '.[]' "$JSON_FILE" | while IFS= read -r line; do
    id=$(echo "$line" | jq -r '.src')
    video_dir="${DIR_PATH}/video-${id}"
    mkdir -p "$video_dir"
    video_path="${video_dir}/${id}.mp4"
    thumbnail_path="${video_dir}/${id}_thumbnail.%(ext)s"
    if [ "$first" = true ]; then
        first=false
    else
        echo "," >> "$OUTPUT_FILE"
    fi
    # Download video if it doesn't exist
    if [ ! -f "$video_path" ]; then
        yt-dlp -f best -o "$video_path" "https://www.youtube.com/watch?v=$id"
        sleep 2
    fi
    # Download thumbnail if it doesn't exist
    if [ ! -f "${thumbnail_path}" ]; then
        yt-dlp --skip-download --write-thumbnail -o "$thumbnail_path" "https://www.youtube.com/watch?v=$id"
        sleep 2
    fi
    # Fetch video metadata
    metadata=$(yt-dlp --skip-download --print-json "https://www.youtube.com/watch?v=$id")
    title=$(echo "$metadata" | jq -r '.title' | jq -aRs .)
    description=$(echo "$metadata" | jq -r '.description' | jq -aRs .)
    # Find the thumbnail file
    thumbnail_file=$(find "$video_dir" -name "${id}_thumbnail.*" -print -quit)
    if [[ -f "$thumbnail_file" ]]; then
        thumbnail_rel_path="${thumbnail_file#${DIR_PATH}/}"
        echo "{ \"type\": \"youtube\", \"src\": \"$id\", \"thumbnail\": \"$thumbnail_rel_path\", \"title\": $title, \"description\": $description }" >> "$OUTPUT_FILE"
    else
        echo "{ \"type\": \"youtube\", \"src\": \"$id\", \"title\": $title, \"description\": $description }" >> "$OUTPUT_FILE"
    fi
done
echo "]" >> "$OUTPUT_FILE"
echo "Download complete and $OUTPUT_FILE created."
