import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import os
from datetime import datetime

# -----------------------------------------------------------------------------
# 設定與常數 (Configuration)
# -----------------------------------------------------------------------------
MOPS_URL = "https://mops.twse.com.tw/mops/web/ajax_t51sb01"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# 市場類型代號對照
MARKET_TYPES = {
    'sii': '上市',
    'otc': '上櫃',
    'rotc': '興櫃'
}

# -----------------------------------------------------------------------------
# 核心函式 (Core Functions)
# -----------------------------------------------------------------------------

def get_souvenir_data(year, market_type):
    """
    抓取指定年度與市場類型的股東會紀念品資料
    
    Args:
        year (int): 民國年 (例如 113)
        market_type (str): 市場代號 ('sii', 'otc', 'rotc')
        
    Returns:
        list: 包含字典資料的列表
    """
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 正在抓取 {year} 年 {MARKET_TYPES[market_type]} ({market_type}) 資料...")
    
    # 建構表單資料
    # MOPS 網站 ajax_t51sb01 所需參數
    form_data = {
        'encodeURIComponent': '1',
        'step': '1',
        'firstin': '1',
        'off': '1',
        'TYPEK': market_type,
        'year': str(year),
    }

    try:
        # 發送 POST 請求
        response = requests.post(MOPS_URL, data=form_data, headers=HEADERS)
        response.encoding = 'utf-8' # 強制設定編碼
        
        # 檢查回應狀態
        if response.status_code != 200:
            print(f"  [Error] 請求失敗，狀態碼: {response.status_code}")
            return []

        # 解析 HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 尋找表格
        # 通常資料在 class 為 'hasBorder' 或特定結構的 table 中
        # 這裡嘗試尋找包含特定表頭的表格
        tables = soup.find_all('table')
        target_table = None
        
        for table in tables:
            if '公司代號' in table.text and '紀念品' in table.text:
                target_table = table
                break
        
        if not target_table:
            print("  [Warning] 未找到目標表格，可能該年度/市場無資料或網站改版。")
            return []

        # 解析表格列 (Rows)
        data_list = []
        rows = target_table.find_all('tr')
        
        # 略過表頭，從內容開始
        # 注意: 實際表格結構可能複雜，需要過濾 header
        for row in rows:
            cols = row.find_all(['td', 'th'])
            
            # 簡單檢查：如果欄位數不足或看起來像標題，跳過
            # 通常資料列會有: 公司代號, 公司名稱, ..., 股東會日期, ..., 紀念品, ...
            # 觀察 MOPS 結構，欄位大約有 10+ 個
            if len(cols) < 5: 
                continue
                
            # 提取文字並去除空白
            row_text = [ele.text.strip() for ele in cols]
            
            # 過濾掉表頭列 (包含 "公司代號" 的列)
            if '公司代號' in row_text[0]:
                continue
            
            # 保護：確保索引也不會超出範圍
            # 假設欄位順序 (視實際 MOPS 回傳而定，這部分需測試驗證，以下為常見結構)
            # 0: 公司代號, 1: 公司名稱, ... (需動態調整)
            # 觀察到的常見對應：
            # col 0: 公司代號
            # col 1: 公司名稱
            # col 2: 股東會日期 (113/06/15)
            # ...
            # 紀念品欄位通常在後面，需依實際 HTML 確認
            
            # 使用更彈性的方式：取出所有資料，之後存入 DataFrame 清洗
            # 這裡我們嘗試映射關鍵欄位
            # 註：MOPS 該頁面結構通常是：
            # 代號 | 名稱 | ... | 開會日期 | ... | 紀念品 | ...
            
            # 此處為確保欄位對應正確，先暫存原始資料，也可以針對重點欄位抓取
            # 這裡假設第 0, 1 欄是代號名稱
            
            # 尋找紀念品欄位的索引 (通常比較難固定，我們先抓全部存 CSV 讓使用者篩選，或嘗試抓特定欄)
            # 根據經驗：ajax_t51sb01 的欄位依序常為：
            # 0:代號 1:名稱 2:股東會日期 3:停止過戶起 4:停止過戶迄 5:電子投票 6:紀念品 7:零股寄單...
            
            limit = len(row_text)
            company_code = row_text[0] if limit > 0 else ""
            company_name = row_text[1] if limit > 1 else ""
            meeting_date = row_text[2] if limit > 2 else ""
            
            # 嘗試尋找紀念品欄位 (heuristic: 長度較長的欄位或在特定位置)
            # 根據 MOPS 目前結構，紀念品通常在第 6 欄 (index 6, 0-based)
            # 零股寄單通常在第 7 欄
            souvenir = row_text[6] if limit > 6 else ""
            odd_lot = row_text[7] if limit > 7 else ""
            
            # 資料清洗：將全形轉半形、移除多餘空白
            souvenir = souvenir.replace('\u3000', ' ').replace('\n', ' ')
            
            entry = {
                'Market': MARKET_TYPES[market_type],
                'Code': company_code,
                'Name': company_name,
                'MeetingDate': meeting_date,
                'Souvenir': souvenir,
                'OddLotMsg': odd_lot # 零股寄單說明
            }
            data_list.append(entry)
            
        print(f"  [Success] 抓取到 {len(data_list)} 筆資料")
        return data_list

    except Exception as e:
        print(f"  [Error] 發生例外狀況: {e}")
        return []

