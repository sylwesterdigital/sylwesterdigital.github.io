find . -mindepth 1 -maxdepth 1 -type d -not -name "ignore" -exec du -sh {} + | sort -rh | head -n 10 | cut -f2 | while read -r folder; do
    mv "$folder" ignore/
done

