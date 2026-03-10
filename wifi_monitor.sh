#!/bin/bash
# WiFi Connection Monitor for ESA Office Mac Air

LOG_FILE="$HOME/wifi_connection_log.txt"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "=== WiFi Monitor Started at $TIMESTAMP ===" >> "$LOG_FILE"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Test connectivity
    if fping -c 1 8.8.8.8 > /dev/null 2>&1; then
        echo "$TIMESTAMP - WiFi OK" >> "$LOG_FILE"
    else
        echo "$TIMESTAMP - WiFi DISCONNECTED ⚠️" >> "$LOG_FILE"
        
        # Try to reconnect (optional)
        # networksetup -setairportpower en0 off
        # sleep 2
        # networksetup -setairportpower en0 on
    fi
    
    # Check every 30 seconds
    sleep 30
done