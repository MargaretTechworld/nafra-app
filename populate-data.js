// Script to populate the database with test data
const API_BASE = 'http://localhost:3001/api';

async function populateTestData() {
  console.log('Populating test data...');

  try {
    // Add districts
    console.log('Adding districts...');
    const districts = [
      { district: { name: 'Bombali District' } },
      { district: { name: 'Kambia District' } },
      { district: { name: 'Kenema District' } },
      { district: { name: 'Koinadugu District' } },
      { district: { name: 'Moyamba District' } },
    ];

    for (const districtData of districts) {
      const response = await fetch(`${API_BASE}/districts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(districtData),
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Created district:', result.name);
      }
    }

    // Get districts to use for chiefdoms
    const districtsResponse = await fetch(`${API_BASE}/districts`);
    const districtsList = await districtsResponse.json();

    console.log('Districts response:', districtsList);

    // Add chiefdoms
    console.log('Adding chiefdoms...');
    const bombali = Array.isArray(districtsList) ? districtsList.find((d) => d.name === 'Bombali District') : null;
    const kambia = Array.isArray(districtsList) ? districtsList.find((d) => d.name === 'Kambia District') : null;

    if (bombali) {
      const chiefdoms1 = [
        { chiefdom: { name: 'Binkolo Chiefdom', district_id: bombali.id } },
        { chiefdom: { name: 'Diang Chiefdom', district_id: bombali.id } },
      ];

      for (const chiefdomData of chiefdoms1) {
        const response = await fetch(`${API_BASE}/chiefdoms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chiefdomData),
        });
        if (response.ok) {
          const result = await response.json();
          console.log('Created chiefdom:', result.name);
        }
      }
    }

    if (kambia) {
      const chiefdoms2 = [
        { chiefdom: { name: 'Mambolo Chiefdom', district_id: kambia.id } },
        { chiefdom: { name: 'Magbema Chiefdom', district_id: kambia.id } },
      ];

      for (const chiefdomData of chiefdoms2) {
        const response = await fetch(`${API_BASE}/chiefdoms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chiefdomData),
        });
        if (response.ok) {
          const result = await response.json();
          console.log('Created chiefdom:', result.name);
        }
      }
    }

    // Add chiefdoms for other districts
    console.log('Looking for additional districts...');
    const kenema = Array.isArray(districtsList) ? districtsList.find((d) => d.name === 'Kenema District') : null;
    const koinadugu = Array.isArray(districtsList) ? districtsList.find((d) => d.name === 'Koinadugu District') : null;
    const moyamba = Array.isArray(districtsList) ? districtsList.find((d) => d.name === 'Moyamba District') : null;

    console.log('Found districts:', { kenema, koinadugu, moyamba });

    if (kenema) {
      console.log('Adding chiefdoms for Kenema...');
      const chiefdoms3 = [
        { chiefdom: { name: 'Koya Chiefdom', district_id: kenema.id } },
        { chiefdom: { name: 'Nongowa Chiefdom', district_id: kenema.id } },
      ];

      for (const chiefdomData of chiefdoms3) {
        const response = await fetch(`${API_BASE}/chiefdoms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chiefdomData),
        });
        if (response.ok) {
          const result = await response.json();
          console.log('Created chiefdom:', result.name);
        } else {
          console.log('Failed to create chiefdom for Kenema:', response.status);
        }
      }
    } else {
      console.log('Kenema district not found!');
    }

    if (koinadugu) {
      const chiefdoms4 = [
        { chiefdom: { name: 'Diang Chiefdom', district_id: koinadugu.id } },
        { chiefdom: { name: 'Falaba Chiefdom', district_id: koinadugu.id } },
      ];

      for (const chiefdomData of chiefdoms4) {
        const response = await fetch(`${API_BASE}/chiefdoms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chiefdomData),
        });
        if (response.ok) {
          const result = await response.json();
          console.log('Created chiefdom:', result.name);
        }
      }
    }

    if (moyamba) {
      const chiefdoms5 = [
        { chiefdom: { name: 'Bagruwa Chiefdom', district_id: moyamba.id } },
        { chiefdom: { name: 'Koya Chiefdom', district_id: moyamba.id } },
      ];

      for (const chiefdomData of chiefdoms5) {
        const response = await fetch(`${API_BASE}/chiefdoms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chiefdomData),
        });
        if (response.ok) {
          const result = await response.json();
          console.log('Created chiefdom:', result.name);
        }
      }
    }

    // Add fertilizers
    console.log('Adding fertilizers...');
    const fertilizers = [
      { fertilizer: { name: 'NPK 15-15-15' } },
      { fertilizer: { name: 'Urea 46-0-0' } },
      { fertilizer: { name: 'DAP 18-46-0' } },
      { fertilizer: { name: 'MOP 0-0-60' } },
    ];

    for (const fertilizerData of fertilizers) {
      const response = await fetch(`${API_BASE}/fertilizers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fertilizerData),
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Created fertilizer:', result.name);
      }
    }

    // Add dealers
    console.log('Adding dealers...');
    const dealers = [
      { dealer: { name: 'Agro Input Suppliers Ltd', license_number: 'AGR001', status: 'active' } },
      { dealer: { name: 'Farmers Choice Co.', license_number: 'AGR002', status: 'active' } },
    ];

    for (const dealerData of dealers) {
      const response = await fetch(`${API_BASE}/dealers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealerData),
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Created dealer:', result.name);
      }
    }

    console.log('✅ Test data populated successfully!');
  } catch (error) {
    console.error('❌ Error populating data:', error.message);
  }
}

populateTestData();
