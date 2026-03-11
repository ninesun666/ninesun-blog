"""
Issue Handler Module
Handles processing of GitHub issues and pull requests with defensive error handling.
"""

import logging
from typing import Optional, Dict, Any
from github import GithubException
from github.PullRequest import PullRequest
from github.Issue import Issue

# Configure module-level logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create console handler if not already configured
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)


class IssueHandler:
    """Handles GitHub issue and pull request processing with robust error handling."""
    
    def __init__(self, github_client):
        """
        Initialize the issue handler.
        
        Args:
            github_client: Authenticated GitHub client instance
        """
        self.client = github_client
        logger.info("IssueHandler initialized successfully")
    
    def get_pr_branch_info(self, pr: PullRequest) -> Dict[str, Optional[str]]:
        """
        Safely extract branch information from a pull request.
        
        This method handles cases where the head repository may have been deleted
        (e.g., when a fork is removed after PR creation).
        
        Args:
            pr: GitHub PullRequest object
            
        Returns:
            Dictionary containing branch information:
            - head_ref: Head branch name
            - head_sha: Head commit SHA
            - head_label: Full head label (owner:branch)
            - head_owner: Head repository owner (may be None)
            - head_repo_name: Head repository name (may be None)
            - base_ref: Base branch name
            - base_owner: Base repository owner
        """
        logger.debug(f"Extracting branch info for PR #{pr.number}")
        
        result = {
            'head_ref': None,
            'head_sha': None,
            'head_label': None,
            'head_owner': None,
            'head_repo_name': None,
            'base_ref': None,
            'base_owner': None
        }
        
        try:
            # These attributes are always available
            result['head_ref'] = pr.head.ref
            result['head_sha'] = pr.head.sha
            result['head_label'] = pr.head.label
            result['base_ref'] = pr.base.ref
            
            logger.debug(
                f"PR #{pr.number}: head_ref={result['head_ref']}, "
                f"head_sha={result['head_sha'][:8]}..., "
                f"head_label={result['head_label']}"
            )
            
        except AttributeError as e:
            logger.error(
                f"Failed to access basic PR attributes for PR #{pr.number}: {e}"
            )
            raise
        
        # Safely access head repository info (may be None if fork was deleted)
        try:
            if pr.head.repo is not None:
                result['head_owner'] = pr.head.repo.owner.login
                result['head_repo_name'] = pr.head.repo.name
                logger.debug(
                    f"PR #{pr.number}: head repo found - "
                    f"owner={result['head_owner']}, repo={result['head_repo_name']}"
                )
            else:
                logger.warning(
                    f"PR #{pr.number}: head repository is inaccessible "
                    f"(fork may have been deleted). Using head.label for owner info."
                )
                # Try to extract owner from head.label (format: 'owner:branch')
                if result['head_label'] and ':' in result['head_label']:
                    result['head_owner'] = result['head_label'].split(':')[0]
                    logger.info(
                        f"PR #{pr.number}: extracted owner '{result['head_owner']}' "
                        f"from head_label"
                    )
                    
        except AttributeError as e:
            logger.warning(
                f"PR #{pr.number}: AttributeError accessing head.repo attributes: {e}"
            )
        except Exception as e:
            logger.error(
                f"PR #{pr.number}: Unexpected error accessing head repository: {e}",
                exc_info=True
            )
        
        # Safely access base repository info (should always be available)
        try:
            if pr.base.repo is not None:
                result['base_owner'] = pr.base.repo.owner.login
                logger.debug(
                    f"PR #{pr.number}: base owner={result['base_owner']}"
                )
            else:
                logger.warning(
                    f"PR #{pr.number}: base repository unexpectedly None"
                )
        except AttributeError as e:
            logger.error(
                f"PR #{pr.number}: Failed to access base repository info: {e}"
            )
        
        return result
    
    def process_issue(self, issue: Issue) -> Dict[str, Any]:
        """
        Process a GitHub issue with comprehensive error handling.
        
        Args:
            issue: GitHub Issue object
            
        Returns:
            Dictionary with processing results and status
        """
        logger.info(f"Processing issue #{issue.number}: {issue.title}")
        
        result = {
            'issue_number': issue.number,
            'status': 'pending',
            'message': '',
            'data': {}
        }
        
        try:
            # Check if issue is linked to a PR
            if hasattr(issue, 'pull_request') and issue.pull_request:
                logger.debug(f"Issue #{issue.number} is a pull request")
                
                try:
                    pr = issue.as_pull_request()
                    branch_info = self.get_pr_branch_info(pr)
                    result['data']['branch_info'] = branch_info
                    result['status'] = 'success'
                    result['message'] = 'Successfully extracted PR branch information'
                    
                    logger.info(
                        f"Issue #{issue.number}: Successfully processed PR "
                        f"from {branch_info.get('head_label', 'unknown')}"
                    )
                    
                except GithubException as e:
                    logger.error(
                        f"Issue #{issue.number}: GitHub API error fetching PR: {e}"
                    )
                    result['status'] = 'error'
                    result['message'] = f'GitHub API error: {e}'
                    
                except AttributeError as e:
                    logger.error(
                        f"Issue #{issue.number}: Attribute error processing PR: {e}",
                        exc_info=True
                    )
                    result['status'] = 'error'
                    result['message'] = f'Failed to access PR attributes: {e}'
                    
            else:
                logger.debug(f"Issue #{issue.number} is a regular issue (not a PR)")
                result['status'] = 'success'
                result['message'] = 'Issue processed (not a pull request)'
                
        except GithubException as e:
            logger.error(
                f"Issue #{issue.number}: GitHub API error: {e}",
                exc_info=True
            )
            result['status'] = 'error'
            result['message'] = f'GitHub API error: {e}'
            
        except Exception as e:
            logger.error(
                f"Issue #{issue.number}: Unexpected error: {e}",
                exc_info=True
            )
            result['status'] = 'error'
            result['message'] = f'Unexpected error: {e}'
        
        return result
    
    def handle_pr_event(self, pr_data: Dict[str, Any]) -> bool:
        """
        Handle pull request event with defensive error handling.
        
        Args:
            pr_data: Dictionary containing pull request event data
            
        Returns:
            True if handled successfully, False otherwise
        """
        pr_number = pr_data.get('number', 'unknown')
        logger.info(f"Handling PR event for #{pr_number}")
        
        try:
            # Validate required fields
            if 'number' not in pr_data:
                logger.error("PR event missing 'number' field")
                return False
            
            # Extract branch information safely
            head_ref = pr_data.get('head', {}).get('ref')
            base_ref = pr_data.get('base', {}).get('ref')
            
            if not head_ref:
                logger.warning(f"PR #{pr_number}: Missing head ref, attempting to fetch")
                # Could fetch from API here if needed
            
            logger.info(
                f"PR #{pr_number}: Processing {head_ref or 'unknown'} -> {base_ref or 'unknown'}"
            )
            
            # Process the PR
            # ... additional processing logic ...
            
            logger.info(f"PR #{pr_number}: Event handled successfully")
            return True
            
        except KeyError as e:
            logger.error(f"PR #{pr_number}: Missing expected key in data: {e}")
            return False
            
        except TypeError as e:
            logger.error(
                f"PR #{pr_number}: Type error processing event data: {e}",
                exc_info=True
            )
            return False
            
        except Exception as e:
            logger.error(
                f"PR #{pr_number}: Unexpected error handling event: {e}",
                exc_info=True
            )
            return False


