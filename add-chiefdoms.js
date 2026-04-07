const mysql = require('mysql2/promise');

async function addMissingChiefdoms() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nafra_development',
  });

  try {
    console.log('Adding missing chiefdoms...');

    // Chiefdoms for Kenema District (ID: 3)
    await connection.execute(
      'INSERT INTO chiefdoms (name, district_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      ['Koya Chiefdom', 3],
    );
    await connection.execute(
      'INSERT INTO chiefdoms (name, district_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      ['Nongowa Chiefdom', 3],
    );

    // Chiefdoms for Koinadugu District (ID: 4)
    await connection.execute(
      'INSERT INTO chiefdoms (name, district_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      ['Diang Chiefdom', 4],
    );
    await connection.execute(
      'INSERT INTO chiefdoms (name, district_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      ['Falaba Chiefdom', 4],
    );

    // Chiefdoms for Moyamba District (ID: 5)
    await connection.execute(
      'INSERT INTO chiefdoms (name, district_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      ['Bagruwa Chiefdom', 5],
    );
    await connection.execute(
      'INSERT INTO chiefdoms (name, district_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      ['Koya Chiefdom', 5],
    );

    console.log('✅ All missing chiefdoms added successfully!');
  } catch (error) {
    console.error('❌ Error adding chiefdoms:', error.message);
  } finally {
    await connection.end();
  }
}

addMissingChiefdoms();
