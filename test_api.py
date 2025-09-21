#!/usr/bin/env python3
"""
FastAPI 測試腳本
用於測試 Training History API 的各種端點
"""

import json
from datetime import datetime

import requests

# API 基礎 URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """測試健康檢查端點"""
    print("=== 測試健康檢查 ===")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"狀態碼: {response.status_code}")
        print(f"回應: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"錯誤: {e}")
        return False

def test_create_record():
    """測試創建訓練記錄"""
    print("\n=== 測試創建訓練記錄 ===")
    try:
        data = {
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "image": "https://via.placeholder.com/150x100/4A90E2/FFFFFF?text=Test+Training",
            "trainingCount": 10,
            "score": 85.5
        }
        
        response = requests.post(f"{BASE_URL}/api/training-history", json=data)
        print(f"狀態碼: {response.status_code}")
        print(f"回應: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        if response.status_code == 201:
            return response.json()["data"]["_id"]
        return None
    except Exception as e:
        print(f"錯誤: {e}")
        return None

def test_get_all_records():
    """測試獲取所有記錄"""
    print("\n=== 測試獲取所有記錄 ===")
    try:
        response = requests.get(f"{BASE_URL}/api/training-history")
        print(f"狀態碼: {response.status_code}")
        result = response.json()
        print(f"記錄數量: {result.get('count', 0)}")
        print(f"回應: {json.dumps(result, indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"錯誤: {e}")
        return False

def test_get_single_record(record_id):
    """測試獲取單個記錄"""
    if not record_id:
        return False
        
    print(f"\n=== 測試獲取單個記錄 (ID: {record_id}) ===")
    try:
        response = requests.get(f"{BASE_URL}/api/training-history/{record_id}")
        print(f"狀態碼: {response.status_code}")
        print(f"回應: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"錯誤: {e}")
        return False

def test_update_record(record_id):
    """測試更新記錄"""
    if not record_id:
        return False
        
    print(f"\n=== 測試更新記錄 (ID: {record_id}) ===")
    try:
        data = {
            "score": 90.0,
            "trainingCount": 15
        }
        
        response = requests.put(f"{BASE_URL}/api/training-history/{record_id}", json=data)
        print(f"狀態碼: {response.status_code}")
        print(f"回應: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"錯誤: {e}")
        return False

def test_get_statistics():
    """測試獲取統計資料"""
    print("\n=== 測試獲取統計資料 ===")
    try:
        response = requests.get(f"{BASE_URL}/api/stats")
        print(f"狀態碼: {response.status_code}")
        print(f"回應: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"錯誤: {e}")
        return False

def test_delete_record(record_id):
    """測試刪除記錄"""
    if not record_id:
        return False
        
    print(f"\n=== 測試刪除記錄 (ID: {record_id}) ===")
    try:
        response = requests.delete(f"{BASE_URL}/api/training-history/{record_id}")
        print(f"狀態碼: {response.status_code}")
        print(f"回應: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"錯誤: {e}")
        return False

def main():
    """主測試函數"""
    print("開始測試 FastAPI Training History API")
    print("請確保服務器正在運行 (python3 server.py)")
    print("=" * 50)
    
    # 測試健康檢查
    if not test_health_check():
        print("健康檢查失敗，請確保服務器正在運行")
        return
    
    # 測試創建記錄
    record_id = test_create_record()
    
    # 測試獲取所有記錄
    test_get_all_records()
    
    # 測試獲取單個記錄
    test_get_single_record(record_id)
    
    # 測試更新記錄
    test_update_record(record_id)
    
    # 測試統計資料
    test_get_statistics()
    
    # 測試刪除記錄
    test_delete_record(record_id)
    
    print("\n" + "=" * 50)
    print("測試完成！")
    print(f"API 文檔：{BASE_URL}/docs")
    print(f"ReDoc 文檔：{BASE_URL}/redoc")

if __name__ == "__main__":
    main()