#!/usr/bin/env sh
# Raises file descriptor limit to avoid EMFILE (too many open files) on macOS, then starts Next.js dev server.
ulimit -n 65536 2>/dev/null || true
exec npx next dev --hostname 0.0.0.0
