#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const ignoredPrefixes = ['node_modules/', 'playwright-report/', 'test-results/'];

function isIgnored(filePath) {
  return ignoredPrefixes.some((prefix) => filePath.startsWith(prefix));
}

function listTrackedFiles() {
  const output = execSync('git ls-files', {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((filePath) => !isIgnored(filePath));
}

function hasBom(filePath) {
  const absolutePath = path.join(repoRoot, filePath);
  const bytes = fs.readFileSync(absolutePath);
  return bytes.length >= 3 && bytes.subarray(0, 3).equals(BOM);
}

const offenders = [];

for (const filePath of listTrackedFiles()) {
  if (hasBom(filePath)) {
    offenders.push(filePath);
  }
}

if (offenders.length > 0) {
  console.error('UTF-8 BOM detected in tracked files:');
  for (const filePath of offenders) {
    console.error(` - ${filePath}`);
  }
  process.exit(1);
}

console.log('No UTF-8 BOM detected in tracked files.');