def safe_get_pr_owner(pr: PullRequest, fallback_to_base: bool = True) -> Optional[str]:
    """
    Safely get the owner login from a pull request's head repository.
    
    This utility function handles the case where a PR's head repository
    has been deleted (e.g., fork removed after PR creation).
    
    Args:
        pr: GitHub PullRequest object
        fallback_to_base: If True, fall back to base repo owner when head is unavailable
        
    Returns:
        Owner login string or None if unavailable
    """
    logger = logging.getLogger(__name__)
    
    try:
        # Try to get owner from head repository
        if pr.head.repo is not None:
            owner = pr.head.repo.owner.login
            logger.debug(f"Got owner from head.repo: {owner}")
            return owner
        
        logger.warning(f"PR #{pr.number}: head.repo is None (fork may be deleted)")
        
        # Try to extract from head.label (format: 'owner:branch')
        if pr.head.label and ':' in pr.head.label:
            owner = pr.head.label.split(':')[0]
            logger.debug(f"Extracted owner from head.label: {owner}")
            return owner
        
        # Fall back to base repository owner
        if fallback_to_base and pr.base.repo is not None:
            owner = pr.base.repo.owner.login
            logger.info(
                f"PR #{pr.number}: Using base repo owner as fallback: {owner}"
            )
            return owner
            
    except AttributeError as e:
        logger.error(f"PR #{pr.number}: AttributeError in safe_get_pr_owner: {e}")
    except Exception as e:
        logger.error(
            f"PR #{pr.number}: Unexpected error in safe_get_pr_owner: {e}",
            exc_info=True
        )
    
    logger.warning(f"PR #{pr.number}: Could not determine owner")
    return None


def safe_get_pr_repo_name(pr: PullRequest) -> Optional[str]:
    """
    Safely get the repository name from a pull request's head repository.
    
    Args:
        pr: GitHub PullRequest object
        
    Returns:
        Repository name string or None if unavailable
    """
    logger = logging.getLogger(__name__)
    
    try:
        if pr.head.repo is not None:
            return pr.head.repo.name
        
        logger.warning(
            f"PR #{pr.number}: Cannot get repo name - head.repo is None"
        )
        return None
        
    except AttributeError as e:
        logger.error(f"PR #{pr.number}: AttributeError getting repo name: {e}")
        return None
    except Exception as e:
        logger.error(
            f"PR #{pr.number}: Unexpected error getting repo name: {e}",
            exc_info=True
        )
        return None


# Example usage and error handling patterns
if __name__ == "__main__":
    # Configure logging for standalone testing
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger.info("Issue handler module loaded")
    logger.info("Available utility functions:")
    logger.info("  - IssueHandler: Main handler class for issue/PR processing")
    logger.info("  - safe_get_pr_owner: Safely extract PR owner with fallback")
    logger.info("  - safe_get_pr_repo_name: Safely extract PR repository name")