def main():
    # 1. 詢問參數
    # year_input = input("請輸入查詢年份 (民國年, 例如 113): ")
    # 為了方便測試，這裡預設 113 (2024年)，實際使用可改為 input
    current_roc_year = datetime.now().year - 1911
    # 若現在是年初，可能要查去年的，或今年的
    target_year = current_roc_year 
    
    print(f"=== 啟動 MOPS 股東會紀念品爬蟲 (年份: {target_year}) ===")
    
    all_data = []

    # 2. 遍歷所有市場類型
    for market_code in MARKET_TYPES.keys():
        data = get_souvenir_data(target_year, market_code)
        all_data.extend(data)
        
        # 每次請求間延遲 2 秒 (需求規格)
        print("  休息 2 秒...")
        time.sleep(2)

    # 3. 輸出結果
    if all_data:
        df = pd.DataFrame(all_data)
        
        # 欄位重新命名與排序
        df = df[['Code', 'Name', 'MeetingDate', 'Souvenir', 'OddLotMsg', 'Market']]
        df.columns = ['公司代號', '公司名稱', '股東會日期', '紀念品內容', '零股資格', '市場別']
        
        # 建立 output 資料夾
        output_dir = 'output'
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{output_dir}/stock_souvenirs_{target_year}_{timestamp}.csv"
        
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"\n[Done] 抓取完成，總筆數: {len(df)}")
        print(f"檔案已儲存至: {filename}")
        
        # -------------------------------------------------------------------------
        # Supabase Integration Snippet (Strategy Decision)
        # -------------------------------------------------------------------------
        # 關於 "是否抓好檔案塞到 Supabase":
        # 決策: 是的，可以。建議此 Python 腳本在本地或 CI 環境執行，抓取後直接寫入 Supabase。
        # 因為 Supabase Edge Functions 是 Deno (JS/TS)，不適合直接跑 Python。
        # 
        # 使用方式 (範例程式碼，需安裝 supabase 套件: pip install supabase):
        # 
        # from supabase import create_client
        # url = "YOUR_SUPABASE_URL"
        # key = "YOUR_SUPABASE_SERVICE_ROLE_KEY" # 注意資安，不要 commit key
        # supabase = create_client(url, key)
        # 
        # records = df.to_dict(orient='records')
        # # 假設 Supabase 有一個 table 叫做 'souvenirs'
        # # 需要處理 upsert 邏輯 (例如以 '公司代號' + '股東會日期' 為 unique key)
        # try:
        #     data = supabase.table('souvenirs').upsert(records).execute()
        #     print("成功上傳至 Supabase")
        # except Exception as e:
        #     print(f"上傳失敗: {e}")
        # -------------------------------------------------------------------------

    else:
        print("\n[Result] 未抓取到任何資料。")

if __name__ == "__main__":
    main()
