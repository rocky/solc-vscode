#!/bin/bash
set -x
# Hacky way to remove everything for a fresh start
rm -fr {.,client,server}/node-modules
rm -fr {client,server}/out
