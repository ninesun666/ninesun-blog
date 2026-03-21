#!/usr/bin/env python3
"""
Investigation script for T001.
Checks for existing Pull Requests for a specific branch.
"""

import subprocess
import json
import sys

# Configuration from task context
REPO_PATH = "/app/repos/ninesun666/ninesun-blog"
BRANCH_NAME = "feat/issue-117-manual-review-required-failed-to-process-issue-115"

def run_gh_command(args):
    """Run a gh CLI command and return JSON output."""
    cmd = ["gh"] + args
    try:
        result = subprocess.run(
            cmd,
            cwd=REPO_PATH,
            capture_output=True,
            text=True,
            check=True
        )
        return json.loads(result.stdout) if result.stdout else []
    except subprocess.CalledProcessError as e:
        print(f"Error running gh command: {e}", file=sys.stderr)
        print(f"Stderr: {e.stderr}", file=sys.stderr)
        return None
    except json.JSONDecodeError:
        print("Failed to parse JSON output", file=sys.stderr)
        return None

def investigate_pr():
    """Main investigation logic."""
    print(f"Investigating PRs for branch: {BRANCH_NAME}")
    print("-" * 50)
    
    # Check for PRs associated with the branch
    # Using 'gh pr list' with --head flag to filter by branch
    pr_list = run_gh_command([
        "pr", "list",
        "--head", BRANCH_NAME,
        "--state", "all",  # Check open and closed PRs
        "--json", "number,title,state,url,createdAt,author"
    ])

    if pr_list is None:
        print("Failed to retrieve PR information.")
        return False

    if not pr_list:
        print("No existing PRs found for this branch.")
        print("Recommendation: Safe to create a new PR.")
        return True

    print(f"Found {len(pr_list)} PR(s) for this branch:\n")
    
    for pr in pr_list:
        print(f"PR #{pr.get('number')}")
        print(f"  Title: {pr.get('title')}")
        print(f"  State: {pr.get('state')}")
        print(f"  Author: {pr.get('author', {}).get('login', 'Unknown')}")
        print(f"  Created: {pr.get('createdAt')}")
        print(f"  URL: {pr.get('url')}")
        print("")

    # Analysis for T001 report
    open_prs = [pr for pr in pr_list if pr['state'] == 'OPEN']
    if open_prs:
        print("ACTION REQUIRED:")
        print("An open PR already exists for this branch.")
        print("1. Review the existing PR content.")
        print("2. If valid, continue work on this PR.")
        print("3. If invalid/duplicate, close it before creating a new one.")
    else:
        print("No open PRs found. Only closed/merged PRs exist.")
        print("Recommendation: Verify if the branch is still relevant before creating a new PR.")

    return True

if __name__ == "__main__":
    investigate_pr()
