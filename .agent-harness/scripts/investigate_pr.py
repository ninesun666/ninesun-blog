#!/usr/bin/env python3
"""
Investigation script for T001: Investigate existing PR for issue #117

This script queries GitHub API to find and analyze the existing PR.
"""

import os
import sys
import json
import subprocess
from datetime import datetime
from pathlib import Path

# Add automation directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'automation'))

try:
    from github_client import GitHubClient
except ImportError:
    print("Warning: github_client not available, using subprocess for git commands")
    GitHubClient = None


class PRIvestigator:
    """Investigate existing PRs for issue #117"""
    
    def __init__(self):
        self.project_path = Path(__file__).parent.parent.parent
        self.target_branch = 'feat/issue-117-manual-review-required-failed-to-process-issue-115'
        self.issue_number = 117
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'target_branch': self.target_branch,
            'issue_number': self.issue_number,
            'pr_exists': False,
            'pr_data': None,
            'branch_exists': False,
            'findings': []
        }
    
    def run_git_command(self, *args):
        """Run a git command and return output"""
        try:
            result = subprocess.run(
                ['git'] + list(args),
                cwd=self.project_path,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            return None
    
    def run_gh_command(self, *args):
        """Run a gh (GitHub CLI) command and return output"""
        try:
            result = subprocess.run(
                ['gh'] + list(args),
                cwd=self.project_path,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            print(f"GitHub CLI command failed: {e.stderr}")
            return None
    
    def check_branch_exists(self):
        """Check if the target branch exists locally and remotely"""
        print(f"\n=== Checking branch existence ===")
        print(f"Target branch: {self.target_branch}")
        
        # Check local branches
        local_branches = self.run_git_command('branch', '--list', self.target_branch)
        self.results['branch_exists_local'] = bool(local_branches)
        print(f"Local branch exists: {self.results['branch_exists_local']}")
        
        # Check remote branches
        remote_branches = self.run_git_command('branch', '-r', '--list', f'*/{self.target_branch}')
        self.results['branch_exists_remote'] = bool(remote_branches)
        print(f"Remote branch exists: {self.results['branch_exists_remote']}")
        
        self.results['branch_exists'] = (
            self.results['branch_exists_local'] or 
            self.results['branch_exists_remote']
        )
        
        return self.results['branch_exists']
    
    def find_existing_pr(self):
        """Find existing PR for the target branch"""
        print(f"\n=== Searching for existing PR ===")
        
        # Use GitHub CLI to list PRs
        pr_list = self.run_gh_command(
            'pr', 'list',
            '--head', self.target_branch,
            '--json', 'number,title,state,url,createdAt,author,body'
        )
        
        if pr_list:
            try:
                prs = json.loads(pr_list)
                if prs:
                    self.results['pr_exists'] = True
                    self.results['pr_data'] = prs[0]  # Get first matching PR
                    print(f"Found PR #{self.results['pr_data']['number']}")
                    print(f"  Title: {self.results['pr_data']['title']}")
                    print(f"  State: {self.results['pr_data']['state']}")
                    print(f"  URL: {self.results['pr_data']['url']}")
                    return True
            except json.JSONDecodeError:
                print("Failed to parse PR list")
        
        print("No existing PR found for this branch")
        return False
    
    def get_pr_details(self):
        """Get detailed information about the PR"""
        if not self.results['pr_exists']:
            return
        
        print(f"\n=== PR Details ===")
        pr_number = self.results['pr_data']['number']
        
        # Get PR checks status
        checks = self.run_gh_command('pr', 'checks', str(pr_number))
        if checks:
            print(f"CI/CD Status:\n{checks}")
            self.results['pr_data']['checks'] = checks
        
        # Get PR diff stats
        diff = self.run_gh_command('pr', 'diff', str(pr_number))
        if diff:
            files_changed = len(diff.split('diff --git'))
            print(f"Files changed (approx): {files_changed}")
            self.results['pr_data']['files_changed'] = files_changed
    
    def check_issue_117(self):
        """Get information about issue #117"""
        print(f"\n=== Issue #{self.issue_number} Details ===")
        
        issue_data = self.run_gh_command(
            'issue', 'view', str(self.issue_number),
            '--json', 'number,title,state,body,labels'
        )
        
        if issue_data:
            try:
                issue = json.loads(issue_data)
                self.results['issue_data'] = issue
                print(f"Title: {issue['title']}")
                print(f"State: {issue['state']}")
                print(f"Labels: {[l['name'] for l in issue.get('labels', [])]}")
            except json.JSONDecodeError:
                print("Failed to parse issue data")
    
    def generate_findings(self):
        """Generate findings and recommendations"""
        print(f"\n=== Findings ===")
        
        findings = []
        
        if not self.results['branch_exists']:
            findings.append({
                'severity': 'critical',
                'message': f'Branch {self.target_branch} does not exist'
            })
        
        if not self.results['pr_exists']:
            findings.append({
                'severity': 'high',
                'message': 'No existing PR found for the branch'
            })
        else:
            pr_state = self.results['pr_data']['state']
            if pr_state == 'open':
                findings.append({
                    'severity': 'info',
                    'message': f"PR #{self.results['pr_data']['number']} is open and can be reviewed"
                })
            elif pr_state == 'closed':
                findings.append({
                    'severity': 'warning',
                    'message': f"PR #{self.results['pr_data']['number']} is closed"
                })
            elif pr_state == 'merged':
                findings.append({
                    'severity': 'info',
                    'message': f"PR #{self.results['pr_data']['number']} is already merged"
                })
        
        self.results['findings'] = findings
        
        for f in findings:
            print(f"[{f['severity'].upper()}] {f['message']}")
    
    def save_results(self):
        """Save investigation results to JSON file"""
        output_path = self.project_path / '.agent-harness' / 'investigation_results_T001.json'
        with open(output_path, 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"\nResults saved to: {output_path}")
    
    def run(self):
        """Run the full investigation"""
        print("=" * 60)
        print("T001: Investigate existing PR for issue #117")
        print("=" * 60)
        
        self.check_branch_exists()
        self.find_existing_pr()
        
        if self.results['pr_exists']:
            self.get_pr_details()
        
        self.check_issue_117()
        self.generate_findings()
        self.save_results()
        
        print("\n" + "=" * 60)
        print("Investigation complete")
        print("=" * 60)
        
        return self.results


if __name__ == '__main__':
    investigator = PRIvestigator()
    results = investigator.run()
