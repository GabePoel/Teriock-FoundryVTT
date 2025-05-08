const fs = require('fs');
const path = require('path');

// REAL file path on disk
const actualDir = path.resolve(__dirname, '..', 'templates');

// FOUNDY VTT virtual path (used in loadTemplates)
const virtualBase = 'systems/teriock/templates';

const outputFile = path.resolve(__dirname, '..', 'module', 'helpers', 'templates.mjs');

function getHandlebarsFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) {
        console.error(`Directory not found: ${dir}`);
        process.exit(1);
    }

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            getHandlebarsFiles(fullPath, fileList);
        } else if (file.endsWith('.hbs')) {
            // Get relative path from actualDir
            const relativePath = path.relative(actualDir, fullPath).replace(/\\/g, '/');
            const virtualPath = `${virtualBase}/${relativePath}`;
            fileList.push(`'${virtualPath}'`);
        }
    }

    return fileList;
}

function generateTemplatePreloadFunction(templatePaths) {
    return `/**
 * Auto-generated template preload list.
 * Run 'node scripts/generate-template-list.js' to update.
 */
export const preloadHandlebarsTemplates = async function () {
  return foundry.applications.handlebars.loadTemplates([
    ${templatePaths.join(',\n    ')}
  ]);
};\n`;
}

function main() {
    console.log(`Scanning directory: ${actualDir}`);
    const templatePaths = getHandlebarsFiles(actualDir);
    const outputContent = generateTemplatePreloadFunction(templatePaths);

    fs.writeFileSync(outputFile, outputContent, 'utf8');
    console.log(`templates.mjs updated with ${templatePaths.length} templates.`);
}

main();
