#!/usr/bin/env python3
"""
Investigation script for issue #117 and related PR.
This script queries GitHub API to investigate the existing PR status.
"""

import os
import json
import subprocess
import sys
from datetime import datetime

# Configuration
REPO_OWNER = "ninesun666"
REPO_NAME = "ninesun-blog"
BRANCH_NAME = "feat/issue-117-manual-review-required-failed-to-process-issue-115"
ISSUE_NUMBER = 117
RELATED_ISSUE = 115

def run_gh_command(args):
    """Run a GitHub CLI command and return the output."""
    try:
        result = subprocess.run(
            ["gh"] + args,
            capture_output=True,
            text=True,
            check=True
        )
        return json.loads(result.stdout) if result.stdout.strip() else None
    except subprocess.CalledProcessError as e:
        print(f"Error running gh command: {e.stderr}")
        return None
    except json.JSONDecodeError:
        return {"raw_output": result.stdout}

def investigate_pr():
    """Main investigation function."""
    print("=" * 60)
    print(f"PR Investigation Report - {datetime.now().isoformat()}")
    print("=" * 60)
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "branch": BRANCH_NAME,
        "issue": ISSUE_NUMBER,
        "findings": {}
    }
    
    # 1. Check for existing PRs on the branch
    print(f"\n[1] Searching for PRs on branch: {BRANCH_NAME}")
    prs = run_gh_command([
        "pr", "list",
        "--repo", f"{REPO_OWNER}/{REPO_NAME}",
        "--head", BRANCH_NAME,
        "--state", "all",
        "--json", "number,title,state,url,createdAt,mergedAt,closedAt,author"
    ])
    
    if prs:
        results["findings"]["existing_prs"] = prs
        print(f"  Found {len(prs)} PR(s):")
        for pr in prs:
            print(f"    - PR #{pr.get('number')}: {pr.get('title')}")
            print(f"      State: {pr.get('state')}")
            print(f"      URL: {pr.get('url')}")
            print(f"      Created: {pr.get('createdAt')}")
            if pr.get('mergedAt'):
                print(f"      Merged: {pr.get('mergedAt')}")
            if pr.get('closedAt'):
                print(f"      Closed: {pr.get('closedAt')}")
    else:
        print("  No existing PRs found on this branch.")
        results["findings"]["existing_prs"] = []
    
    # 2. Check issue #117 details
    print(f"\n[2] Fetching issue #{ISSUE_NUMBER} details")
    issue = run_gh_command([
        "issue", "view", str(ISSUE_NUMBER),
        "--repo", f"{REPO_OWNER}/{REPO_NAME}",
        "--json", "number,title,state,body,labels,createdAt,closedAt"
    ])
    
    if issue:
        results["findings"]["issue_117"] = issue
        print(f"  Title: {issue.get('title')}")
        print(f"  State: {issue.get('state')}")
        print(f"  Labels: {[l.get('name') for l in issue.get('labels', [])]}")
        print(f"  Created: {issue.get('createdAt')}")
        if issue.get('closedAt'):
            print(f"  Closed: {issue.get('closedAt')}")
    else:
        print("  Could not fetch issue details.")
    
    # 3. Check related issue #115
    print(f"\n[3] Fetching related issue #{RELATED_ISSUE} details")
    related_issue = run_gh_command([
        "issue", "view", str(RELATED_ISSUE),
        "--repo", f"{REPO_OWNER}/{REPO_NAME}",
        "--json", "number,title,state,body,labels,createdAt,closedAt"
    ])
    
    if related_issue:
        results["findings"]["issue_115"] = related_issue
        print(f"  Title: {related_issue.get('title')}")
        print(f"  State: {related_issue.get('state')}")
        print(f"  Labels: {[l.get('name') for l in related_issue.get('labels', [])]}")
    else:
        print("  Could not fetch related issue details.")
    
    # 4. Check if branch exists locally and remotely
    print(f"\n[4] Checking branch existence")
    try:
        # Check remote branch
        remote_check = subprocess.run(
            ["git", "ls-remote", "--heads", "origin", BRANCH_NAME],
            capture_output=True,
            text=True
        )
        if remote_check.stdout.strip():
            print(f"  Branch exists on remote: {BRANCH_NAME}")
            results["findings"]["branch_on_remote"] = True
        else:
            print(f"  Branch does NOT exist on remote: {BRANCH_NAME}")
            results["findings"]["branch_on_remote"] = False
    except Exception as e:
        print(f"  Could not check remote branch: {e}")
        results["findings"]["branch_on_remote"] = "unknown"
    
    # 5. Generate recommendations
    print("\n" + "=" * 60)
    print("RECOMMENDATIONS")
    print("=" * 60)
    
    recommendations = []
    
    if not results["findings"].get("existing_prs"):
        recommendations.append("No existing PR found. A new PR may need to be created.")
    else:
        prs_list = results["findings"]["existing_prs"]
        open_prs = [p for p in prs_list if p.get('state') == 'OPEN']
        if open_prs:
            recommendations.append(f"Found {len(open_prs)} open PR(s). Review and determine if they properly address the issue.")
        else:
            recommendations.append("All PRs on this branch are closed/merged. May need to create a new PR or close the issue.")
    
    if results["findings"].get("issue_117", {}).get("state") == "closed":
        recommendations.append("Issue #117 is already closed. Verify if it was properly resolved.")
    
    results["recommendations"] = recommendations
    
    for i, rec in enumerate(recommendations, 1):
        print(f"  {i}. {rec}")
    
    # Save results
    output_file = ".agent-harness/investigation_results.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\nResults saved to: {output_file}")
    
    return results

if __name__ == "__main__":
    investigate_pr()
