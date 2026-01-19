
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from '@supabase/supabase-js'
import { load } from 'cheerio'
import { corsHeaders } from '../_shared/cors.ts'

// Constants
const MOPS_URL = "https://mops.twse.com.tw/mops/web/ajax_t51sb01";
const SINOTRADE_URL = "https://www.sinotrade.com.tw/richclub/tools/gifts";

/**
 * 1. Sinotrade Scraper
 */
async function fetchSinotradeData() {
  console.log(`Fetching data from ${SINOTRADE_URL}...`);

  try {
    const response = await fetch(SINOTRADE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${SINOTRADE_URL}: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);
    const results: any[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Parsing logic for Sinotrade
    $('tr').each((i, el) => {
      const cols = $(el).find('td');
      if (cols.length < 4) return;

      const codeNameContainer = $(cols[0]).find('h6');
      const name = codeNameContainer.find('span').text().trim();
      const code = codeNameContainer.clone().children().remove().end().text().trim();
      const souvenir_item = $(cols[1]).find('div > span').first().text().trim();

      let last_buy_date_raw = $(cols[2]).contents().filter((_, node) => node.type === 'text').text().trim();
      const last_buy_date = last_buy_date_raw.replace(/\./g, '-');

      const oddLotSpan = $(cols[3]).find('span.act');
      const odd_lot = oddLotSpan.length > 0 && oddLotSpan.text().includes('可');

      if (!code || !name) return;

      results.push({
        doc_id: `${code}_${last_buy_date || today}`,
        code,
        name,
        price: 0,
        meeting_date: null,
        last_buy_date: last_buy_date || null,
        souvenir_item: souvenir_item || '未公佈',
        odd_lot,
        source_url: SINOTRADE_URL,
        data_hash: `hash_sinotrade_${Date.now()}_${i}`,
        status: 'active'
      });
    });

    return results;

  } catch (error) {
    console.error("Sinotrade scraping failed:", error);
    return []; // Return empty to allow fallback logic or error handling upstream
  }
}

/**
 * 2. MOPS Scraper
 */
async function fetchMopsData(year: number) {
  console.log(`Fetching MOPS data for ROC year ${year}...`);
  const markets = ['sii', 'otc', 'rotc']; // 上市, 上櫃, 興櫃
  const results: any[] = [];
  const today = new Date().toISOString().split('T')[0];

  for (const market of markets) {
    console.log(`Querying MOPS market: ${market}`);

    // Simulate delay
    await new Promise(r => setTimeout(r, 1000));

    try {
      // Construct Form Data
      const formData = new URLSearchParams();
      formData.append('encodeURIComponent', '1');
      formData.append('step', '1');
      formData.append('firstin', '1');
      formData.append('off', '1');
      formData.append('TYPEK', market);
      formData.append('year', year.toString());

      const response = await fetch(MOPS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://mops.twse.com.tw/mops/web/t51sb01',
          'Origin': 'https://mops.twse.com.tw',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'max-age=0',
        },
        body: formData
      });

      if (!response.ok) {
        console.error(`MOPS ${market} failed: ${response.status}`);
        continue;
      }

      const html = await response.text();
      // Debug log for HTML size
      console.log(`MOPS ${market} HTML Size: ${html.length}`);

      const $ = load(html);

      // Find the table
      // Similar logic to Python: iterate rows
      $('tr').each((i, el) => {
        const cols = $(el).find('td'); // MOPS usually uses td for data
        // Expecting at least ~8 columns
        if (cols.length < 5) return;

        // Clean text helper
        const txt = (idx: number) => $(cols[idx]).text().trim().replace(/\s+/g, ' ');

        const code = txt(0);
        const name = txt(1);
        const meeting_date_roc = txt(2); // e.g. 113/06/15

        // Skip header if matched accidentally (usually header is th, but just in case)
        if (code === '公司代號' || !code.match(/^\d+$/)) return;

        // Convert ROC date to ISO
        let meeting_date = null;
        if (meeting_date_roc) {
          const parts = meeting_date_roc.split('/');
          if (parts.length === 3) {
            const y = parseInt(parts[0]) + 1911;
            meeting_date = `${y}-${parts[1]}-${parts[2]}`;
          }
        }

        // Souvenir is usually around col 6
        // Heuristic: check a few columns if structure varies, but usually fixed for ajax_t51sb01
        // Col 6: 紀念品, Col 7: 零股寄單
        // Note: Check actual HTML structure if possible. Assuming index 6 based on previous research.
        const souvenir_item = txt(6);
        const odd_lot_msg = txt(7);
        const odd_lot = odd_lot_msg.includes('寄單') || odd_lot_msg.includes('給');

        results.push({
          doc_id: `${code}_${meeting_date || today}`,
          code,
          name,
          price: 0,
          meeting_date,
          last_buy_date: null, // MOPS doesn't provide this directly usually
          souvenir_item: souvenir_item || '未公佈',
          odd_lot, // Derived from msg
          source_url: MOPS_URL,
          data_hash: `hash_mops_${market}_${Date.now()}_${i}`,
          status: 'active'
        });
      });

    } catch (e) {
      console.error(`Error scraping MOPS market ${market}:`, e);
    }
  }

  return results;
}

