#!/bin/bash
# Screenshot Cleanup Script

echo "🧹 CLEANING UP DUPLICATE SCREENSHOTS"
echo "====================================="

# Count current screenshots
DESKTOP_SHOTS=$(find ~/Desktop -name "*Screenshot*2026-02-22*" -type f | wc -l)
DOWNLOADS_SHOTS=$(find ~/Downloads -name "*Screenshot*2026-02-22*" -type f | wc -l)

echo "📊 Found:"
echo "   Desktop: $DESKTOP_SHOTS screenshots"
echo "   Downloads: $DOWNLOADS_SHOTS screenshots"

# Move duplicates to trash (safer than delete)
echo ""
echo "🗑️  Moving duplicates to trash..."

# Desktop cleanup
find ~/Desktop -name "*Screenshot*2026-02-22*4.2*.PM*" -type f -exec trash {} \; 2>/dev/null

# Downloads cleanup  
find ~/Downloads -name "*Screenshot*2026-02-22*4.2*.PM*" -type f -exec trash {} \; 2>/dev/null

# Count remaining
REMAINING_DESKTOP=$(find ~/Desktop -name "*Screenshot*2026-02-22*" -type f | wc -l)
REMAINING_DOWNLOADS=$(find ~/Downloads -name "*Screenshot*2026-02-22*" -type f | wc -l)

echo "✅ Cleanup complete!"
echo "📊 Remaining:"
echo "   Desktop: $REMAINING_DESKTOP screenshots"
echo "   Downloads: $REMAINING_DOWNLOADS screenshots"
echo ""
echo "💡 All duplicates moved to trash (recoverable if needed)"