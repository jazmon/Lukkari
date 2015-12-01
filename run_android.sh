#!/bin/bash
gulp remove-proxy
# copy scripts for the bundle.js
gulp scripts
ionic run -cs android
