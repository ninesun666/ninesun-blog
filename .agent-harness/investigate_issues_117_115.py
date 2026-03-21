#!/usr/bin/env python3
"""
Investigation script for Issue #117 and related Issue #115
Task T002: Review original issue #117 and related issue #115
"""

import os
import sys
import json
import subprocess
from datetime import datetime

# Configuration
REPO_PATH = "/app/repos/ninesun666/ninesun-blog"
REPO_OWNER = "ninesun666"
REPO_NAME = "ninesun-blog"
ISSUE_117_NUMBER = 117
ISSUE_115_NUMBER = 115

def run_gh_command(args):
    """Run a GitHub CLI command and return the output."""
    try:
        result = subprocess.run(
            ["gh"] + args,
            capture_output=True,
            text=True,
            cwd=REPO_PATH,
            timeout=30
        )
        if result.returncode == 0:
            try:
                return json.loads(result.stdout) if result.stdout.strip() else None
            except json.JSONDecodeError:
                return {"raw": result.stdout}
        else:
            return {"error": result.stderr, "returncode": result.returncode}
    except subprocess.TimeoutExpired:
        return {"error": "Command timed out"}
    except FileNotFoundError:
        return {"error": "gh CLI not found"}
    except Exception as e:
        return {"error": str(e)}

def get_issue_details(issue_number):
    """Get detailed information about an issue."""
    issue = run_gh_command([
        "api",
        f"repos/{REPO_OWNER}/{REPO_NAME}/issues/{issue_number}"
    ])
    return issue

def get_issue_comments(issue_number):
    """Get comments for an issue."""
    comments = run_gh_command([
        "api",
        f"repos/{REPO_OWNER}/{REPO_NAME}/issues/{issue_number}/comments"
    ])
    return comments

def get_linked_prs(issue_number):
    """Get linked PRs for an issue."""
    # This is a simplified check - in reality, linked PRs might require
    # parsing the issue body or using timeline events
    return None

def analyze_issue(issue_data, issue_number):
    """Analyze issue data and extract key information."""
    if "error" in issue_data:
        return {
            "number": issue_number,
            "status": "error",
            "error": issue_data["error"]
        }
    
    analysis = {
        "number": issue_number,
        "title": issue_data.get("title", "N/A"),
        "state": issue_data.get("state", "N/A"),
        "created_at": issue_data.get("created_at", "N/A"),
        "updated_at": issue_data.get("updated_at", "N/A"),
        "author": issue_data.get("user", {}).get("login", "N/A"),
        "labels": [l.get("name") for l in issue_data.get("labels", [])],
        "assignees": [a.get("login") for a in issue_data.get("assignees", [])],
        "body": issue_data.get("body", ""),
        "comments_count": issue_data.get("comments", 0),
        "html_url": issue_data.get("html_url", "N/A")
    }
    
    return analysis

def extract_requirements(issue_body):
    """Extract potential requirements from issue body."""
    requirements = []
    if not issue_body:
        return requirements
    
    lines = issue_body.split("\n")
    for line in lines:
        line = line.strip()
        if line.startswith("- [ ]") or line.startswith("- [x]"):
            requirements.append(line)
        elif line.startswith("*") or line.startswith("-"):
            requirements.append(line)
    
    return requirements

