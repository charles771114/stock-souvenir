import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedSouvenir {
    code: string;
    name: string;
    souvenir_item: string;
    meeting_date: string; // ISO Date string YYYY-MM-DD
    last_buy_date?: string | null;
    price?: number | null;
    meeting_type?: string;
    location?: string;
    odd_lot?: boolean;
    doc_id: string;
    status: string;
}

// Helper to normalize headers from various accepted formats to database keys
const KEY_MAPPING: Record<string, string> = {
    '代號': 'code',
    '股票代號': 'code',
    'Code': 'code',
    'Stock Code': 'code',

    '名稱': 'name',
    '公司名稱': 'name',
    'Name': 'name',
    'Company Name': 'name',
    '股名': 'name',

    '紀念品': 'souvenir_item',
    '物品': 'souvenir_item',
    'Item': 'souvenir_item',
    'Souvenir': 'souvenir_item',
    '紀念品名稱': 'souvenir_item',

    '開會日期': 'meeting_date',
    '股東會日期': 'meeting_date',
    'Date': 'meeting_date',
    'Meeting Date': 'meeting_date',

    '最後買進日': 'last_buy_date',
    'Last Buy Date': 'last_buy_date',
    'Last Date': 'last_buy_date',

    '股價': 'price',
    'Price': 'price',

    '股東會性質': 'meeting_type',
    '性質': 'meeting_type',
    'Type': 'meeting_type',
    'Meeting Type': 'meeting_type',

    '開會地點': 'location',
    '地點': 'location',
    'Location': 'location',
    'Place': 'location',

    '零股': 'odd_lot',
    'Odd Lot': 'odd_lot',
};

// Helper: Force specific year on a date string (YYYY-MM-DD)
const applyYear = (dateStr: string | null, year?: string): string | null => {
    if (!dateStr || !year) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        // parts[0] is year, replace it
        return `${year}-${parts[1]}-${parts[2]}`;
    }
    return dateStr;
};

const formatDate = (val: any): string | null => {
    if (!val) return null;
    // Handle Excel serial date
    if (typeof val === 'number') {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0];
    }
    // Handle strings like 2024/05/20 or 113/05/20 (Taiwan year)
    let str = val.toString().trim();

    // Taiwan Year conversion (e.g. 113/05/01 -> 2024-05-01)
    const twDateMatch = str.match(/^(\d{2,3})[\/.-](\d{1,2})[\/.-](\d{1,2})$/);
    if (twDateMatch) {
        const year = parseInt(twDateMatch[1]);
        if (year < 1911) { // Likely TW year
            const fullYear = year + 1911;
            return `${fullYear}-${twDateMatch[2].padStart(2, '0')}-${twDateMatch[3].padStart(2, '0')}`;
        }
    }

    const date = new Date(str);
    if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
    }
    return null;
};

const parseBoolean = (val: any): boolean => {
    if (!val) return false;
    if (val === true) return true;
    const s = val.toString().trim().toLowerCase();
    return ['yes', 'y', 'true', '1', '是', 'v', '有'].includes(s);
};

export const parseFile = async (file: File, targetYear?: string): Promise<ParsedSouvenir[]> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    let rawData: any[] = [];

    try {
        if (extension === 'csv') {
            rawData = await parseCSV(file);
        } else if (['xlsx', 'xls'].includes(extension || '')) {
            rawData = await parseExcel(file);
        } else {
            throw new Error('Unsupported file format. Please use CSV, XLSX, or XLS.');
        }

        return normalizeData(rawData, targetYear);
    } catch (err) {
        console.error('File parsing error:', err);
        throw err;
    }
};

const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            encoding: 'UTF-8', // default request
            complete: (results) => resolve(results.data),
            error: (error) => reject(error),
        });
    });
};

const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(sheet);
                resolve(json);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsBinaryString(file);
    });
};

const normalizeData = (data: any[], targetYear?: string): ParsedSouvenir[] => {
    return data
        .map((row) => {
            const normalized: any = {};

            // 1. Key Mapping
            Object.keys(row).forEach((key) => {
                const trimmedKey = key.trim();
                const mappedKey = KEY_MAPPING[trimmedKey];
                if (mappedKey) {
                    normalized[mappedKey] = row[key];
                }
            });

            // 2. Data Cleaning & Validation
            if (!normalized.code) return null; // Mandatory

            // Date Handling
            let meetingDate = formatDate(normalized.meeting_date);
            if (!meetingDate) return null; // Mandatory for doc_id

            let lastBuyDate = formatDate(normalized.last_buy_date);

            // Apply Target Year IF Provided
            if (targetYear) {
                meetingDate = applyYear(meetingDate, targetYear);
                lastBuyDate = applyYear(lastBuyDate, targetYear);
            }

            normalized.meeting_date = meetingDate;
            normalized.last_buy_date = lastBuyDate;

            // Boolean Handling
            normalized.odd_lot = parseBoolean(normalized.odd_lot);

            // Price Handling
            if (normalized.price) {
                normalized.price = parseFloat(normalized.price);
                if (isNaN(normalized.price)) normalized.price = null;
            }

            // 3. Generate doc_id
            normalized.doc_id = `${normalized.code}_${normalized.meeting_date}`;

            // 4. Default Status
            normalized.status = 'active';

            return normalized as ParsedSouvenir;
        })
        .filter((item): item is ParsedSouvenir => item !== null);
};
