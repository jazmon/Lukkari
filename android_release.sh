#!/bin/bash

# This script will build a release version for android.


# removes proxy if found (for browser testing)
gulp remove-proxy
# clean the dist folder 
# (just in case, release sometimes fucks up with folder permissions)
gulp clean
# builds the code
gulp release
# run cordova build
cordova build --release android

# sign the apk
#  G:\Dev\Code\Web\lukkari\platforms\android\build\outputs\apk\android-release-unsigned.apk
# /g/Dev/Code/Web/lukkari/platforms/android/build/outputs/apk/android-release-unsigned.apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "/g/Google Drive/atte_huhtakangas.keystore" /g/Dev/Code/Web/lukkari/platforms/android/build/outputs/apk/android-release-unsigned.apk atte_key

# optimize the apk
zipalign -v 4 /g/Dev/Code/Web/lukkari/platforms/android/build/outputs/apk/android-release-unsigned.apk lukkari.apk
