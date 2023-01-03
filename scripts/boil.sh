#!/usr/bin/env bash

if [ -z "$*" ]; then echo "Replacement argument must be specified."; exit 1; fi

# Replaces instance of the word "boilerplate" with whatever is passed as an arugment
find ./src -type f -exec sed -i '' -e 's/boilerplate/'$1'/g' {} \;
