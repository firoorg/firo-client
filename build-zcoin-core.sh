#!/bin/bash

# @see https://stackoverflow.com/a/246128/520544
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
REPO_NAME=zcoin
REPO_BRANCH=client-api-development
REPO=$DIR/$REPO_NAME-$REPO_BRANCH

NUMBER_OF_PROCESSORS=1
# @link https://stackoverflow.com/a/47594483/520544
CORES=$(grep -c ^processor /proc/cpuinfo 2>/dev/null || sysctl -n hw.ncpu || echo "$NUMBER_OF_PROCESSORS")

cd $REPO

# compile
echo "- compiling \"$REPO_BRANCH\" branch with $CORES cores"
./autogen.sh
#./configure --with-boost-libdir=/usr/local/Cellar/boost/1.67.0_1/lib/
./configure
make -j${CORES}

# copy binaries to gui assets folder
echo "- copying binaries to assets folder"
mkdir -p $DIR/assets/core/darwin
cp $REPO/src/zcoind $DIR/assets/core/darwin
cp $REPO/src/zcoin-cli $DIR/assets/core/darwin
cp $REPO/src/zcoin-tx $DIR/assets/core/darwin

ls -lh $DIR/assets/core/darwin
