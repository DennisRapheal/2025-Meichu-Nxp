# Training History FastAPI Server

這是一個使用 FastAPI 建立的訓練歷史資料 API 服務器，可以與 MongoDB 資料庫進行互動。

## 功能特點

- ✅ 使用 FastAPI 建立高效能 REST API
- ✅ 支援 MongoDB 資料庫操作
- ✅ 自動生成 API 文檔 (Swagger UI)
- ✅ 資料驗證和序列化 (Pydantic)
- ✅ CORS 支援
- ✅ 錯誤處理和日誌記錄
- ✅ 環境變數配置

## 安裝和設置

### 1. 安裝 MongoDB

確保您已經安裝並運行了 MongoDB。

#### macOS (使用 Homebrew):
```bash
brew install mongodb-community
brew services start mongodb-community
```

#### Windows:
下載並安裝 [MongoDB Community Server](https://www.mongodb.com/try/download/community)

#### Linux (Ubuntu):
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 2. 安裝 Python 依賴

```bash
# 創建虛擬環境
python3 -m venv venv

# 激活虛擬環境
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\\Scripts\\activate

# 安裝依賴
pip install -r requirements.txt
```

### 3. 配置環境變數

編輯 `.env` 文件設置您的 MongoDB 連線：

```env
# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/
DATABASE_NAME=training_app
COLLECTION_NAME=training_history
PORT=8000
```

如果使用 MongoDB Atlas，請使用類似以下格式：
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

## 啟動服務器

### 方法 1：使用啟動腳本
```bash
./start_server.sh
```

### 方法 2：直接運行
```bash
python3 server.py
```

### 方法 3：使用 uvicorn
```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

## API 端點

服務器啟動後，您可以訪問以下端點：

### 基本端點
- `GET /` - 健康檢查
- `GET /docs` - Swagger UI API 文檔
- `GET /redoc` - ReDoc API 文檔

### 訓練歷史 API
- `GET /api/training-history` - 獲取所有訓練記錄
- `GET /api/training-history/{id}` - 獲取特定訓練記錄
- `POST /api/training-history` - 創建新訓練記錄
- `PUT /api/training-history/{id}` - 更新訓練記錄
- `DELETE /api/training-history/{id}` - 刪除訓練記錄

### 統計 API
- `GET /api/stats` - 獲取訓練統計資料

## API 使用範例

### 創建訓練記錄
```bash
curl -X POST "http://localhost:8000/api/training-history" \\
     -H "Content-Type: application/json" \\
     -d '{
       "time": "2025-01-19 14:30:00",
       "image": "https://example.com/image.jpg",
       "trainingCount": 10,
       "score": 85.5
     }'
```

### 獲取所有記錄
```bash
curl "http://localhost:8000/api/training-history"
```

### 獲取統計資料
```bash
curl "http://localhost:8000/api/stats"
```

## 測試 API

運行測試腳本來驗證 API 功能：

```bash
python3 test_api.py
```

## 資料模型

### TrainingRecord
```json
{
  "time": "2025-01-19 14:30:00",
  "image": "https://example.com/image.jpg",
  "trainingCount": 10,
  "score": 85.5
}
```

### 回應格式
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "time": "2025-01-19 14:30:00",
      "image": "https://example.com/image.jpg",
      "trainingCount": 10,
      "score": 85.5,
      "createdAt": "2025-01-19T14:30:00"
    }
  ]
}
```

## 與前端整合

在您的 React Native 應用中使用這個 API：

```typescript
const FASTAPI_BASE_URL = 'http://localhost:8000';

const fetchTrainingHistory = async () => {
  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/api/training-history`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.error('Error fetching training history:', error);
  }
};
```

## 故障排除

### 常見問題

1. **MongoDB 連線失敗**
   - 確保 MongoDB 服務正在運行
   - 檢查 `.env` 文件中的 `MONGODB_URI` 設置
   - 確認網路連線和防火牆設置

2. **端口被佔用**
   - 更改 `.env` 文件中的 `PORT` 設置
   - 或停止佔用該端口的其他應用

3. **CORS 錯誤**
   - 檢查前端應用是否正確設置了 API 基礎 URL
   - 確認服務器的 CORS 設置

### 日誌檢查

服務器運行時會輸出詳細的日誌資訊，包括：
- MongoDB 連線狀態
- API 請求和回應
- 錯誤資訊

## 生產部署

對於生產環境，建議：

1. 使用環境變數管理敏感資訊
2. 設置適當的 CORS 來源
3. 使用 HTTPS
4. 設置日誌記錄和監控
5. 使用反向代理 (如 Nginx)

## 開發

### 項目結構
```
├── server.py              # FastAPI 主應用
├── requirements.txt       # Python 依賴
├── .env                   # 環境變數
├── start_server.sh        # 啟動腳本
├── test_api.py           # API 測試腳本
└── README.md             # 說明文件
```

### 貢獻

歡迎提交 Issues 和 Pull Requests 來改進這個項目！