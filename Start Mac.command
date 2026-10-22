#!/bin/bash
cd "$(dirname "$0")" || exit 1
if command -v python3 >/dev/null 2>&1; then
    python3 serve.py
else
    echo "Install Python 3 from python.org, then open this file again."
    echo "You can also try opening index.html directly in Chrome."
    read -r -p "Press Enter to close."
fi
