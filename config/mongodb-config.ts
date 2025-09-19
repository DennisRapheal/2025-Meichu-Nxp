// MongoDB 連線配置範例
// 這個文件包含了如何設定 MongoDB 連線和 API 的範例

// 1. 如果您使用 MongoDB Atlas，請參考以下設定：

/*
// api/training-history.ts (Next.js API 路由範例)
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // 您的 MongoDB 連線字串
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await client.connect();
      const database = client.db('training_app'); // 您的資料庫名稱
      const collection = database.collection('training_history'); // 集合名稱
      
      const records = await collection.find({}).toArray();
      
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data' });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
*/

// 2. MongoDB 文檔結構範例：
/*
{
  "_id": "ObjectId",
  "time": "2025-01-19 14:30", // 訓練時間
  "image": "https://your-image-url.com/image.jpg", // 訓練影像 URL
  "trainingCount": 10, // 訓練次數
  "score": 8.5, // 評分 (0-10)
  "createdAt": "2025-01-19T14:30:00.000Z", // 建立時間
  "userId": "user123", // 可選：使用者 ID
  "trainingType": "strength", // 可選：訓練類型
  "notes": "Great session!" // 可選：備註
}
*/

// 3. 環境變數設定 (.env 檔案):
/*
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
MONGODB_API_ENDPOINT=https://your-api-domain.com
*/

// 4. package.json 依賴項目:
/*
{
  "dependencies": {
    "mongodb": "^latest"
  }
}
*/

export const MONGODB_CONFIG = {
  // 請將此 URL 替換為您的實際 MongoDB API 端點
  API_ENDPOINT: 'https://your-mongodb-api.com',
  
  // 資料庫和集合名稱
  DATABASE_NAME: 'training_app',
  COLLECTION_NAME: 'training_history',
  
  // API 路徑
  ENDPOINTS: {
    GET_HISTORY: '/api/training-history',
    POST_TRAINING: '/api/training-history',
    DELETE_RECORD: '/api/training-history',
  }
};

// 5. 新增訓練紀錄的範例函數
export const addTrainingRecord = async (recordData: {
  time: string;
  image: string;
  trainingCount: number;
  score: number;
}) => {
  try {
    const response = await fetch(`${MONGODB_CONFIG.API_ENDPOINT}${MONGODB_CONFIG.ENDPOINTS.POST_TRAINING}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...recordData,
        createdAt: new Date().toISOString(),
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Failed to add training record:', error);
    throw error;
  }
};

// 6. 刪除訓練紀錄的範例函數
export const deleteTrainingRecord = async (recordId: string) => {
  try {
    const response = await fetch(`${MONGODB_CONFIG.API_ENDPOINT}${MONGODB_CONFIG.ENDPOINTS.DELETE_RECORD}/${recordId}`, {
      method: 'DELETE',
    });
    
    return await response.json();
  } catch (error) {
    console.error('Failed to delete training record:', error);
    throw error;
  }
};