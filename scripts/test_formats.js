
const todayStr = '2026-02-13';
const APP_URL = 'https://stock-souvenir.vercel.app';

function testLineNotifyFormat() {
    const messageParts = [];

    // Simulate sorted diffs
    const itemsByDiff = {
        0: [{ code: '2330', name: '台積電', souvenir_item: '環保袋', last_buy_date: '2026-02-13' }],
        1: [{ code: '2317', name: '鴻海', souvenir_item: '充電盤', last_buy_date: '2026-02-14' }]
    };

    const sortedDiffs = [1, 0];

    for (const diff of sortedDiffs) {
        const list = itemsByDiff[diff];
        if (messageParts.length > 0) messageParts.push('\n---\n');

        let header = '';
        if (diff === 0) header = '【 🔥 今天截止 🔥 】';
        else if (diff === 1) header = '【 ⏳ 明天截止 】';

        messageParts.push(header);

        for (const item of list) {
            messageParts.push(`[${item.code}] ${item.name}\n其他 - ${item.souvenir_item}\n📅 最後買進日：${item.last_buy_date}`);
        }
    }

    // Updated Footer
    messageParts.push('\n---\n點擊查看您的庫存狀態：\nhttps://stock-souvenir.vercel.app/gifts');

    const fullMessage = `📢 股東會紀念品最後買進日提醒\n\n${messageParts.join('\n\n')}`;

    console.log('--- line-notify Test ---');
    console.log(fullMessage);
}

function testScraperNotificationFormat() {
    const currentItemsProcessed = 44;
    const lastItemsProcessed = 41;
    const scrapSource = 'HTML';

    // Simulate added gifts with potential historical data and urgency
    const addedGifts = [
        {
            code: '6120',
            name: '達運',
            souvenir: '尚未公布',
            lastYearSouvenir: '統一商品卡35元 💳',
            lastBuyDate: todayStr, // Urgent: Today!
            daysLeft: 0
        },
        {
            code: '2330',
            name: '台積電',
            souvenir: '環保袋',
            lastYearSouvenir: null,
            lastBuyDate: '2026-03-27',
            daysLeft: 42
        }
    ];

    let notification = `✅ Gooddie 更新提醒 (${scrapSource})\n\n`;
    notification += `本次處理：${currentItemsProcessed} 筆\n`;

    if (lastItemsProcessed > 0) {
        notification += `上次處理：${lastItemsProcessed} 筆\n`;
        const diff = currentItemsProcessed - lastItemsProcessed;
        if (diff > 0) notification += `變化：+${diff} 筆 📈\n`;
    }

    if (addedGifts.length > 0) {
        notification += `\n🆕 新增項目：\n`;
        addedGifts.forEach(g => {
            notification += `📌 ${g.code} ${g.name}\n`;

            // Souvenir info
            if (g.souvenir === '尚未公布' && g.lastYearSouvenir) {
                notification += `  紀念品：尚未公布\n`;
                notification += `  (2025參考：${g.lastYearSouvenir})\n`;
            } else {
                notification += `  紀念品：${g.souvenir}\n`;
            }

            // Date & Urgency info
            if (g.daysLeft === 0) {
                notification += `  最後買進日：🔥 今天截止 (⚠️ 請於 13:30 前買進)\n\n`;
            } else {
                notification += `  最後買進日：${g.lastBuyDate} (還有${g.daysLeft}天)\n\n`;
            }
        });
    }

    notification += `\n執行時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`;
    notification += `\n\n點擊查看您的庫存狀態：${APP_URL}/gifts`;

    console.log('\n--- scraper-notification Test (with historical reference) ---');
    console.log(notification);
}

testLineNotifyFormat();
testScraperNotificationFormat();
