"""
Tests for PullRequest utility functions.
"""

import unittest
from unittest.mock import MagicMock, Mock
from .utils.pr_utils import (
    safe_get_pr_attr,
    get_pr_head,
    get_pr_head_ref,
    get_pr_head_sha,
    validate_pr_object,
    safe_pr_operation
)


class MockPullRequest:
    """Mock PullRequest object for testing."""
    def __init__(self, number=123, head_ref='feature-branch', head_sha='abc123', base_ref='main'):
        self.number = number
        self.head = MagicMock()
        self.head.ref = head_ref
        self.head.sha = head_sha
        self.base = MagicMock()
        self.base.ref = base_ref


class TestSafeGetPrAttr(unittest.TestCase):
    """Tests for safe_get_pr_attr function."""
    
    def test_object_attribute_access(self):
        """Test accessing attribute from object."""
        pr = MockPullRequest()
        result = safe_get_pr_attr(pr, 'number')
        self.assertEqual(result, 123)
    
    def test_dict_key_access(self):
        """Test accessing key from dictionary."""
        pr = {'number': 456, 'head': {'ref': 'test-branch'}}
        result = safe_get_pr_attr(pr, 'number')
        self.assertEqual(result, 456)
    
    def test_none_object(self):
        """Test with None object."""
        result = safe_get_pr_attr(None, 'number', default='default')
        self.assertEqual(result, 'default')
    
    def test_missing_attribute(self):
        """Test with missing attribute."""
        pr = MockPullRequest()
        result = safe_get_pr_attr(pr, 'nonexistent', default='default')
        self.assertEqual(result, 'default')


class TestGetPrHead(unittest.TestCase):
    """Tests for get_pr_head function."""
    
    def test_get_head_from_object(self):
        """Test getting head from object."""
        pr = MockPullRequest()
        head = get_pr_head(pr)
        self.assertIsNotNone(head)
        self.assertEqual(head.ref, 'feature-branch')
    
    def test_get_head_from_dict(self):
        """Test getting head from dictionary."""
        pr = {'number': 123, 'head': {'ref': 'test-branch', 'sha': 'abc123'}}
        head = get_pr_head(pr)
        self.assertIsNotNone(head)
        self.assertEqual(head['ref'], 'test-branch')
    
    def test_none_pull_request(self):
        """Test with None PullRequest."""
        head = get_pr_head(None)
        self.assertIsNone(head)
    
    def test_missing_head_attribute(self):
        """Test with missing head attribute."""
        pr = Mock()
        del pr.head
        head = get_pr_head(pr)
        self.assertIsNotNone(head)  # Should return empty dict


class TestGetPrHeadRef(unittest.TestCase):
    """Tests for get_pr_head_ref function."""
    
    def test_get_head_ref_from_object(self):
        """Test getting head ref from object."""
        pr = MockPullRequest()
        ref = get_pr_head_ref(pr)
        self.assertEqual(ref, 'feature-branch')
    
    def test_get_head_ref_from_dict(self):
        """Test getting head ref from dictionary."""
        pr = {'head': {'ref': 'test-branch'}}
        ref = get_pr_head_ref(pr)
        self.assertEqual(ref, 'test-branch')
    
    def test_none_head(self):
        """Test with None head."""
        pr = Mock()
        pr.head = None
        ref = get_pr_head_ref(pr)
        self.assertIsNone(ref)


class TestValidatePrObject(unittest.TestCase):
    """Tests for validate_pr_object function."""
    
    def test_valid_pr_object(self):
        """Test with valid PullRequest object."""
        pr = MockPullRequest()
        result = validate_pr_object(pr)
        
        self.assertTrue(result['valid'])
        self.assertEqual(result['number'], 123)
        self.assertEqual(result['head_ref'], 'feature-branch')
        self.assertEqual(result['head_sha'], 'abc123')
        self.assertEqual(len(result['errors']), 0)
    
    def test_none_pr_object(self):
        """Test with None PullRequest object."""
        result = validate_pr_object(None)
        
        self.assertFalse(result['valid'])
        self.assertIn("PullRequest object is None", result['errors'])
    
    def test_missing_head_ref(self):
        """Test with missing head ref."""
        pr = Mock()
        pr.number = 123
        pr.head = Mock()
        del pr.head.ref
        pr.head.sha = 'abc123'
        pr.base = Mock()
        pr.base.ref = 'main'
        
        result = validate_pr_object(pr)
        self.assertFalse(result['valid'])


class TestSafePrOperation(unittest.TestCase):
    """Tests for safe_pr_operation function."""
    
    def test_successful_operation(self):
        """Test successful operation."""
        pr = MockPullRequest()
        result = safe_pr_operation(pr, 'test_operation')
        
        self.assertTrue(result['success'])
        self.assertEqual(result['pr_number'], 123)
        self.assertIsNone(result['error'])
    
    def test_failed_operation(self):
        """Test failed operation."""
        result = safe_pr_operation(None, 'test_operation')
        
        self.assertFalse(result['success'])
        self.assertIsNotNone(result['error'])


if __name__ == '__main__':
    unittest.main()
