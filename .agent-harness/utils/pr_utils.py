"""
PullRequest utility functions for safe attribute access.
This module provides safe accessors for PullRequest objects to handle
API changes and object structure variations.
"""

import logging
from typing import Any, Optional, Dict, Union

logger = logging.getLogger(__name__)


cclass PullRequestAccessError(Exception):
    """Exception raised when accessing PullRequest attributes fails."""
    pass


def safe_get_pr_attr(pr_object: Any, attr: str, default: Any = None) -> Any:
    """
    Safely get an attribute from a PullRequest object.
    
    Handles both object attribute access and dictionary key access.
    
    Args:
        pr_object: The PullRequest object (could be object or dict)
        attr: The attribute name to access
        default: Default value if attribute doesn't exist
        
    Returns:
        The attribute value or default
    """
    if pr_object is None:
        logger.warning(f"Attempted to access '{attr}' on None PullRequest object")
        return default
    
    # Try object attribute access first
    if hasattr(pr_object, attr):
        return getattr(pr_object, attr)
    
    # Try dictionary key access
    if isinstance(pr_object, dict):
        return pr_object.get(attr, default)
    
    logger.warning(f"PullRequest object has no attribute '{attr}'")
    return default


def get_pr_head(pr_object: Any) -> Optional[Dict[str, Any]]:
    """
    Safely get the head information from a PullRequest object.
    
    This function handles the case where 'head' attribute may not exist
    or may be structured differently across different GitHub API versions.
    
    Args:
        pr_object: The PullRequest object
        
    Returns:
        Dictionary containing head information or None
    """
    if pr_object is None:
        logger.error("PullRequest object is None")
        return None
    
    # Try to get head attribute
    head = safe_get_pr_attr(pr_object, 'head')
    
    if head is None:
        logger.warning(f"PullRequest #{safe_get_pr_attr(pr_object, 'number', 'unknown')} has no head attribute")
        # Try alternative approaches
        # Some API versions might store head info differently
        if isinstance(pr_object, dict):
            head = pr_object.get('head', {})
        else:
            head = {}
    
    return head


def get_pr_head_ref(pr_object: Any) -> Optional[str]:
    """
    Safely get the head ref (branch name) from a PullRequest object.
    
    Args:
        pr_object: The PullRequest object
        
    Returns:
        The head ref string or None
    """
    head = get_pr_head(pr_object)
    
    if head is None:
        return None
    
    # Try to get ref from head
    ref = safe_get_pr_attr(head, 'ref')
    
    if ref is None and isinstance(head, dict):
        ref = head.get('ref')
    
    if ref is None:
        logger.warning("Could not extract head ref from PullRequest")
    
    return ref


def get_pr_head_sha(pr_object: Any) -> Optional[str]:
    """
    Safely get the head SHA from a PullRequest object.
    
    Args:
        pr_object: The PullRequest object
        
    Returns:
        The head SHA string or None
    """
    head = get_pr_head(pr_object)
    
    if head is None:
        return None
    
    # Try to get SHA from head
    sha = safe_get_pr_attr(head, 'sha')
    
    if sha is None and isinstance(head, dict):
        sha = head.get('sha')
    
    if sha is None:
        logger.warning("Could not extract head SHA from PullRequest")
    
    return sha


def validate_pr_object(pr_object: Any) -> Dict[str, Any]:
    """
    Validate a PullRequest object and return its key attributes.
    
    Args:
        pr_object: The PullRequest object to validate
        
    Returns:
        Dictionary with validation results and extracted data
    """
    result = {
        'valid': True,
        'number': None,
        'head_ref': None,
        'head_sha': None,
        'base_ref': None,
        'errors': []
    }
    
    if pr_object is None:
        result['valid'] = False
        result['errors'].append("PullRequest object is None")
        return result
    
    # Get PR number
    result['number'] = safe_get_pr_attr(pr_object, 'number')
    
    # Get head info
    result['head_ref'] = get_pr_head_ref(pr_object)
    result['head_sha'] = get_pr_head_sha(pr_object)
    
    # Get base info
    base = safe_get_pr_attr(pr_object, 'base')
    if base:
        result['base_ref'] = safe_get_pr_attr(base, 'ref')
        if isinstance(base, dict):
            result['base_ref'] = result['base_ref'] or base.get('ref')
    
    # Check validity
    if result['head_ref'] is None:
        result['errors'].append("Could not extract head_ref")
    if result['head_sha'] is None:
        result['errors'].append("Could not extract head_sha")
    
    result['valid'] = len(result['errors']) == 0
    
    return result


def safe_pr_operation(pr_object: Any, operation_name: str) -> Dict[str, Any]:
    """
    Wrapper for safe PullRequest operations with error handling.
    
    Args:
        pr_object: The PullRequest object
        operation_name: Name of the operation being performed
        
    Returns:
        Dictionary with operation results and any errors
    """
    result = {
        'success': True,
        'operation': operation_name,
        'pr_number': None,
        'error': None
    }
    
    try:
        validation = validate_pr_object(pr_object)
        result['pr_number'] = validation['number']
        
        if not validation['valid']:
            result['success'] = False
            result['error'] = f"PR validation failed: {', '.join(validation['errors'])}"
            logger.error(f"[{operation_name}] {result['error']}")
        else:
            logger.info(f"[{operation_name}] PR #{validation['number']} validated successfully")
    
    except Exception as e:
        result['success'] = False
        result['error'] = str(e)
        logger.exception(f"[{operation_name}] Unexpected error: {e}")
    
    return result
