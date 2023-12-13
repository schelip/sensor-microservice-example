#!/bin/bash

url="http://localhost:3000/sensor-reading"

temperature=$(awk -v min=20 -v max=30 'BEGIN{srand(); printf "%.2f\n", min+rand()*(max-min)}')
relative_humidity=$(awk -v min=40 -v max=70 'BEGIN{srand(); printf "%.2f\n", min+rand()*(max-min)}')
wind_speed=$(awk -v min=5 -v max=15 'BEGIN{srand(); printf "%.2f\n", min+rand()*(max-min)}')

while true; do
    # Vary values by a small random amount
    temperature=$(awk -v val=$temperature 'BEGIN{srand(); printf "%.2f\n", val + rand() - 0.5}')
    relative_humidity=$(awk -v val=$relative_humidity 'BEGIN{srand(); printf "%.2f\n", val + rand() - 0.5}')
    wind_speed=$(awk -v val=$wind_speed 'BEGIN{srand(); printf "%.2f\n", val + rand() - 0.5}')

    json_data="{\"temperature\":$temperature,\"relativeHumidity\":$relative_humidity,\"windSpeed\":$wind_speed}"

    echo "Body: $json_data"

    response=$(curl -s -X POST -H "Content-Type: application/json" -d "$json_data" "$url")

    echo "Response: $response"

    sleep 10
done