#!/usr/bin/env python3
"""
Health Platform API Test Runner
Consolidated test runner for all API endpoints with comprehensive reporting.
"""
import asyncio
import sys
import os
import subprocess
import json
from datetime import datetime
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

class APITestRunner:
    """Consolidated API test runner with comprehensive reporting."""
    
    def __init__(self):
        self.test_results = {}
        self.start_time = None
        self.end_time = None
        self.api_health_status = {
            "overall": "unknown",
            "endpoints": {},
            "categories": {},
            "issues": [],
            "recommendations": []
        }
        
    async def run_all_tests(self):
        """Run all API tests and generate comprehensive report."""
        print("=" * 80)
        print("HEALTH PLATFORM API COMPREHENSIVE TEST SUITE")
        print("=" * 80)
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        self.start_time = datetime.now()
        
        # Test categories with their specific test files
        test_categories = [
            ("Core Authentication", self.test_auth_core),
            ("Profile Management", self.test_profile_core),
            ("Action Plans", self.test_action_plans_core),
            ("Labs Integration", self.test_labs_core),
            ("Health Insights", self.test_insights_core),
            ("Consultations", self.test_consultations_core),
            ("Error Handling", self.test_error_handling),
            ("Integration Workflow", self.test_integration_workflow),
            ("Enhanced Features", self.test_enhanced_features)
        ]
        
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        
        for category_name, test_function in test_categories:
            print(f"\n🔍 Testing {category_name}...")
            print("-" * 50)
            
            try:
                result = await test_function()
                self.test_results[category_name] = result
                
                if result["success"]:
                    print(f"✅ {category_name}: PASSED ({result['passed']}/{result['total']} tests)")
                    passed_tests += result['passed']
                else:
                    print(f"❌ {category_name}: FAILED ({result['passed']}/{result['total']} tests)")
                    failed_tests += result['failed']
                    for error in result.get('errors', []):
                        print(f"   - {error}")
                
                total_tests += result['total']
                
            except Exception as e:
                print(f"❌ {category_name}: ERROR - {str(e)}")
                self.test_results[category_name] = {
                    "success": False,
                    "total": 1,
                    "passed": 0,
                    "failed": 1,
                    "errors": [str(e)]
                }
                failed_tests += 1
                total_tests += 1
        
        self.end_time = datetime.now()
        duration = self.end_time - self.start_time
        
        # Analyze API health
        self.analyze_api_health()
        
        # Generate comprehensive report
        self.generate_comprehensive_report(total_tests, passed_tests, failed_tests, duration)
        
        return failed_tests == 0
    
    async def test_auth_core(self):
        """Test core authentication functionality."""
        return await self._run_pytest_tests("tests/test_comprehensive_api.py::TestComprehensiveAPI::test_auth_login")
    
    async def test_profile_core(self):
        """Test core profile functionality."""
        return await self._run_pytest_tests("tests/test_comprehensive_api.py::TestComprehensiveAPI::test_profile_get")
    
    async def test_action_plans_core(self):
        """Test core action plans functionality."""
        return await self._run_pytest_tests("tests/test_comprehensive_api.py::TestComprehensiveAPI::test_action_plans_create")
    
    async def test_labs_core(self):
        """Test core labs functionality."""
        return await self._run_pytest_tests("tests/test_comprehensive_api.py::TestComprehensiveAPI::test_labs_get_all")
    
    async def test_insights_core(self):
        """Test core insights functionality."""
        return await self._run_pytest_tests("tests/test_comprehensive_api.py::TestComprehensiveAPI::test_insights_summary")
    
    async def test_consultations_core(self):
        """Test core consultations functionality."""
        return await self._run_pytest_tests("tests/test_comprehensive_api.py::TestComprehensiveAPI::test_consultations_doctors")
    
    async def test_error_handling(self):
        """Test error handling functionality."""
        return await self._run_pytest_tests("tests/test_comprehensive_api.py::TestComprehensiveAPI::test_unauthorized_access")
    
    async def test_integration_workflow(self):
        """Test integration workflow functionality."""
        return await self._run_pytest_tests("tests/test_comprehensive_api.py::TestComprehensiveAPI::test_full_workflow")
    
    async def test_enhanced_features(self):
        """Test enhanced API features."""
        return await self._run_pytest_tests("tests/test_api_enhanced.py::TestEnhancedAPI::test_auth_login_success")
    
    async def _run_pytest_tests(self, test_path: str):
        """Run pytest tests for a specific path."""
        try:
            result = subprocess.run([
                sys.executable, "-m", "pytest", 
                test_path, "-v", "--tb=short", "--no-header", "--disable-warnings"
            ], capture_output=True, text=True, cwd=os.path.dirname(__file__), timeout=120)
            
            # Parse pytest output
            lines = result.stdout.split('\n')
            passed = sum(1 for line in lines if 'PASSED' in line)
            failed = sum(1 for line in lines if 'FAILED' in line)
            total = passed + failed
            
            errors = []
            if result.stderr:
                errors.extend([line.strip() for line in result.stderr.split('\n') if line.strip()])
            
            return {
                "success": failed == 0,
                "total": total,
                "passed": passed,
                "failed": failed,
                "errors": errors[:3]  # Limit to first 3 errors
            }
            
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "total": 1,
                "passed": 0,
                "failed": 1,
                "errors": ["Test timed out after 120 seconds"]
            }
        except Exception as e:
            return {
                "success": False,
                "total": 1,
                "passed": 0,
                "failed": 1,
                "errors": [str(e)]
            }
    
    def analyze_api_health(self):
        """Analyze API health based on test results."""
        total_categories = len(self.test_results)
        successful_categories = sum(1 for result in self.test_results.values() if result["success"])
        
        # Overall health
        if successful_categories == total_categories:
            self.api_health_status["overall"] = "excellent"
        elif successful_categories >= total_categories * 0.8:
            self.api_health_status["overall"] = "good"
        elif successful_categories >= total_categories * 0.6:
            self.api_health_status["overall"] = "fair"
        else:
            self.api_health_status["overall"] = "poor"
        
        # Category analysis
        for category, result in self.test_results.items():
            if result["success"]:
                self.api_health_status["categories"][category] = "healthy"
            else:
                self.api_health_status["categories"][category] = "issues"
                self.api_health_status["issues"].extend(result.get("errors", []))
        
        # Generate recommendations
        self.generate_recommendations()
    
    def generate_recommendations(self):
        """Generate recommendations based on test results."""
        recommendations = []
        
        # Check for authentication issues
        if "Core Authentication" in self.test_results and not self.test_results["Core Authentication"]["success"]:
            recommendations.append("Fix authentication endpoints - critical for API security")
        
        # Check for permission issues
        permission_issues = [cat for cat, result in self.test_results.items() 
                           if not result["success"] and any("403" in str(error) for error in result.get("errors", []))]
        if permission_issues:
            recommendations.append("Review permission system - several endpoints returning 403 Forbidden")
        
        # Check for validation issues
        validation_issues = [cat for cat, result in self.test_results.items() 
                           if not result["success"] and any("422" in str(error) for error in result.get("errors", []))]
        if validation_issues:
            recommendations.append("Review request validation schemas - several endpoints returning 422 Unprocessable Entity")
        
        self.api_health_status["recommendations"] = recommendations
    
    def generate_comprehensive_report(self, total_tests: int, passed_tests: int, failed_tests: int, duration):
        """Generate comprehensive test report."""
        print("\n" + "=" * 80)
        print("COMPREHENSIVE API HEALTH REPORT")
        print("=" * 80)
        
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"Duration: {duration.total_seconds():.2f} seconds")
        print()
        
        # API Health Status
        health_emoji = {
            "excellent": "🟢",
            "good": "🟡", 
            "fair": "🟠",
            "poor": "🔴"
        }
        
        print(f"API Health Status: {health_emoji.get(self.api_health_status['overall'], '❓')} {self.api_health_status['overall'].upper()}")
        print()
        
        # Detailed results by category
        print("DETAILED RESULTS BY CATEGORY:")
        print("-" * 50)
        
        for category, result in self.test_results.items():
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            health_status = self.api_health_status["categories"].get(category, "unknown")
            print(f"{category:<20} {status:<8} ({result['passed']}/{result['total']}) [{health_status}]")
            
            if not result["success"] and result.get("errors"):
                for error in result["errors"][:2]:  # Show first 2 errors
                    if error.strip():
                        print(f"  └─ {error}")
        
        print()
        
        # Issues and Recommendations
        if self.api_health_status["issues"]:
            print("IDENTIFIED ISSUES:")
            print("-" * 30)
            for issue in self.api_health_status["issues"][:5]:  # Show first 5 issues
                if issue.strip():
                    print(f"• {issue}")
            print()
        
        if self.api_health_status["recommendations"]:
            print("RECOMMENDATIONS:")
            print("-" * 20)
            for rec in self.api_health_status["recommendations"]:
                print(f"• {rec}")
            print()
        
        # Overall status
        if failed_tests == 0:
            print("🎉 ALL TESTS PASSED! The API is working as expected.")
            print("\n✅ API Status: HEALTHY")
            print("✅ All endpoints are accessible")
            print("✅ Authentication is working")
            print("✅ Error handling is proper")
            print("✅ Integration tests pass")
        else:
            print(f"⚠️  {failed_tests} TESTS FAILED. Please review the issues above.")
            print(f"\n❌ API Status: {self.api_health_status['overall'].upper()}")
            print("❌ Some endpoints may not be working correctly")
            print("❌ Please fix the failing tests before deployment")
        
        print("\n" + "=" * 80)
        
        # Save detailed report to file
        self.save_detailed_report(total_tests, passed_tests, failed_tests, duration)
    
    def save_detailed_report(self, total_tests: int, passed_tests: int, failed_tests: int, duration):
        """Save detailed test report to JSON file."""
        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "success_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0,
                "duration_seconds": duration.total_seconds()
            },
            "api_health": self.api_health_status,
            "results": self.test_results,
            "status": "PASS" if failed_tests == 0 else "FAIL"
        }
        
        report_file = Path(__file__).parent / "api_test_report.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📄 Detailed report saved to: {report_file}")


async def main():
    """Main entry point."""
    runner = APITestRunner()
    success = await runner.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())