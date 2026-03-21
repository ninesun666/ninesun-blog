#!/usr/bin/env python3
"""
Branch naming utility for AI automation.
Generates proper branch names from issue data.
"""

import re
import sys
import json


def sanitize_title(title: str) -> str:
    """
    Sanitize issue title for use in branch name.
    
    Args:
        title: The issue title to sanitize
        
    Returns:
        A sanitized string suitable for branch naming
    """
    if not title or not title.strip():
        return ""
    
    # Convert to lowercase
    slug = title.lower()
    
    # Replace spaces and special characters with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    
    # Remove leading and trailing hyphens
    slug = slug.strip('-')
    
    # Limit length to keep branch names reasonable
    if len(slug) > 50:
        slug = slug[:50].rstrip('-')
    
    return slug


def generate_branch_name(issue_number: int, issue_title: str, branch_type: str = "feat") -> str:
    """
    Generate a properly formatted branch name.
    
    Args:
        issue_number: The GitHub issue number
        issue_title: The issue title
        branch_type: The type of branch (feat, fix, docs, etc.)
        
    Returns:
        A properly formatted branch name
    """
    # Validate branch type
    valid_types = ["feat", "fix", "docs", "style", "refactor", "test", "chore"]
    if branch_type not in valid_types:
        branch_type = "feat"
    
    # Sanitize the title
    slug = sanitize_title(issue_title)
    
    # Build branch name - FIX: Don't append slug if it's empty
    if slug:
        branch_name = f"{branch_type}/issue-{issue_number}-{slug}"
    else:
        # If no title/slug, use a fallback descriptor without trailing dash
        branch_name = f"{branch_type}/issue-{issue_number}"
    
    return branch_name


def validate_branch_name(branch_name: str) -> tuple[bool, str]:
    """
    Validate a branch name for proper format.
    
    Args:
        branch_name: The branch name to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not branch_name:
        return False, "Branch name cannot be empty"
    
    # Check for trailing dash (the bug we're fixing)
    if branch_name.endswith('-'):
        return False, "Branch name cannot end with a dash"
    
    # Check for proper format
    pattern = r'^(feat|fix|docs|style|refactor|test|chore)/issue-\d+(-[a-z0-9-]+)?$'
    if not re.match(pattern, branch_name):
        return False, f"Branch name does not match expected format: {pattern}"
    
    return True, ""


def main():
    """Main entry point for command-line usage."""
    if len(sys.argv) < 3:
        print("Usage: branch-naming.py <issue_number> <issue_title> [branch_type]", file=sys.stderr)
        print("       branch-naming.py --validate <branch_name>", file=sys.stderr)
        sys.exit(1)
    
    # Validation mode
    if sys.argv[1] == "--validate":
        if len(sys.argv) < 3:
            print("Error: --validate requires a branch name", file=sys.stderr)
            sys.exit(1)
        branch_name = sys.argv[2]
        is_valid, error = validate_branch_name(branch_name)
        if is_valid:
            print(f"Valid: {branch_name}")
            sys.exit(0)
        else:
            print(f"Invalid: {error}", file=sys.stderr)
            sys.exit(1)
    
    # Generation mode
    try:
        issue_number = int(sys.argv[1])
    except ValueError:
        print(f"Error: issue_number must be an integer, got '{sys.argv[1]}'", file=sys.stderr)
        sys.exit(1)
    
    issue_title = sys.argv[2]
    branch_type = sys.argv[3] if len(sys.argv) > 3 else "feat"
    
    branch_name = generate_branch_name(issue_number, issue_title, branch_type)
    
    # Validate before outputting
    is_valid, error = validate_branch_name(branch_name)
    if not is_valid:
        print(f"Warning: Generated invalid branch name: {error}", file=sys.stderr)
    
    print(branch_name)


if __name__ == "__main__":
    main()
