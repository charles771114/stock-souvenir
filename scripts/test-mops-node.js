
const MOPS_URL_AJAX = "https://mops.twse.com.tw/mops/web/ajax_t51sb01";
const MOPS_URL_PAGE = "https://mops.twse.com.tw/mops/web/t51sb01";

async function testMops(year) {
    console.log(`[Node Test] Testing MOPS (Cookie Mode) for year ${year}...`);

    try {
        // 1. Visit the page first to get Cookies
        console.log('1. Visiting main page to get cookies...');
        const pageResp = await fetch(MOPS_URL_PAGE, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        // Extract cookies
        const rawCookies = pageResp.headers.get('set-cookie');
        console.log('Cookies received:', rawCookies ? 'Yes' : 'No');

        // Simple cookie parser if multiple set-cookie
        // Note: Node fetch handling of set-cookie list differs by version, usually a string or array
        // We just need to pass them back.
        let cookieHeader = '';
        if (rawCookies) {
            // If it's an array/string, we just use it.
            // For simple fetch in node 18+, we usually just need to grab the string.
            // However, rawCookies might be null if no cookies set.
            cookieHeader = rawCookies;
        }

        // 2. Make the AJAX request with the cookies
        console.log('2. Making AJAX request...');
        const params = new URLSearchParams();
        params.append('encodeURIComponent', '1');
        params.append('step', '1');
        params.append('firstin', '1');
        params.append('off', '1');
        params.append('TYPEK', 'sii');
        params.append('year', year.toString());

        const response = await fetch(MOPS_URL_AJAX, {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': MOPS_URL_PAGE,
                'Origin': 'https://mops.twse.com.tw',
                'Cookie': cookieHeader
            }
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Length: ${text.length}`);

        if (text.includes('紀念品')) {
            console.log('✅ Found "紀念品" keyword! Success!');
        } else {
            console.log('❌ Still failed.');
            const match = text.match(/<body>\s*(.*?)<BR>/s);
            if (match) console.log('Message:', match[1].trim());
        }

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

testMops(113);