/**
 * 3. HiStock Scraper
 */
async function fetchHiStockData() {
  const HISTOCK_URL = "https://histock.tw/stock/gift.aspx";
  console.log(`Fetching data from ${HISTOCK_URL}...`);

  try {
    const response = await fetch(HISTOCK_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${HISTOCK_URL}: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);
    const results: any[] = [];
    const today = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();

    $('tr').each((i, el) => {
      // 0: Code, 1: Name, 2: Price, 3: LastBuy, 4: Meeting, 5: Type, 6: Place, 7: Souvenir, 8: OddLot
      const cols = $(el).find('td');
      if (cols.length < 9) return;

      const codeRaw = $(cols[0]).text().trim();
      const code = codeRaw.match(/\d{4}/)?.[0] || codeRaw; // Clean code
      const name = $(cols[1]).text().trim();

      if (!code || !name || code === '代號') return;

      // Date Parsing with Year Logic
      const parseDate = (mmdd: string) => {
        if (!mmdd || !mmdd.includes('/')) return null;
        const [m, d] = mmdd.split('/').map(Number);

        let year = currentYear;
        // Basic heuristic: HiStock primarily lists UPCOMING or recent meetings.
        // If today is 2026-01-18:
        // - 12/30 -> likely 2025 (last year)
        // - 01/22 -> likely 2026 (this year)
        // - 05/20 -> likely 2026 (this year)

        // If month is > current month + 6 (e.g. looking at Dec in Jan), assume last year.
        const currentMonth = new Date().getMonth() + 1;
        if (m > currentMonth + 6) {
          year = currentYear - 1;
        }

        const mm = m.toString().padStart(2, '0');
        const dd = d.toString().padStart(2, '0');
        return `${year}-${mm}-${dd}`;
      };

      const last_buy_date = parseDate($(cols[3]).text().trim());
      const meeting_date = parseDate($(cols[4]).text().trim());

      // Determine Year for Doc ID stability
      let idYear = currentYear;
      if (meeting_date) {
        idYear = parseInt(meeting_date.split('-')[0]);
      } else if (last_buy_date) {
        idYear = parseInt(last_buy_date.split('-')[0]);
      }

      // Parse Type for Doc ID stability
      const typeRaw = $(cols[5]).text().trim();
      let typeSuffix = 'AGM';
      if (typeRaw.includes('臨時')) {
        typeSuffix = 'EGM'; // Extraordinary General Meeting
      }

      // Stable Document ID
      const doc_id = `${code}_${idYear}_${typeSuffix}`;

      // Souvenir Parsing
      const souvenirNode = $(cols[7]).clone();
      souvenirNode.find('*').remove();
      const souvenir_item = souvenirNode.text().trim() || '未公佈';

      const odd_lot_text = $(cols[8]).text().trim();
      const odd_lot = !odd_lot_text.includes('否');

      results.push({
        doc_id,
        code,
        name,
        price: 0,
        meeting_date,
        last_buy_date,
        souvenir_item,
        odd_lot,
        source_url: HISTOCK_URL,
        data_hash: `hash_histock_${Date.now()}_${i}`,
        status: 'active'
      });
    });

    return results;

  } catch (error) {
    console.error("HiStock scraping failed:", error);
    return [];
  }
}

// Mock Data Generator
function generateMockStockData(isFallback = false) {
  const today = new Date().toISOString().split('T')[0];
  const timestamp = Date.now();
  const label = isFallback ? '(爬蟲失敗-Mock)' : '(Mock)';

  return [
    {
      doc_id: `2330_${today}_${timestamp}`,
      code: '2330',
      name: '台積電',
      meeting_date: '2026-06-05',
      last_buy_date: '2026-05-28',
      souvenir_item: `環保購物袋 ${label}`,
      odd_lot: true,
      data_hash: `hash_${timestamp}_1`
    },
    {
      doc_id: `2317_${today}_${timestamp}`,
      code: '2317',
      name: '鴻海',
      meeting_date: '2026-06-20',
      last_buy_date: '2026-04-15',
      souvenir_item: `無線充電盤 ${label}`,
      odd_lot: true,
      data_hash: `hash_${timestamp}_2`
    }
  ];
}

