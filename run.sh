#!/bin/bash

imageTag='amiranda/lunch-notifier'
localPort=80
dockerPort=80

if [[ "$(docker images -q $imageTag 2> /dev/null)" == "" ]] || [[ $1 == "rebuild" ]]; then
    # Build a new docker image.
    docker build -t $imageTag .
    sleep 1
fi

# Start image.
docker run \
-e "CLIENT_URL=http://localhost" \
-e "SPREADSHEET_ID=1pP81mzxvsN5B8EriyJgrWHRha5tMM07D0sya_OTVgX4" \
-e "SPREADSHEET_RANGE=Food!!A1:X100" \
-e "PORT=$dockerPort" \
-p $localPort:$dockerPort -d $imageTag
