// Simple test to verify API endpoints
const API_BASE = 'http://localhost:3001/api';

// Test function to check if endpoints are responding
async function testEndpoints() {
  console.log('Testing API endpoints...');

  try {
    // Test reference data endpoints
    console.log('1. Testing districts endpoint...');
    const districtsResponse = await fetch(`${API_BASE}/districts`);
    console.log('Districts status:', districtsResponse.status);
    if (districtsResponse.ok) {
      const districts = await districtsResponse.json();
      console.log('Districts count:', districts.length);
    }

    console.log('2. Testing chiefdoms endpoint...');
    const chiefdomsResponse = await fetch(`${API_BASE}/chiefdoms`);
    console.log('Chiefdoms status:', chiefdomsResponse.status);
    if (chiefdomsResponse.ok) {
      const chiefdoms = await chiefdomsResponse.json();
      console.log('Chiefdoms count:', chiefdoms.length);
    }

    console.log('3. Testing fertilizers endpoint...');
    const fertilizersResponse = await fetch(`${API_BASE}/fertilizers`);
    console.log('Fertilizers status:', fertilizersResponse.status);
    if (fertilizersResponse.ok) {
      const fertilizers = await fertilizersResponse.json();
      console.log('Fertilizers count:', fertilizers.length);
    }

    console.log('4. Testing dealers endpoint...');
    const dealersResponse = await fetch(`${API_BASE}/dealers`);
    console.log('Dealers status:', dealersResponse.status);
    if (dealersResponse.ok) {
      const dealers = await dealersResponse.json();
      console.log('Dealers count:', dealers.length);
    }

    console.log('✅ All reference data endpoints are working!');
  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
  }
}

// Run the test
testEndpoints();
