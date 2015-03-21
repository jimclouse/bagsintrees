#! /usr/bin/env bash
# vim: set ft=shell

source ~/.nvm/nvm.sh
nvm use 0.10.36

source ./etc/environment
node ./lib/localFetch.js