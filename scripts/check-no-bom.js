#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'package.json',
  'vercel.json',
  'playwright.config.js',
  'api/requirements.txt',
  'backend/requirements.txt',
];

const bom = Buffer.from([0xef, 0xbb, 0xbf]);
const offenders = [];

for (const relativePath of filesToCheck) {
  const absolutePath = path.resolve(__dirname, '..', relativePath);

  if (!fs.existsSync(absolutePath)) {
    continue;
  }

  const bytes = fs.readFileSync(absolutePath);
  if (bytes.length >= 3 && bytes.subarray(0, 3).equals(bom)) {
    offenders.push(relativePath);
  }
}

if (offenders.length > 0) {
  console.error('UTF-8 BOM detected in the following critical files:');
  for (const file of offenders) {
    console.error(` - ${file}`);
  }
  process.exit(1);
}

console.log('No UTF-8 BOM detected in critical deployment files.');
