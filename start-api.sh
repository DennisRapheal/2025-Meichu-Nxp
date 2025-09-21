#!/bin/bash
echo "🚀 啟動 MongoDB API 服務器..."

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 需要安裝 Node.js"
    exit 1
fi

# 檢查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 需要安裝 npm"
    exit 1
fi

# 安裝依賴（如果還沒安裝）
if [ ! -d "node_modules" ]; then
    echo "📦 安裝 npm 依賴..."
    npm install express mongodb cors dotenv
fi

# 檢查依賴是否存在
if [ ! -d "node_modules/express" ] || [ ! -d "node_modules/mongodb" ]; then
    echo "📦 安裝缺少的依賴..."
    npm install express mongodb cors dotenv
fi

# 啟動 API 服務器
echo "🌟 啟動 MongoDB API 服務器..."
node mongodb-api.js