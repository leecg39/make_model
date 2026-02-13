#!/bin/bash
# Make Model - Agent Team tmux Launcher
# Usage: ./scripts/start-team.sh [all|dev|ops|design]

set -e

SESSION="make-model-team"
PROJECT_DIR="/Users/user01/Desktop/make_model"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════╗"
    echo "║     Make Model - Agent Team Launcher         ║"
    echo "║     8 Agents | 3 Teams | tmux               ║"
    echo "╚══════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Kill existing session if running
kill_session() {
    tmux kill-session -t "$SESSION" 2>/dev/null || true
}

# Create a window with an agent
create_agent_window() {
    local window_name="$1"
    local agent_prompt="$2"
    local window_index="$3"

    if [ "$window_index" -eq 0 ]; then
        tmux rename-window -t "$SESSION:0" "$window_name"
    else
        tmux new-window -t "$SESSION" -n "$window_name"
    fi

    tmux send-keys -t "$SESSION:$window_name" "cd $PROJECT_DIR" C-m
    tmux send-keys -t "$SESSION:$window_name" "claude --agent $window_name" C-m
    sleep 1
}

# Launch development team (backend + frontend + database)
launch_dev_team() {
    echo -e "${GREEN}[DEV] Launching Development Team...${NC}"
    create_agent_window "backend-specialist" "Backend API development" "$1"
    create_agent_window "frontend-specialist" "Frontend component development" "$(($1 + 1))"
    create_agent_window "database-specialist" "Database schema & queries" "$(($1 + 2))"
    echo -e "${GREEN}[DEV] 3 agents ready${NC}"
}

# Launch ops team (qa + security + performance + devops)
launch_ops_team() {
    echo -e "${YELLOW}[OPS] Launching Operations Team...${NC}"
    create_agent_window "qa-engineer" "QA & E2E testing" "$1"
    create_agent_window "security-specialist" "Security audit & scanning" "$(($1 + 1))"
    create_agent_window "performance-optimizer" "Performance optimization" "$(($1 + 2))"
    create_agent_window "devops-specialist" "CI/CD & deployment" "$(($1 + 3))"
    echo -e "${YELLOW}[OPS] 4 agents ready${NC}"
}

# Launch design team (ui-designer)
launch_design_team() {
    echo -e "${CYAN}[DESIGN] Launching Design Team...${NC}"
    create_agent_window "ui-designer" "UI/UX design with Pencil MCP" "$1"
    echo -e "${CYAN}[DESIGN] 1 agent ready${NC}"
}

# Create orchestrator window (monitoring dashboard)
launch_orchestrator() {
    tmux new-window -t "$SESSION" -n "orchestrator"
    tmux send-keys -t "$SESSION:orchestrator" "cd $PROJECT_DIR" C-m
    tmux send-keys -t "$SESSION:orchestrator" "echo '=== Make Model Orchestrator ===' && echo '' && echo 'Available commands:' && echo '  claude               - Start orchestrator' && echo '  ./scripts/team-status.sh - Check team status' && echo '' && echo 'Agent windows: (Ctrl-b + w to list)' && echo '  0: backend-specialist' && echo '  1: frontend-specialist' && echo '  2: database-specialist' && echo '  3: qa-engineer' && echo '  4: security-specialist' && echo '  5: performance-optimizer' && echo '  6: devops-specialist' && echo '  7: ui-designer' && echo '  8: orchestrator (this window)'" C-m
}

# Main
print_header

MODE="${1:-all}"

case "$MODE" in
    all)
        echo -e "Launching ${GREEN}ALL${NC} teams (8 agents)..."
        kill_session
        tmux new-session -d -s "$SESSION" -x 200 -y 50
        launch_dev_team 0
        launch_ops_team 3
        launch_design_team 7
        launch_orchestrator
        ;;
    dev)
        echo -e "Launching ${GREEN}DEV${NC} team (3 agents)..."
        kill_session
        tmux new-session -d -s "$SESSION" -x 200 -y 50
        launch_dev_team 0
        launch_orchestrator
        ;;
    ops)
        echo -e "Launching ${YELLOW}OPS${NC} team (4 agents)..."
        kill_session
        tmux new-session -d -s "$SESSION" -x 200 -y 50
        launch_ops_team 0
        launch_orchestrator
        ;;
    design)
        echo -e "Launching ${CYAN}DESIGN${NC} team (1 agent)..."
        kill_session
        tmux new-session -d -s "$SESSION" -x 200 -y 50
        launch_design_team 0
        launch_orchestrator
        ;;
    stop)
        echo -e "${RED}Stopping team session...${NC}"
        kill_session
        echo -e "${GREEN}Session stopped.${NC}"
        exit 0
        ;;
    *)
        echo "Usage: $0 [all|dev|ops|design|stop]"
        echo ""
        echo "  all     - Launch all 8 agents (default)"
        echo "  dev     - Backend + Frontend + Database (3)"
        echo "  ops     - QA + Security + Performance + DevOps (4)"
        echo "  design  - UI Designer (1)"
        echo "  stop    - Kill team session"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Team session ready!${NC}"
echo ""
echo "tmux shortcuts:"
echo "  Ctrl-b w     : List all windows"
echo "  Ctrl-b n/p   : Next/Previous window"
echo "  Ctrl-b 0-8   : Jump to window by number"
echo "  Ctrl-b d     : Detach (keeps running)"
echo "  tmux attach -t $SESSION : Reattach"
echo ""

# Attach to session
tmux select-window -t "$SESSION:orchestrator"
tmux attach-session -t "$SESSION"
