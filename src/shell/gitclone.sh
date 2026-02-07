#!/bin/bash

REPO_URL=$1
TARGET_DIR="/tmp"

mkdir -p "$TARGET_DIR"

cd "$TARGET_DIR" || exit

git clone "$REPO_URL"
