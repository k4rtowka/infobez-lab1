const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

async function setupUsers() {
  try {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const users = [
      {
        id: 1,
        username: 'admin',
        passwordHash: adminPassword,
      },
      {
        id: 2,
        username: 'user',
        passwordHash: userPassword,
      },
    ];

    const usersPath = path.join(__dirname, '../data/users.json');
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf8');

    console.log('Users setup completed!');
    console.log('Test credentials:');
    console.log('  admin / admin123');
    console.log('  user / user123');
  } catch (error) {
    console.error('Error setting up users:', error);
    process.exit(1);
  }
}

setupUsers();
