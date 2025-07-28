#!/usr/bin/env node

/**
 * Script to update all db.query() calls to safeDbQuery() calls
 * Run this script to automatically update your app.js file
 */

const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'app.js');

try {
    // Read the current app.js file
    let content = fs.readFileSync(appJsPath, 'utf8');
    
    // Replace all instances of db.query with safeDbQuery
    const updatedContent = content.replace(/\bdb\.query\(/g, 'safeDbQuery(');
    
    // Write the updated content back to the file
    fs.writeFileSync(appJsPath, updatedContent, 'utf8');
    
    console.log('✅ Successfully updated all db.query() calls to safeDbQuery() calls');
    console.log('📍 Updated file: app.js');
    
    // Count the number of replacements made
    const matches = content.match(/\bdb\.query\(/g);
    const count = matches ? matches.length : 0;
    console.log(`🔄 Replaced ${count} instances of db.query() with safeDbQuery()`);
    
} catch (error) {
    console.error('❌ Error updating app.js:', error.message);
}
