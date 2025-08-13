#!/bin/bash

# wait-for-it.sh: Wait for a host:port to become available before executing a command.
# Usage: ./wait-for-it.sh <host> <port> <timeout> [-- command args...]

set -e

host="$1"
port="$2"
timeout="${3:-15}" # default timeout to 15 seconds if not specified
shift 3

usage() {
    echo "Usage: $0 <host> <port> <timeout> [-- command args...]"
    exit 1
}

# Validate input
if [[ -z "$host" || -z "$port" || -z "$timeout" ]]; then
    usage
fi

if ! [[ "$port" =~ ^[0-9]+$ && "$timeout" =~ ^[0-9]+$ ]]; then
    echo "❌ Error: Port and timeout must be numeric."
    usage
fi

echo "⏳ Waiting for $host:$port (timeout: ${timeout}s)..."

# Try to connect using /dev/tcp (bash built-in)
for ((i = 1; i <= timeout; i++)); do
    if (echo > /dev/tcp/"$host"/"$port") > /dev/null 2>&1; then
        echo "✅ $host:$port is available!"
        if [[ $# -gt 0 ]]; then
            exec "$@"
        fi
        exit 0
    fi
    sleep 1
done

echo "❌ Timeout after $timeout seconds while waiting for $host:$port"
exit 1
