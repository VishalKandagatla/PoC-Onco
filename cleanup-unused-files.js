/**
 * Cleanup script to remove unused files and organize the codebase
 * Run with: node cleanup-unused-files.js
 */

const fs = require('fs');
const path = require('path');

// Files to remove (test files, duplicates, unused files)
const filesToRemove = [
    // Test and debug files
    'public/dashboard.html',
    'public/debug-dashboard.html',
    'public/debug-data-loading.html',
    'public/debug-patient.html',
    'public/healthcare-dashboard.html',
    'public/knowledge-base-redesign.html',
    'public/patient-dashboard-backup.html',
    'public/patient-dashboard-fixed.html',
    'public/patient-dashboard-new.html',
    'public/patient-dashboard.html',
    'public/simple-nav-test.html',
    'public/simple-patient-dashboard.html',
    'public/test-minimal.html',
    'public/test-nav.html',
    'public/test-patient-data.html',
    'public/test-report.html',
    'public/test.html',
    
    // Duplicate image files in pacs folder (we have organized ones in patients folder)
    'public/pacs/case_1_baseline.png',
    'public/pacs/case_1_followup.png',
    'public/pacs/case_2_baseline.png',
    'public/pacs/case_2_followup.png',
    'public/pacs/case_3_baseline.png',
    'public/pacs/case_3_followup.png',
    'public/pacs/imaging_baseline.jpg',
    'public/pacs/imaging_baseline.png',
    'public/pacs/imaging_followup.jpg',
    'public/pacs/imaging_followup.png',
    
    // Old JavaScript files
    'public/js/app.js',
    'public/js/perplexity-app.js',
    
    // Temporary files
    'temp_response.json',
    'nul',
    'server.log'
];

// Directories to remove if empty
const directoriesToCleanup = [
    'public/pacs'
];

function removeFile(filePath) {
    const fullPath = path.join(__dirname, filePath);
    try {
        if (fs.existsSync(fullPath)) {
            const stat = fs.statSync(fullPath);
            if (stat.isFile()) {
                fs.unlinkSync(fullPath);
                console.log(`✓ Removed file: ${filePath}`);
            } else if (stat.isDirectory()) {
                fs.rmSync(fullPath, { recursive: true, force: true });
                console.log(`✓ Removed directory: ${filePath}`);
            }
        }
    } catch (error) {
        console.error(`✗ Failed to remove ${filePath}:`, error.message);
    }
}

function removeEmptyDirectory(dirPath) {
    const fullPath = path.join(__dirname, dirPath);
    try {
        if (fs.existsSync(fullPath)) {
            const files = fs.readdirSync(fullPath);
            if (files.length === 0) {
                fs.rmdirSync(fullPath);
                console.log(`✓ Removed empty directory: ${dirPath}`);
            } else {
                console.log(`ℹ Directory not empty, keeping: ${dirPath}`);
            }
        }
    } catch (error) {
        console.error(`✗ Failed to remove directory ${dirPath}:`, error.message);
    }
}

function createBackupOfActiveFiles() {
    const activeFiles = [
        'public/clinician-dashboard.html',
        'public/patient-detail.html',
        'public/medical-search.html'
    ];
    
    const backupDir = path.join(__dirname, 'backup-original');
    
    try {
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }
        
        activeFiles.forEach(file => {
            const sourcePath = path.join(__dirname, file);
            const backupPath = path.join(backupDir, path.basename(file));
            
            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, backupPath);
                console.log(`✓ Backed up: ${file}`);
            }
        });
    } catch (error) {
        console.error('✗ Failed to create backup:', error.message);
    }
}

function replaceWithRefactoredVersions() {
    const replacements = [
        {
            old: 'public/clinician-dashboard.html',
            new: 'public/clinician-dashboard-refactored.html'
        },
        {
            old: 'public/patient-detail.html',
            new: 'public/patient-detail-refactored.html'
        }
    ];
    
    replacements.forEach(({ old, new: newFile }) => {
        const oldPath = path.join(__dirname, old);
        const newPath = path.join(__dirname, newFile);
        
        try {
            if (fs.existsSync(newPath)) {
                // Remove old file
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
                
                // Rename refactored file to original name
                fs.renameSync(newPath, oldPath);
                console.log(`✓ Replaced ${old} with refactored version`);
            }
        } catch (error) {
            console.error(`✗ Failed to replace ${old}:`, error.message);
        }
    });
}

function main() {
    console.log('🧹 Starting codebase cleanup...\n');
    
    // Step 1: Create backup of active files
    console.log('📦 Creating backup of original files...');
    createBackupOfActiveFiles();
    console.log('');
    
    // Step 2: Remove unused files
    console.log('🗑️  Removing unused files...');
    filesToRemove.forEach(removeFile);
    console.log('');
    
    // Step 3: Clean up empty directories
    console.log('📁 Cleaning up empty directories...');
    directoriesToCleanup.forEach(removeEmptyDirectory);
    console.log('');
    
    // Step 4: Replace with refactored versions
    console.log('🔄 Replacing with refactored versions...');
    replaceWithRefactoredVersions();
    console.log('');
    
    console.log('✅ Cleanup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Removed test and duplicate files');
    console.log('- Organized CSS into modular files');
    console.log('- Created reusable JavaScript modules');
    console.log('- Replaced HTML files with refactored versions');
    console.log('- Original files backed up to backup-original/');
}

// Run cleanup if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = { main };