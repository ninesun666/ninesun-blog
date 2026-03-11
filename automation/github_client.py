"""
GitHub Client Module
Handles GitHub API interactions with proper error handling for PullRequest objects.
"""

import logging
from typing import Optional, Any
from github import Github, PullRequest, Repository
from github.PullRequestPart import PullRequestPart

logger = logging.getLogger(__name__)


class GitHubClient:
    """Client for interacting with GitHub API."""
    
    def __init__(self, token: str):
        """Initialize GitHub client with authentication token."""
        self.client = Github(token)
        self._token = token
    
    def get_pull_request_branch_info(self, pr: PullRequest) -> dict:
        """
        Safely extract branch information from a PullRequest object.
        
        This method handles the case where a forked repository has been deleted,
        which causes pr.head.repo to be None.
        
        Args:
            pr: The PullRequest object from PyGithub
            
        Returns:
            dict containing branch information with safe defaults
        """
        info = {
            'head_branch': None,
            'head_sha': None,
            'head_label': None,
            'head_owner': None,
            'head_repo_name': None,
            'base_branch': None,
            'base_owner': None,
            'base_repo_name': None,
        }
        
        try:
            # Safe access - head.ref is always available
            info['head_branch'] = pr.head.ref
            info['head_sha'] = pr.head.sha
            info['head_label'] = pr.head.label  # Returns 'owner:branch-name' format
            
            # Safe access with null check for head.repo
            # When a fork is deleted, pr.head.repo becomes None
            if pr.head.repo is not None:
                info['head_owner'] = pr.head.repo.owner.login
                info['head_repo_name'] = pr.head.repo.name
            else:
                # Fallback: extract owner from head.label (format: 'owner:branch')
                if ':' in pr.head.label:
                    info['head_owner'] = pr.head.label.split(':')[0]
                logger.warning(
                    f"Head repository not accessible for PR #{pr.number}, "
                    f"using label fallback: {pr.head.label}"
                )
            
            # Base info is generally always available
            if pr.base.repo is not None:
                info['base_branch'] = pr.base.ref
                info['base_owner'] = pr.base.repo.owner.login
                info['base_repo_name'] = pr.base.repo.name
                
        except AttributeError as e:
            logger.error(
                f"AttributeError accessing PR #{getattr(pr, 'number', 'unknown')} data: {e}"
            )
            # Use base repo owner as fallback for head owner
            if info['head_owner'] is None and pr.base.repo is not None:
                info['head_owner'] = pr.base.repo.owner.login
                
        return info
    
    def get_pr_owner_login(self, pr: PullRequest) -> Optional[str]:
        """
        Safely get the owner login from a PullRequest.
        
        Previously this was accessed as: pr.head.repo.owner.login
        Now handles the case where head.repo is None (deleted fork).
        
        Args:
            pr: The PullRequest object
            
        Returns:
            Owner login string or None if not accessible
        """
        try:
            # Preferred: get from head.repo if available
            if pr.head.repo is not None:
                return pr.head.repo.owner.login
            
            # Fallback 1: extract from head.label
            if pr.head.label and ':' in pr.head.label:
                return pr.head.label.split(':')[0]
            
            # Fallback 2: use base repo owner
            if pr.base.repo is not None:
                logger.info(
                    f"Using base repo owner as fallback for PR #{pr.number}"
                )
                return pr.base.repo.owner.login
                
        except AttributeError as e:
            logger.error(f"Error getting owner login for PR #{getattr(pr, 'number', 'unknown')}: {e}")
        
        return None
    
    def get_pr_head_ref(self, pr: PullRequest) -> Optional[str]:
        """
        Safely get the head branch reference from a PullRequest.
        
        Args:
            pr: The PullRequest object
            
        Returns:
            Branch name string or None if not accessible
        """
        try:
            return pr.head.ref
        except AttributeError as e:
            logger.error(f"Error getting head ref for PR #{getattr(pr, 'number', 'unknown')}: {e}")
            return None
    
    def get_pr_full_head_reference(self, pr: PullRequest) -> Optional[str]:
        """
        Get the full head reference in 'owner:branch' format.
        
        This is the recommended way to get branch reference info as it
        always works, even when the fork has been deleted.
        
        Args:
            pr: The PullRequest object
            
        Returns:
            Full reference string like 'owner:branch-name' or None
        """
        try:
            return pr.head.label
        except AttributeError as e:
            logger.error(f"Error getting head label for PR #{getattr(pr, 'number', 'unknown')}: {e}")
            return None


def safe_get_pr_head_owner(pr: PullRequest) -> Optional[str]:
    """
    Standalone function for safe PR head owner access.
    
    Use this when you don't have a GitHubClient instance.
    
    Args:
        pr: The PullRequest object
        
    Returns:
        Owner login or None
    """
    try:
        if pr.head.repo is not None:
            return pr.head.repo.owner.login
        if pr.head.label and ':' in pr.head.label:
            return pr.head.label.split(':')[0]
        if pr.base.repo is not None:
            return pr.base.repo.owner.login
    except AttributeError:
        pass
    return None
