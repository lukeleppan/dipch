import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  console.log('Starting database migrations...');

  try {
    // Adjust the path to your SQLite database file
    const sqlite = new Database('/app/data/database.db');
    const db = drizzle(sqlite);

    // Path to your migrations folder - adjust if needed
    const migrationsFolder = join(__dirname, 'drizzle');

    // Run migrations
    await migrate(db, { migrationsFolder });

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations first, then start the application
runMigrations().then(() => {
  console.log('Starting application...');
  exec('node build', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting application: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Application stderr: ${stderr}`);
    }
    console.log(stdout);
  });
});
