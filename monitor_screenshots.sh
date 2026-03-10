#!/bin/bash
# Screenshot Monitor - Alerts if too many screenshots created

WATCH_DIR="$HOME/Downloads/New List"
ALERT_THRESHOLD=5

while true; do
    RECENT_COUNT=$(find "$WATCH_DIR" -name "*Screenshot*" -newermt "1 minute ago" | wc -l)
    
    if [ $RECENT_COUNT -gt $ALERT_THRESHOLD ]; then
        echo "🚨 SCREENSHOT SPAM DETECTED: $RECENT_COUNT screenshots in last minute!"
        osascript -e "display notification \"$RECENT_COUNT screenshots created!\" with title \"Screenshot Spam Alert\""
        
        # Auto-cleanup
        find "$WATCH_DIR" -name "*Screenshot*" -newermt "1 minute ago" -exec trash {} \;
        echo "✅ Auto-cleaned spam screenshots"
    fi
    
    sleep 30
done