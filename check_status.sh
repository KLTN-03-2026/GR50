#!/bin/bash

# Quick Status Check Script for MediSchedule

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=================================="
echo "📊 MediSchedule Status Check"
echo "=================================="
echo ""

# Check Services
echo "🔧 Services Status:"
echo "-------------------"

if sudo supervisorctl status backend | grep -q "RUNNING"; then
    echo -e "${GREEN}✓${NC} Backend:  RUNNING"
else
    echo -e "${RED}✗${NC} Backend:  NOT RUNNING"
fi

if sudo supervisorctl status frontend | grep -q "RUNNING"; then
    echo -e "${GREEN}✓${NC} Frontend: RUNNING"
else
    echo -e "${RED}✗${NC} Frontend: NOT RUNNING"
fi

if service mariadb status > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MySQL:    RUNNING"
else
    echo -e "${RED}✗${NC} MySQL:    NOT RUNNING"
fi

# Check Database
echo ""
echo "💾 Database Status:"
echo "-------------------"
if mysql -u root -p190705 -e "USE medischedule;" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Database: Connected"
    
    # Count records
    USER_COUNT=$(mysql -u root -p190705 medischedule -se "SELECT COUNT(*) FROM users;" 2>/dev/null)
    SPECIALTY_COUNT=$(mysql -u root -p190705 medischedule -se "SELECT COUNT(*) FROM specialties;" 2>/dev/null)
    
    echo "   Users:       $USER_COUNT"
    echo "   Specialties: $SPECIALTY_COUNT"
else
    echo -e "${RED}✗${NC} Database: NOT Connected"
fi

# Check Backend API
echo ""
echo "🌐 Backend API:"
echo "-------------------"
HEALTH=$(curl -s http://localhost:8001/api/health 2>/dev/null || echo "{}")
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} API Health: OK"
    echo "   $HEALTH"
else
    echo -e "${RED}✗${NC} API Health: NOT OK"
fi

# Check Frontend
echo ""
echo "🎨 Frontend:"
echo "-------------------"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend: Accessible on http://localhost:3000"
else
    echo -e "${RED}✗${NC} Frontend: NOT Accessible"
fi

# Recent Errors
echo ""
echo "📋 Recent Errors (Last 5 lines):"
echo "-------------------"
echo -e "${YELLOW}Backend:${NC}"
tail -n 5 /var/log/supervisor/backend.err.log 2>/dev/null | grep -i error || echo "   No recent errors"

echo ""
echo -e "${YELLOW}Frontend:${NC}"
tail -n 5 /var/log/supervisor/frontend.err.log 2>/dev/null | grep -i error || echo "   No recent errors"

# Quick Actions
echo ""
echo "=================================="
echo "🚀 Quick Actions:"
echo "=================================="
echo "   Fix issues:    /app/auto_fix.sh"
echo "   Restart all:   sudo supervisorctl restart all"
echo "   Backend logs:  tail -f /var/log/supervisor/backend.err.log"
echo "   Frontend logs: tail -f /var/log/supervisor/frontend.out.log"
echo ""
