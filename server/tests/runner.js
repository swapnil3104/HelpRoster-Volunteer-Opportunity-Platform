import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testFiles = [
  'auth.test.js',
  'contact.test.js',
  'opportunities.test.js',
  'applications.test.js',
  'dashboards_and_hours.test.js',
  'admin_and_email.test.js',
  'e2e_journey.test.js',
  'security.test.js'
];

let failed = false;

for (const file of testFiles) {
  const filePath = path.join(__dirname, file);
  console.log(`\n========================================`);
  console.log(`Running test suite: ${file}`);
  console.log(`========================================`);
  const result = spawnSync('node', ['--test', filePath], {
    stdio: 'inherit',
    shell: true
  });
  if (result.status !== 0) {
    failed = true;
    break;
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log(`\nAll test suites completed successfully!`);
  process.exit(0);
}
