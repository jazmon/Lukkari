#!/bin/bash
gulp add-proxy
echo Proxy added.
gulp clean
echo Folder cleaned.
gulp release
echo Release files built.
gulp serve
echo You may also want to run 'gulp watch' if you want to livereload.
