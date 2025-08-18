#!/usr/bin/env bash
#   Use this script to test if a given TCP host/port are available
#   Source: https://github.com/vishnubob/wait-for-it

set -e

HOST="$1"
PORT="$2"
TIMEOUT="${3:-15}"

if [ -z "$HOST" ] || [ -z "$PORT" ]; then
  echo "Usage: $0 host port [timeout]"
  exit 1
fi

for i in $(seq 1 "$TIMEOUT"); do
  nc -z "$HOST" "$PORT" && exit 0
  sleep 1
done

exit 1
