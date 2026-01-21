import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('fixtures/inventory.tsv');
console.log(`Reading file from ${filePath}`);

try {
    // 1. Mimic browser default (broken for this file?)
    console.log('--- Test 1: Original Logic (binary string, no codepage) ---');
    const fileContent = fs.readFileSync(filePath, 'binary'); // mimics FileReader.readAsBinaryString
    const workbook1 = XLSX.read(fileContent, { type: 'binary' });
    const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
    const json1 = XLSX.utils.sheet_to_json(sheet1);
    console.log('Result (first item):', JSON.stringify(json1[0], null, 2));

    // 2. Fix attempt: Add codepage: 65001 (UTF-8)
    console.log('\n--- Test 2: Fix Attempt (binary string, codepage: 65001) ---');
    const workbook2 = XLSX.read(fileContent, { type: 'binary', codepage: 65001 });
    const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
    const json2 = XLSX.utils.sheet_to_json(sheet2);
    console.log('Result (first item):', JSON.stringify(json2[0], null, 2));

} catch (e) {
    console.error('Error:', e);
}
