const http = require('http');

// Create the missing chiefdoms using HTTP requests
async function createChiefdoms() {
  const chiefdoms = [
    // Kenema District chiefdoms
    { name: 'Koya Chiefdom', district_id: 3 },
    { name: 'Nongowa Chiefdom', district_id: 3 },

    // Koinadugu District chiefdoms
    { name: 'Diang Chiefdom', district_id: 4 },
    { name: 'Falaba Chiefdom', district_id: 4 },

    // Moyamba District chiefdoms
    { name: 'Bagruwa Chiefdom', district_id: 5 },
    { name: 'Koya Chiefdom', district_id: 5 },
    { name: 'Lower Banta Chiefdom', district_id: 5 },
  ];

  for (const chiefdom of chiefdoms) {
    try {
      const data = JSON.stringify({ chiefdom });

      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/chiefdoms',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      };

      const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 201 || res.statusCode === 200) {
            console.log(`✅ Created: ${chiefdom.name}`);
          } else {
            console.log(`❌ Failed to create ${chiefdom.name}: ${res.statusCode} - ${responseBody}`);
          }
        });
      });

      req.on('error', (error) => {
        console.log(`❌ Error creating ${chiefdom.name}: ${error.message}`);
      });

      req.write(data);
      req.end();

      // Wait a bit between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`❌ Error with ${chiefdom.name}: ${error.message}`);
    }
  }
}

createChiefdoms();