def main():
    print("=" * 60)
    print(f"Investigation Report: Issue #117 and #115")
    print(f"Generated: {datetime.now().isoformat()}")
    print("=" * 60)
    
    investigation_results = {
        "timestamp": datetime.now().isoformat(),
        "issues": {},
        "analysis": {}
    }
    
    # Get Issue #117 details
    print("\n[1] Fetching Issue #117...")
    issue_117 = get_issue_details(ISSUE_117_NUMBER)
    analysis_117 = analyze_issue(issue_117, ISSUE_117_NUMBER)
    investigation_results["issues"]["117"] = analysis_117
    
    print(f"    Title: {analysis_117.get('title', 'N/A')}")
    print(f"    State: {analysis_117.get('state', 'N/A')}")
    print(f"    Author: {analysis_117.get('author', 'N/A')}")
    print(f"    Labels: {analysis_117.get('labels', [])}")
    print(f"    URL: {analysis_117.get('html_url', 'N/A')}")
    
    # Get Issue #115 details
    print("\n[2] Fetching Issue #115...")
    issue_115 = get_issue_details(ISSUE_115_NUMBER)
    analysis_115 = analyze_issue(issue_115, ISSUE_115_NUMBER)
    investigation_results["issues"]["115"] = analysis_115
    
    print(f"    Title: {analysis_115.get('title', 'N/A')}")
    print(f"    State: {analysis_115.get('state', 'N/A')}")
    print(f"    Author: {analysis_115.get('author', 'N/A')}")
    print(f"    Labels: {analysis_115.get('labels', [])}")
    print(f"    URL: {analysis_115.get('html_url', 'N/A')}")
    
    # Extract requirements from both issues
    print("\n[3] Extracting Requirements...")
    
    reqs_117 = extract_requirements(analysis_117.get("body", ""))
    reqs_115 = extract_requirements(analysis_115.get("body", ""))
    
    investigation_results["analysis"]["requirements_117"] = reqs_117
    investigation_results["analysis"]["requirements_115"] = reqs_115
    
    print(f"    Issue #117 requirements found: {len(reqs_117)}")
    for req in reqs_117[:5]:  # Show first 5
        print(f"      - {req[:60]}..." if len(req) > 60 else f"      - {req}")
    
    print(f"    Issue #115 requirements found: {len(reqs_115)}")
    for req in reqs_115[:5]:  # Show first 5
        print(f"      - {req[:60]}..." if len(req) > 60 else f"      - {req}")
    
    # Check relationship between issues
    print("\n[4] Analyzing Issue Relationship...")
    
    body_117 = analysis_117.get("body", "")
    body_115 = analysis_115.get("body", "")
    
    relationship = {
        "117_references_115": "#115" in body_117 or "issue/115" in body_117,
        "115_references_117": "#117" in body_115 or "issue/117" in body_115,
        "same_author": analysis_117.get("author") == analysis_115.get("author")
    }
    
    investigation_results["analysis"]["relationship"] = relationship
    
    print(f"    Issue #117 references #115: {relationship['117_references_115']}")
    print(f"    Issue #115 references #117: {relationship['115_references_117']}")
    print(f"    Same author: {relationship['same_author']}")
    
    # Determine current status
    print("\n[5] Current Status Summary...")
    
    status_summary = {
        "issue_117_state": analysis_117.get("state", "unknown"),
        "issue_115_state": analysis_115.get("state", "unknown"),
        "needs_manual_review": False,
        "action_required": []
    }
    
    if analysis_117.get("state") == "open":
        status_summary["action_required"].append("Issue #117 is still open - needs resolution")
    
    if analysis_115.get("state") == "open":
        status_summary["action_required"].append("Issue #115 is still open - needs resolution")
    
    if relationship["117_references_115"]:
        status_summary["action_required"].append("Issue #117 depends on #115 - may need sequential resolution")
    
    investigation_results["status_summary"] = status_summary
    
    for action in status_summary["action_required"]:
        print(f"    - {action}")
    
    # Save results
    output_file = os.path.join(REPO_PATH, ".agent-harness", "investigation_117_115_results.json")
    with open(output_file, "w") as f:
        json.dump(investigation_results, f, indent=2)
    
    print(f"\n[6] Results saved to: {output_file}")
    print("\n" + "=" * 60)
    print("Investigation Complete")
    print("=" * 60)
    
    return investigation_results

if __name__ == "__main__":
    results = main()
    sys.exit(0 if "error" not in str(results) else 1)
