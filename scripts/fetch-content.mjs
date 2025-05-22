import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

import { fileURLToPath } from 'url';
import { fetchWikiPageHTML } from '../module/helpers/wiki.mjs';

import { conditions } from '../module/helpers/constants/generated/conditions.mjs';
import { magicalProperties } from '../module/helpers/constants/generated/magical-properties.mjs';
import { materialProperties } from '../module/helpers/constants/generated/material-properties.mjs';
import { properties } from '../module/helpers/constants/generated/properties.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.resolve(__dirname, '../module/content');


const writeModuleFile = (fileName, exportName, entries) => {
    const fileHeader = `// This file was auto-generated on ${new Date().toISOString().split('T')[0]} by scripts/fetch-content.mjs.\n// Do not edit manually.\n\n`;
    const lines = [`${fileHeader}export const ${exportName} = {\n`];

    for (const [key, value] of Object.entries(entries)) {
        lines.push(`  ${key}: {\n` +
            `    name: ${JSON.stringify(value.name)},\n` +
            `    id: ${JSON.stringify(key)},\n` +
            `    img: ${JSON.stringify(`systems/teriock/assets/${exportName}/${key}.svg`)},\n` +
            `    content: ${JSON.stringify(value.content)}\n  },`);
    }

    // Remove trailing comma on the last entry
    lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
    lines.push('};\n');

    fs.writeFileSync(path.join(contentDir, fileName), lines.join('\n'), 'utf8');
    console.log(`Wrote ${Object.keys(entries).length} entries to ${fileName}`);
};


const fetchContent = async (map, namespace) => {
    const results = {};

    for (const [key, name] of Object.entries(map)) {
        const pageTitle = `${namespace}:${name}`;
        console.log(`Fetching HTML for "${pageTitle}"...`);
        const html = await fetchWikiPageHTML(pageTitle);
        if (html) {
            const dom = new JSDOM(html);
            const document = dom.window.document;
            document.querySelectorAll('.ability-sub-container').forEach(el => el.remove());

            results[key] = {
                name,
                content: document.body.innerHTML.trim(),
            };
        } else {
            console.warn(`No HTML returned for "${pageTitle}"`);
        }
    }

    return results;
};


const run = async () => {
    try {
        const datasets = [
            { data: conditions, namespace: 'Condition', exportName: 'conditions', file: 'conditions.mjs' },
            { data: magicalProperties, namespace: 'Property', exportName: 'magicalProperties', file: 'magical-properties.mjs' },
            { data: materialProperties, namespace: 'Property', exportName: 'materialProperties', file: 'material-properties.mjs' },
            { data: properties, namespace: 'Property', exportName: 'properties', file: 'properties.mjs' },
        ];

        for (const { data, namespace, exportName, file } of datasets) {
            const content = await fetchContent(data, namespace);
            writeModuleFile(file, exportName, content);
        }
    } catch (err) {
        console.error('Error fetching content:', err);
    }
};

run();
