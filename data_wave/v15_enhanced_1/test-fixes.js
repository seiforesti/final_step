// Test script to verify API fixes
console.log('🧪 Testing API Fixes...\n');

// Test 1: Check if backend is accessible
async function testBackendHealth() {
  try {
    console.log('1️⃣ Testing backend health...');
    const response = await fetch('http://localhost:8000/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is running:', data);
    } else {
      console.log('❌ Backend health check failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Backend is not accessible:', error.message);
  }
}

// Test 2: Check if the failing endpoint exists
async function testDataSourcesEndpoint() {
  try {
    console.log('\n2️⃣ Testing data sources endpoint...');
    const response = await fetch('http://localhost:8000/scan/data-sources');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Data sources endpoint works:', data);
    } else {
      console.log('❌ Data sources endpoint failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Data sources endpoint error:', error.message);
  }
}

// Test 3: Check Next.js API route
async function testNextApiRoute() {
  try {
    console.log('\n3️⃣ Testing Next.js API route...');
    const response = await fetch('/api/data-sources');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Next.js API route works:', data);
    } else {
      console.log('❌ Next.js API route failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Next.js API route error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testBackendHealth();
  await testDataSourcesEndpoint();
  await testNextApiRoute();
  
  console.log('\n📋 SUMMARY:');
  console.log('• If backend tests fail: Backend service is down');
  console.log('• If Next.js API fails: Frontend routing issue');
  console.log('• Frontend is now protected with fallback data');
}

runTests();
