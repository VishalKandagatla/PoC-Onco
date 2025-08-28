#!/usr/bin/env node

// Entheory Medical AI PoC - Setup Verification Script
const fs = require('fs');
const path = require('path');

console.log('🏥 Entheory Medical AI PoC - Setup Verification\n');

const checks = [
  {
    name: 'Package.json exists',
    check: () => fs.existsSync('package.json'),
    fix: 'Run npm init or restore package.json'
  },
  {
    name: 'Dependencies installed',
    check: () => fs.existsSync('node_modules'),
    fix: 'Run: npm install'
  },
  {
    name: 'Server file exists',
    check: () => fs.existsSync('src/server.js'),
    fix: 'Restore src/server.js file'
  },
  {
    name: 'Patient data exists',
    check: () => fs.existsSync('public/js/patientData.js'),
    fix: 'Restore public/js/patientData.js file'
  },
  {
    name: 'Main dashboard exists',
    check: () => fs.existsSync('public/clinician-dashboard.html'),
    fix: 'Restore public/clinician-dashboard.html file'
  },
  {
    name: 'Medical search exists',
    check: () => fs.existsSync('public/medical-search.html'),
    fix: 'Restore public/medical-search.html file'
  },
  {
    name: 'Patient detail page exists',
    check: () => fs.existsSync('public/patient-detail.html'),
    fix: 'Restore public/patient-detail.html file'
  },
  {
    name: 'Reports page exists',
    check: () => fs.existsSync('public/tumor-board-reports.html'),
    fix: 'Restore public/tumor-board-reports.html file'
  },
  {
    name: 'Analytics page exists',
    check: () => fs.existsSync('public/hospital-analytics.html'),
    fix: 'Restore public/hospital-analytics.html file'
  },
  {
    name: 'Startup script exists',
    check: () => fs.existsSync('start.sh'),
    fix: 'Restore start.sh file'
  }
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${check.name}`);
  
  if (!passed) {
    console.log(`   Fix: ${check.fix}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Your Entheory PoC is ready to run.');
  console.log('\n🚀 Start with: ./start.sh or npm run dev');
  console.log('🌐 Access at: http://localhost:3001');
} else {
  console.log('⚠️  Some issues found. Please fix the items above.');
}

console.log('\n🏥 Entheory Medical AI PoC - Ready for healthcare innovation!');