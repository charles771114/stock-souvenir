import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { processNotifications, verifyLineToken } from "./logic.ts";

// Mock Supabase Client
const createMockSupabase = (souvernis: any[], categories: any[] = []) => {
    return {
        from: (table: string) => ({
            select: () => ({
                gte: () => ({
                    lte: () => ({
                        order: () => Promise.resolve({ data: souvernis, error: null })
                    })
                }),
                or: () => ({
                    order: () => Promise.resolve({ data: souvernis, error: null })
                }),
                order: () => Promise.resolve({ data: categories, error: null }),
                eq: () => ({
                    maybeSingle: () => Promise.resolve({ data: null, error: null })
                })
            })
        })
    };
};

Deno.test("Notification Logic - Morning Run (09:00 AM)", async () => {
    const mockNow = new Date("2026-02-23T01:00:00Z"); // 09:00 AM UTC+8
    const mockSouvenirs = [
        { code: "2330", name: "台積電", last_buy_date: "2026-02-23", souvenir_item: "晶圓紀念品" },
        { code: "2303", name: "聯電", last_buy_date: "2026-02-24", souvenir_item: "商品卡 50元" }
    ];
    const mockCategories = [
        { id: 1, name: "超商商品卡", keywords: ["商品卡"] }
    ];

    const supabase = createMockSupabase(mockSouvenirs, mockCategories);
    const result = await processNotifications(supabase, mockNow, { LINE_CHANNEL_ACCESS_TOKEN: "test" });

    assertEquals(result.status, "success");
    // Verify high priority item is handled
    assertEquals(result.message?.includes("💳 【 高優先：亮點商品卡 】"), true);
    assertEquals(result.message?.includes("[2303] 聯電"), true);
    // Verify today's item is handled
    assertEquals(result.message?.includes("【 🔥 今天截止 🔥 】"), true);
    assertEquals(result.message?.includes("[2330] 台積電"), true);
});

Deno.test("Notification Logic - Afternoon Run (13:00 PM)", async () => {
    const mockNow = new Date("2026-02-23T05:00:00Z"); // 13:00 PM UTC+8
    const mockSouvenirs = [
        { code: "2330", name: "台積電", last_buy_date: "2026-02-23", souvenir_item: "晶圓紀念品" },
        { code: "2303", name: "聯電", last_buy_date: "2026-02-24", souvenir_item: "商品卡 50元" }
    ];

    const supabase = createMockSupabase(mockSouvenirs);
    const result = await processNotifications(supabase, mockNow, { LINE_CHANNEL_ACCESS_TOKEN: "test" });

    // Afternoon should ONLY show today's items
    assertEquals(result.message?.includes("台積電"), true);
    assertEquals(result.message?.includes("聯電"), false); // Should not appear in afternoon preview
});

Deno.test("Notification Logic - Recently Updated Alert", async () => {
    const mockNow = new Date("2026-02-23T01:00:00Z");
    const mockSouvenirs = [
        {
            code: "2454",
            name: "聯發科",
            last_buy_date: "2026-03-10",
            souvenir_item: "磁盤",
            updated_at: new Date().toISOString() // Recently updated
        }
    ];

    const supabase = createMockSupabase(mockSouvenirs);
    const result = await processNotifications(supabase, mockNow, { LINE_CHANNEL_ACCESS_TOKEN: "test" });

    // Should appear in "資料更新提醒" section even if > 7 days away
    assertEquals(result.message?.includes("📢 【 資料更新提醒 】"), true);
    assertEquals(result.message?.includes("聯發科"), true);
});

Deno.test("Notification Logic - Verify LINE Token", async () => {
    // Mock global fetch
    const originalFetch = globalThis.fetch;
    globalThis.fetch = ((url: string) => {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ client_id: "test_client", expires_in: 3600, scope: "profile" })
        });
    }) as any;

    const result = await verifyLineToken("test_token");
    assertEquals(result.valid, true);
    assertEquals(result.client_id, "test_client");

    // Restore fetch
    globalThis.fetch = originalFetch;
});

Deno.test("Notification Logic - Category Badge Support", async () => {
    const mockNow = new Date("2026-02-23T01:00:00Z");
    const mockSouvenirs = [
        { code: "1234", name: "測試公司", last_buy_date: "2026-02-23", souvenir_item: "尚未公布", category_id: 1 }
    ];
    const mockCategories = [
        { id: 1, name: "超商商品卡", keywords: ["商品卡"] }
    ];

    const supabase = createMockSupabase(mockSouvenirs, mockCategories);
    const result = await processNotifications(supabase, mockNow, { LINE_CHANNEL_ACCESS_TOKEN: "test" });

    // Should correctly show "超商商品卡" even if item is "尚未公布" because of category_id
    assertEquals(result.message?.includes("超商商品卡 - 尚未公布"), true);
});