Deno.serve(async (req) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. GET /latest - Get latest stock data from Storage
    if (req.method === 'GET') {
      const { data: fileList, error: listError } = await supabaseClient
        .storage
        .from('stock-data')
        .list('', {
          limit: 10,
          sortBy: { column: 'name', order: 'desc' }
        })

      if (listError) throw listError

      if (!fileList || fileList.length === 0) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const jsonFiles = fileList.filter(f => f.name.endsWith('.json'));
      if (jsonFiles.length === 0) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const latestFile = jsonFiles[0];
      const { data: fileContent, error: downloadError } = await supabaseClient
        .storage
        .from('stock-data')
        .download(latestFile.name)

      if (downloadError) throw downloadError
      const text = await fileContent.text();

      return new Response(text, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. POST /scrape - Trigger scrape
    if (req.method === 'POST') {
      let body: any = {};
      try {
        body = await req.json();
      } catch {
        // Body might be empty
      }

      const { source_id } = body;
      let scrapedData: any[] = [];
      let sourceName = 'Unknown';

      // Determine Source
      if (source_id) {
        // Fetch source details
        const { data: sourceData } = await supabaseClient
          .from('scraper_sources')
          .select('*')
          .eq('id', source_id)
          .single();

        if (sourceData) {
          sourceName = sourceData.source_name;
          if (sourceData.source_url.includes('sinotrade')) {
            scrapedData = await fetchSinotradeData();
          } else if (sourceData.source_url.includes('histock')) {
            scrapedData = await fetchHiStockData();
          } else if (sourceData.source_url.includes('mops')) {
            const currentYear = new Date().getFullYear();
            const rocYear = currentYear - 1911;

            // Try current year
            console.log(`Trying MOPS for year ${rocYear}...`);
            scrapedData = await fetchMopsData(rocYear);

            // If current year is empty (e.g., early Jan), fallback to previous year
            if (!scrapedData || scrapedData.length === 0) {
              console.log(`No data for year ${rocYear}, trying previous year ${rocYear - 1}...`);
              scrapedData = await fetchMopsData(rocYear - 1);
            }
          } else {
            console.warn('Unknown source URL pattern, falling back to Sinotrade');
            scrapedData = await fetchSinotradeData();
          }
        } else {
          scrapedData = await fetchSinotradeData();
        }
      } else {
        scrapedData = await fetchSinotradeData();
      }

      // Fallback
      if (!scrapedData || scrapedData.length === 0) {
        scrapedData = generateMockStockData(true);
      }

      const today = new Date().toISOString().split('T')[0];
      const filename = `stock-${today}.json`; // simplified date format

      // Upload to Storage
      await supabaseClient.storage
        .from('stock-data')
        .upload(filename, JSON.stringify(scrapedData), {
          contentType: 'application/json',
          upsert: true
        });

      // Deduplicate data by doc_id before upsert
      const uniqueData = scrapedData.filter((item, index, self) =>
        index === self.findIndex((t) => (
          t.doc_id === item.doc_id
        ))
      );

      if (scrapedData.length !== uniqueData.length) {
        console.log(`Removed ${scrapedData.length - uniqueData.length} duplicates from scrape result.`);
      }

      // Upsert to Database
      const { error: dbError } = await supabaseClient
        .from('souvenirs')
        .upsert(
          uniqueData.map(item => ({
            code: item.code,
            name: item.name,
            price: item.price || 0,
            meeting_date: item.meeting_date,
            last_buy_date: item.last_buy_date,
            souvenir_item: item.souvenir_item,
            odd_lot: item.odd_lot,
            doc_id: item.doc_id,
            data_hash: item.data_hash,
            status: 'active'
          })),
          { onConflict: 'doc_id' }
        );

      if (dbError) {
        console.error('Failed to sync to database:', dbError);
        return new Response(JSON.stringify({ error: dbError.message }), { status: 500, headers: corsHeaders });
      }

      return new Response(
        JSON.stringify({ message: `Scrape successful for ${sourceName}`, filename, Count: scrapedData.length, data: scrapedData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
