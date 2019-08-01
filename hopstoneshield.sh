#!/bin/bash

user=$USER
cpu=1

function cleanup() {
  sudo sh -c "cset shield --reset"
}

trap cleanup EXIT

echo "Executing shielded hopstone..."

sudo sh -c "cset shield --cpu $cpu"
sudo sh -c "cset set -l"
sudo sh -c "/bin/su -l $user -c /bin/bash -c \"cd $PWD; ./hopstone.sh $*\""
