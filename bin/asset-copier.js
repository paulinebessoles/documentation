#!/usr/bin/env node
// Asset copier script for Decidim documentation
//
// Copies images and attachments from English modules to other language directories
// Only copies files that don't already exist in the destination
//

const fs = require('fs');
const path = require('path');

// Get all directories in a given path
//
// @param {string} dirPath - The directory path to read
// @returns {Array<string>} Array of directory names
function getDirectories(dirPath) {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  } catch (error) {
    console.error(`Error reading directory ${dirPath}: ${error.message}`);
    return [];
  }
}

// Get all files recursively from a directory
//
// @param {string} dirPath - The directory path to read
// @param {Array<string>} fileList - Accumulator for recursive calls
// @returns {Array<string>} Array of file paths
function getFilesRecursively(dirPath, fileList = []) {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    files.forEach(file => {
      const filePath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        getFilesRecursively(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    });

    return fileList;
  } catch (error) {
    console.error(`Error reading directory ${dirPath}: ${error.message}`);
    return fileList;
  }
}

// Copy a file from source to destination if it doesn't exist
//
// @param {string} sourcePath - The source file path
// @param {string} destPath - The destination file path
// @returns {boolean} True if file was copied, false otherwise
function copyFileIfNotExists(sourcePath, destPath) {
  if (fs.existsSync(destPath)) {
    return false;
  }

  try {
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied: ${sourcePath} -> ${destPath}`);
    return true;
  } catch (error) {
    console.error(`Error copying file ${sourcePath} to ${destPath}: ${error.message}`);
    return false;
  }
}

// Copy assets from English modules to other language directories
//
// @param {string} baseDir - The base documentation directory (default: "docs")
function copyAssets(baseDir = "docs") {
  const sourceDir = path.join(baseDir, "en", "modules");

  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory does not exist: ${sourceDir}`);
    return;
  }

  // Get all language directories except English
  const languageDirs = getDirectories(baseDir).filter(lang => lang !== "en");

  if (languageDirs.length === 0) {
    console.log("No destination language directories found.");
    return;
  }

  console.log(`Found language directories: ${languageDirs.join(", ")}`);

  // Get all modules in the English directory
  const modules = getDirectories(sourceDir);

  if (modules.length === 0) {
    console.log("No modules found in English directory.");
    return;
  }

  console.log(`Found modules: ${modules.join(", ")}`);

  let totalCopied = 0;
  let totalSkipped = 0;

  // Process each module
  modules.forEach(module => {
    const assetsPath = path.join(sourceDir, module, "assets");

    if (!fs.existsSync(assetsPath)) {
      return;
    }

    // Get all files in the assets directory recursively
    const assetFiles = getFilesRecursively(assetsPath);

    if (assetFiles.length === 0) {
      return;
    }

    console.log(`\nProcessing module: ${module} (${assetFiles.length} files)`);

    // Copy to each language directory
    languageDirs.forEach(lang => {
      const destModuleAssetsPath = path.join(baseDir, lang, "modules", module, "assets");

      assetFiles.forEach(sourceFile => {
        // Get the relative path within assets
        const relativePath = path.relative(assetsPath, sourceFile);
        const destFile = path.join(destModuleAssetsPath, relativePath);

        if (copyFileIfNotExists(sourceFile, destFile)) {
          totalCopied++;
        } else {
          totalSkipped++;
        }
      });
    });
  });

  console.log("\n********************************");
  console.log(`Summary:`);
  console.log(`  Files copied: ${totalCopied}`);
  console.log(`  Files skipped (already exist): ${totalSkipped}`);
  console.log("********************************");
}

(async function() {
  console.log("********************************");
  console.log("Starting asset copy process...");
  console.log("********************************");

  const BASE_DIR = "docs";
  copyAssets(BASE_DIR);
}());

