node electron-vue/build.js
electron-builder build -mwl

version="$(grep version package.json | cut -d'"' -f4)"
commitId="$(git log --format=%h -1)"
mv "build/Firo Client Setup $version.exe" "build/FiroClientSetup-$version-$commitId.exe"
mv "build/Firo Client-$version.AppImage" "build/FiroClient-$version-$commitId.AppImage"
mv "build/Firo Client-$version.dmg" "build/FiroClient-$version-$commitId.dmg"

rm -rf build/*.blockmap build/*.yaml build/*.yml build/*.snap build/*.zip build/mac build/linux-unpacked build/win-unpacked
