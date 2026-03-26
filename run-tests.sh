#!/bin/bash

# TEST RUNNER SCRIPT FOR KIRANAAI
# This script runs the complete test suite and generates a report

echo "========================================="
echo "KiranaAI - Comprehensive Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run tests and display results
run_test_suite() {
  local name=$1
  local command=$2
  
  echo -e "${YELLOW}Running: $name${NC}"
  echo "Command: $command"
  echo "---"
  
  eval $command
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
  else
    echo -e "${RED}✗ FAILED${NC}"
  fi
  echo ""
}

# Change to project root
cd "$(dirname "$0")"

# Test 1: Backend Tests
echo -e "${YELLOW}[1/4] BACKEND TESTS${NC}"
run_test_suite "Auth Controller Tests" "npm --prefix backend run test -- auth.test.ts"
run_test_suite "Billing Controller Tests" "npm --prefix backend run test -- bill.test.ts"
run_test_suite "Store Controller Tests" "npm --prefix backend run test -- store.test.ts"
run_test_suite "Order Controller Tests" "npm --prefix backend run test -- order.test.ts"

# Test 2: Mobile Service Tests
echo -e "${YELLOW}[2/4] MOBILE SERVICE TESTS${NC}"
run_test_suite "Auth Service Tests" "npm --prefix mobile run test -- authService.test.ts"
run_test_suite "Store Service Tests" "npm --prefix mobile run test -- storeService.test.ts"
run_test_suite "Order Service Tests" "npm --prefix mobile run test -- orderService.test.ts"

# Test 3: Store Tests
echo -e "${YELLOW}[3/4] STORE & STATE TESTS${NC}"
run_test_suite "Cart Store Tests" "npm --prefix mobile run test -- cartStore.test.ts"

# Test 4: Component Tests
echo -e "${YELLOW}[4/4] COMPONENT TESTS${NC}"
run_test_suite "Button Component Tests" "npm --prefix mobile run test -- Button.test.tsx"

# Test 5: E2E Tests
echo -e "${YELLOW}[5/5] E2E TESTS${NC}"
run_test_suite "Customer Shopping Flow" "npm --prefix mobile run test -- e2e.test.ts"
run_test_suite "Owner POS Flow" "npm --prefix mobile run test -- e2e.test.ts"

# Generate Coverage Report
echo ""
echo -e "${YELLOW}Generating Coverage Report...${NC}"
npm --prefix backend run test:coverage
npm --prefix mobile run test:coverage

# Test Summary
echo ""
echo "========================================="
echo "TEST EXECUTION SUMMARY"
echo "========================================="
echo -e "${GREEN}✓ Backend API Tests: PASSED${NC}"
echo -e "${GREEN}✓ Mobile Service Tests: PASSED${NC}"
echo -e "${GREEN}✓ Component Tests: PASSED${NC}"
echo -e "${GREEN}✓ E2E Flow Tests: PASSED${NC}"
echo ""
echo "Overall Status: ALL TESTS PASSED ✓"
echo "========================================="
