const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;


// 中間件
app.use(cors());
app.use(express.json());

// MongoDB 配置 - 使用您的 Atlas 連接字串
const uri = "mongodb+srv://dennis:dennis0906@2025-nxp.nqv7iay.mongodb.net/?retryWrites=true&w=majority&appName=2025-nxp";
const dbName = "nxp_app";
const collectionName = "trainings";

// ip address from this computer
const ipAddress = "192.168.1.156";

let database;
let collection;
let client;

// 連接 MongoDB 的主要函數
async function run() {
  try {
    // 創建 MongoClient 實例
    client = new MongoClient(uri);
    
    // 連接到 MongoDB Atlas
    await client.connect();
    console.log('成功連接到 MongoDB Atlas!');
    
    // 創建數據庫和集合的引用
    database = client.db(dbName);
    collection = database.collection(collectionName);
    
    console.log(`連接到數據庫: ${dbName}`);
    console.log(`使用集合: ${collectionName}`);
    
    return { database, collection };
  } catch (error) {
    console.error('MongoDB 連接失敗:', error);
    throw error;
  }
}

// API 路由：獲取所有訓練歷史
app.get('/api/training-history', async (req, res) => {
  try {
    if (!database || !collection) {
      return res.status(500).json({ error: '資料庫連接失敗' });
    }

    // 獲取所有訓練記錄，按創建時間降序排列
    const cursor = await collection.find({}).sort({ timestamp: -1 });
    const records = await cursor.toArray();

    console.log(`獲取到 ${records.length} 筆訓練記錄`);
    
    res.json(records);
  } catch (error) {
    console.error('獲取訓練歷史失敗:', error);
    res.status(500).json({ error: '獲取資料失敗', details: error.message });
  }
});

// API 路由：根據用戶 ID 獲取訓練歷史
app.get('/api/training-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`🔍 收到查詢請求，用戶ID: ${userId}`);
    
    if (!database || !collection) {
      console.log('❌ 資料庫連接失敗');
      return res.status(500).json({ error: '資料庫連接失敗' });
    }

    // 先檢查所有資料中的 user_name 欄位
    const allUsers = await collection.distinct('user_name');
    console.log('📋 資料庫中所有的用戶名:', allUsers);
    
    const cursor = await collection.find({ user_name: userId }).sort({ timestamp: -1 });
    const records = await cursor.toArray();

    console.log(`✅ 用戶 ${userId} 有 ${records.length} 筆訓練記錄`);
    
    // 如果沒有找到記錄，嘗試不同的查詢方式
    if (records.length === 0) {
      console.log(`🔍 嘗試其他查詢方式...`);
      
      // 嘗試大小寫不敏感查詢
      const cursor2 = await collection.find({ 
        user_name: { $regex: new RegExp(`^${userId}$`, 'i') }
      }).sort({ timestamp: -1 });
      const records2 = await cursor2.toArray();
      
      console.log(`🔍 大小寫不敏感查詢結果: ${records2.length} 筆記錄`);
      
      if (records2.length > 0) {
        res.json(records2);
        return;
      }
    }
    
    res.json(records);
  } catch (error) {
    console.error('❌ 獲取用戶訓練歷史失敗:', error);
    res.status(500).json({ error: '獲取資料失敗', details: error.message });
  }
});

// API 路由：新增訓練記錄
app.post('/api/training-history', async (req, res) => {
  try {
    if (!database || !collection) {
      return res.status(500).json({ error: '資料庫連接失敗' });
    }

    const newRecord = {
      ...req.body,
      timestamp: req.body.timestamp || new Date().toISOString()
    };

    const insertResult = await collection.insertOne(newRecord);
    
    console.log('✅ 新增訓練記錄:', insertResult.insertedId);
    
    res.status(201).json({ 
      success: true, 
      insertedId: insertResult.insertedId,
      record: newRecord
    });
  } catch (error) {
    console.error('新增訓練記錄失敗:', error);
    res.status(500).json({ error: '新增資料失敗', details: error.message });
  }
});

// API 路由：排行榜 - 根據用戶名排序各項最高成績
app.get('/api/leaderboard/:sortBy', async (req, res) => {
  console.log('🎯 排行榜 API 被調用');
  try {
    if (!database || !collection) {
      console.log('❌ 資料庫連接失敗');
      return res.status(500).json({ error: '資料庫連接失敗' });
    }

    // 驗證排序參數
    const validSortFields = ['avgScore', 'bestSingleScore', 'bestSingleSpeed'];
    const sortBy = req.params.sortBy;
    
    if (!validSortFields.includes(sortBy)) {
      console.log(`❌ 無效的排序參數: ${sortBy}`);
      return res.status(400).json({ 
        error: '無效的排序參數', 
        validOptions: validSortFields 
      });
    }

    console.log(`✅ 資料庫連接正常，按 ${sortBy} 排序`);

    // 先檢查數據庫中是否有數據
    const totalCount = await collection.countDocuments();
    console.log(`📊 數據庫中共有 ${totalCount} 筆記錄`);

    // 使用 MongoDB 聚合管道來計算每個用戶的最佳成績
    const pipeline = [
      {
        $group: {
          _id: '$user_name',
          avgScore: { $avg: '$avg_score' }, // 訓練平均最高分
          bestSingleScore: { $max: '$best_score' }, // 單次最高分
          bestSingleSpeed: { $max: '$best_speed' }, // 單次速度最高
          totalTrainings: { $sum: 1 }, // 總訓練次數
          lastTraining: { $max: '$timestamp' } // 最後訓練時間
        }
      },
      {
        $sort: { [sortBy]: -1 } // 依選擇的欄位降序排列
      }
    ];

    console.log('🔍 執行聚合查詢...');
    const leaderboard = await collection.aggregate(pipeline).toArray();
    
    console.log(`✅ 生成排行榜，共 ${leaderboard.length} 位用戶`);
    console.log('📋 排行榜數據:', JSON.stringify(leaderboard, null, 2));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('❌ 獲取排行榜失敗:', error);
    res.status(500).json({ error: '獲取排行榜失敗', details: error.message });
  }
});

// 健康檢查路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: database ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 啟動服務器
async function startServer() {
  try {
    await run(); // 連接 MongoDB
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`MongoDB API 服務器運行在 http://0.0.0.0:${port}`);
      console.log(`訓練歷史 API: http://${ipAddress}:${port}/api/training-history`);
      console.log(`排行榜 API: http://${ipAddress}:${port}/api/leaderboard`);
      console.log(`健康檢查: http://${ipAddress}:${port}/health`);
    });
  } catch (error) {
    console.error('啟動服務器失敗:', error);
    process.exit(1);
  }
}

// 優雅關閉
process.on('SIGINT', async () => {
  console.log('\n正在關閉服務器...');
  if (client) {
    await client.close();
    console.log('✅ MongoDB 連接已關閉');
  }
  process.exit(0);
});

// 啟動服務器
startServer().catch(console.error);