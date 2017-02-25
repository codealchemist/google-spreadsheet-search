#!/bin/bash

if [[ "$(docker images -q myimage:mytag 2> /dev/null)" == "" ]]; then
docker build -t amiranda/lunch-notifier .
  # do something
fi
sleep 1
docker run -p 80:9200 -d amiranda/lunch-notifier
