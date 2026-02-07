#!/bin/bash

REPO_URL=$1
TARGET_DIR=$2

echo "Cloning repo..."

mkdir -p "$TARGET_DIR"

git clone "$REPO_URL" "$TARGET_DIR"
