#!/usr/bin/env python3
"""
Investigation Script for Task T001
Locates and reviews the existing pull request for branch 'feat/issue-115-'.
"""

import subprocess
import json
import os
import sys

def run_gh_command(args):
    """Run a gh CLI command and return JSON output."""
    cmd = ["gh"] + args
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return json.loads(result.stdout) if result.stdout else []
    except subprocess.CalledProcessError as e:
        print(f"Error running command {' '.join(cmd)}: {e.stderr}", file=sys.stderr)
        return None
    except json.JSONDecodeError:
        print(f"Failed to parse JSON output from gh command.", file=sys.stderr)
        return None
    except FileNotFoundError:
        print("GitHub CLI (gh) not found. Please install it to run this script.", file=sys.stderr)
        return None

def investigate_pr(branch_name):
    """Investigate PR for a specific branch."""
    print(f"Investigating PR for branch: {branch_name}")
    
    # Search for PR with the specific head branch
    pr_list = run_gh_command([
        "pr", "list", 
        "--head", branch_name, 
        "--json", "number,title,state,url,body,author,createdAt,headRefName",
        "--state", "all"  # Check open, closed, and merged PRs
    ])
    
    findings = {
        "task_id": "T001",
        "branch_name": branch_name,
        "pr_found": False,
        "pr_details": None,
        "status": None,
        "issues": []
    }
    
    if pr_list is None:
        findings["status"] = "error"
        findings["issues"].append("Failed to query GitHub API")
        return findings
    
    if not pr_list:
        findings["status"] = "no_pr_found"
        findings["issues"].append(f"No PR found for branch {branch_name}")
        print(f"No PR found for branch {branch_name}")
        return findings
    
    # Process found PRs (usually just one per branch)
    pr = pr_list[0]
    findings["pr_found"] = True
    findings["pr_details"] = pr
    findings["status"] = pr.get("state", "unknown")
    
    print(f"Found PR #{pr['number']}: {pr['title']}")
    print(f"State: {pr['state']}")
    print(f"URL: {pr['url']}")
    
    # Check for potential issues
    if pr['state'] == 'CLOSED':
        findings["issues"].append("PR is closed")
    if not pr.get('body'):
        findings["issues"].append("PR body is empty")
    
    return findings

def main():
    # Target branch from task description
    branch_name = "feat/issue-115-"
    
    findings = investigate_pr(branch_name)
    
    # Ensure report directory exists
    report_dir = ".agent-harness/reports"
    os.makedirs(report_dir, exist_ok=True)
    
    # Save findings
    report_path = os.path.join(report_dir, "T001_findings.json")
    with open(report_path, "w") as f:
        json.dump(findings, f, indent=2)
    
    print(f"\nFindings saved to {report_path}")
    
    # Return exit code based on findings
    if findings["pr_found"] and findings["status"] == "OPEN":
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
