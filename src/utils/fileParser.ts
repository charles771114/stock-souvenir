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

    // '股價': 'price',
    // 'Price': 'price',

    '股東會性質': 'meeting_type',
    '性質': 'meeting_type',
    'Type': 'meeting_type',
    'Meeting Type': 'meeting_type',

    '開會地點': 'location',
    '地點': 'location',
    'Location': 'location',
    'Place': 'location',

    // '市場別': 'market_type',
    // 'Market': 'market_type',

    // '代領截止時間': 'proxy_deadline',
    // 'Proxy Deadline': 'proxy_deadline',

    '零股': 'odd_lot',
    'Odd Lot': 'odd_lot',

    // New keys from user feedback
    '開會時間': 'meeting_date',
    '開會性質': 'meeting_type',
    '最後過戶日': 'last_buy_date', // Sometimes mixed up, but robust to add variations
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

    // Handle Excel serial date (number or string-number)
    // Excel base date: Dec 30 1899 usually (25569 days offset from 1970-01-01)
    let numVal = Number(val);
    if (!isNaN(numVal) && numVal > 20000 && numVal < 60000 && typeof val !== 'object') {
        // It's likely an Excel serial date (e.g. 45000 is year 2023)
        // 25569 = 1970-01-01 in Excel serial
        const date = new Date(Math.round((numVal - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0];
    }

    // Handle strings like 2024/05/20 or 113/05/20 (Taiwan year) or 5/26/25 (US Short)
    let str = val.toString().trim();

    // Taiwan Year conversion (e.g. 113/05/01 -> 2024-05-01)
    const twDateMatch = str.match(/^(\d{2,3})[\/.-](\d{1,2})[\/.-](\d{1,2})$/);
    if (twDateMatch) {
        const p1 = parseInt(twDateMatch[1]);
        const p2 = parseInt(twDateMatch[2]);
        const p3 = parseInt(twDateMatch[3]);

        // Case 1: TW Year (e.g. 113) -> 2024
        if (p1 < 1911 && p1 > 100) { 
             const fullYear = p1 + 1911;
             return `${fullYear}-${p2.toString().padStart(2, '0')}-${p3.toString().padStart(2, '0')}`;
        }
        
        // Case 2: M/D/YY (e.g. 5/26/25) -> 2025-05-26
        // Heuristic: if p1 is small (<13) and p3 is small year (<100)
        // Note: This is ambiguous with YYYY/MM/DD if not careful, but usually YYYY is > 1000.
        if (p1 <= 12 && p3 < 100) {
            const fullYear = 2000 + p3;
            return `${fullYear}-${p1.toString().padStart(2, '0')}-${p2.toString().padStart(2, '0')}`;
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

export interface ParseResult {
    data: ParsedSouvenir[];
    errors: { row: number; reason: string; raw: any }[];
}

export const parseFile = async (file: File, targetYear?: string, encoding: string = 'UTF-8'): Promise<ParseResult> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    let rawData: any[] = [];

    try {
        if (extension === 'csv') {
            rawData = await parseCSV(file, encoding);
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

const parseCSV = (file: File, encoding: string = 'UTF-8'): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            encoding: encoding,
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

const normalizeData = (data: any[], targetYear?: string): ParseResult => {
    const validData: ParsedSouvenir[] = [];
    const errors: { row: number; reason: string; raw: any }[] = [];

    if (data.length > 0) {
        console.log('[Debug] Raw Data Keys (Row 0):', Object.keys(data[0]));
        console.log('[Debug] Raw Data Values (Row 0):', data[0]);
    }

    data.forEach((row, index) => {
        const normalized: any = {};
        const rowNum = index + 2; // Excel row number (1-based, +1 for header)

        try {
            // 1. Key Mapping
            Object.keys(row).forEach((key) => {
                const trimmedKey = key.trim();
                const mappedKey = KEY_MAPPING[trimmedKey];
                if (mappedKey) {
                    normalized[mappedKey] = row[key];
                }
            });

            // 2. Data Cleaning & Validation
            if (!normalized.code) {
                errors.push({ row: rowNum, reason: '缺少股票代碼 (Code missing)', raw: row });
                return;
            }

            // Date Handling
            let meetingDate = formatDate(normalized.meeting_date);
            if (!meetingDate) {
                errors.push({ row: rowNum, reason: `開會日期格式錯誤: ${normalized.meeting_date}`, raw: row });
                return; // Mandatory for doc_id
            }

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

            validData.push(normalized as ParsedSouvenir);
        } catch (e: any) {
            errors.push({ row: rowNum, reason: `解析例外: ${e.message}`, raw: row });
        }
    });

    return { data: validData, errors };
};
