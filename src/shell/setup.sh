#!/bin/bash

echo "Shell script to install all project depencdeny"
# here i will give inpt

TARGET_DIR=$1

if [ -z "$TARGET_DIR" ]; then
    echo "Please provide the project directory."
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
    echo "Directory $TARGET_DIR does not exist."
    exit 1
fi



cd "$TARGET_DIR" || exit

if [ ! -f "package.json" ]; then
    echo "No package.json found. Not a Node.js project."
    exit 0
fi

echo "Installing"
npm install 

echo "Starting project"
npm run dev || echo "No dev script — skipping"


echo "Project started successfully in background."
