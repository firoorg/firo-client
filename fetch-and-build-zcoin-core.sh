#!/bin/bash

# @see https://stackoverflow.com/a/246128/520544
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
REPO_NAME=zcoin-repo
REPO=$DIR/$REPO_NAME

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
make

# move to gui assets
ls -lh

cp $REPO/src/zcoind $DIR/static/core
cp $REPO/src/zcoin-cli $DIR/static/core
cp $REPO/src/zcoin-tx $DIR/static/core
