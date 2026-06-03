#!/usr/bin/env bash
# Copy pack tarball to /var/lib/robotico/robotico-registry/npm (no HTTP publish).
exec bash "$(cd "$(dirname "$0")" && pwd)/copy-npm-package-to-metal-storage.sh"
