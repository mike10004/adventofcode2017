#!/bin/bash

INPUT=$1

if [ -z "$INPUT" ] ; then
  echo "specify input file as first argument" >&2
  exit 1
fi

MAX_DELAY=$2
if [ -z "${MAX_DELAY}" ] ; then
  MAX_DELAY=16
fi

BIN="bin/packetscanners.c"

gcc -o "$BIN" packetscanners.c || exit $?

for DELAY in $(seq 0 "${MAX_DELAY}") ; do
    echo "$BIN $DELAY < $INPUT"
    "$BIN" "$DELAY" < "$INPUT" 2>/dev/null 1> /dev/null
    CODE=$?
    if [ $CODE -eq 0 ] ; then
      echo "successful delay: $DELAY"
      exit 0
    fi
done

echo "tried $MAX_DELAY delays without success" >&2
