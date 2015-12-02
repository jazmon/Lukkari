#!/bin/bash
gulp add-proxy
echo proxy added
gulp clean
echo folder cleaned
gulp release
echo release built
gulp serve
echo Server started..
echo remember to also start gulp watch!
