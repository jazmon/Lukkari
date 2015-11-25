#!/bin/bash
gulp add-proxy
echo proxy added
gulp clean
echo folder cleaned
gulp release
echo release built
ionic serve
