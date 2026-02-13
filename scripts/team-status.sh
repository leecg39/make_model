#!/bin/bash
# Make Model - Team Status Monitor
# Shows the status of all agent windows in the tmux session

SESSION="make-model-team"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════╗"
echo "║          Make Model - Team Status            ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if session exists
if ! tmux has-session -t "$SESSION" 2>/dev/null; then
    echo -e "${RED}No active team session found.${NC}"
    echo "Run: ./scripts/start-team.sh"
    exit 1
fi

echo -e "${GREEN}Session: $SESSION${NC}"
echo ""

# List windows with their status
echo "┌──────┬────────────────────────┬──────────┐"
echo "│  #   │ Agent                  │ Status   │"
echo "├──────┼────────────────────────┼──────────┤"

tmux list-windows -t "$SESSION" -F "#{window_index}|#{window_name}|#{window_active}" | while IFS='|' read -r index name active; do
    if [ "$active" = "1" ]; then
        status="${GREEN}active${NC}  "
    else
        status="${YELLOW}idle${NC}    "
    fi
    printf "│  %-3s │ %-22s │ ${status} │\n" "$index" "$name"
done

echo "└──────┴────────────────────────┴──────────┘"
echo ""

# Project stats
echo -e "${CYAN}Project Stats:${NC}"
echo "  Backend tests:  $(cd /Users/user01/Desktop/make_model && grep -r "def test_" backend/tests/ 2>/dev/null | wc -l | tr -d ' ') functions"
echo "  Frontend tests: $(cd /Users/user01/Desktop/make_model && grep -r "it\('" frontend/src/__tests__/ 2>/dev/null | wc -l | tr -d ' ') specs"
echo "  Git branch:     $(cd /Users/user01/Desktop/make_model && git branch --show-current 2>/dev/null)"
echo ""
echo "Quick commands:"
echo "  tmux attach -t $SESSION          # Attach to session"
echo "  ./scripts/start-team.sh stop     # Stop all agents"
