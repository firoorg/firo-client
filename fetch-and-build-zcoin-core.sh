#!/bin/bash

# @see https://stackoverflow.com/a/246128/520544
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
REPO_NAME=zcoin
REPO_BRANCH=client-api-development
REPO=$DIR/$REPO_NAME-$REPO_BRANCH

NUMBER_OF_PROCESSORS=1
# @link https://stackoverflow.com/a/47594483/520544
CORES=$(grep -c ^processor /proc/cpuinfo 2>/dev/null || sysctl -n hw.ncpu || echo "$NUMBER_OF_PROCESSORS")

echo "- removing previous repo checkout"

if [ -d "$REPO" ]; then
    rm -rf $REPO
fi

# get the repo
echo "- fetching current head of \"$REPO_BRANCH\" branch"
curl -L -o $REPO.tar.gz http://github.com/zcoinofficial/zcoin/archive/$REPO_BRANCH.tar.gz
tar -zxvf $REPO.tar.gz
rm $REPO.tar.gz

# build it
./build-zcoin-core.sh
