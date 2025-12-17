require('dotenv').config();
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

async function setupUsers() {
  try {
    const adminPasswordEnv = process.env.ADMIN_PASSWORD || 'admin123';
    const userPasswordEnv = process.env.USER_PASSWORD || 'user123';

    const adminPassword = await bcrypt.hash(adminPasswordEnv, 10);
    const userPassword = await bcrypt.hash(userPasswordEnv, 10);

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
