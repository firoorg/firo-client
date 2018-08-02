#!/bin/bash

# @see https://stackoverflow.com/a/246128/520544
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
REPO_NAME=zcoin-repo
REPO=$DIR/$REPO_NAME

NUMBER_OF_PROCESSORS=1
# @link https://stackoverflow.com/a/47594483/520544
CORES=$(grep -c ^processor /proc/cpuinfo 2>/dev/null || sysctl -n hw.ncpu || echo "$NUMBER_OF_PROCESSORS")

if [ ! -d "$REPO" ]; then
    # clone the repo
    git clone --branch client-api https://github.com/zcoinofficial/zcoin/ $REPO
fi

cd $REPO
git status
git pull

# compile
./autogen.sh
./configure --with-boost-libdir=/usr/local/Cellar/boost/1.67.0_1/lib/
make -j${CORES}

# copy binaries to gui static folder
cp $REPO/src/zcoind $DIR/static/core
cp $REPO/src/zcoin-cli $DIR/static/core
cp $REPO/src/zcoin-tx $DIR/static/core

ls -lh $DIR/static/core
