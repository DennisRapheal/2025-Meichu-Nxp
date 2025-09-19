import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Image as ExpoImage } from 'expo-image';

// 歷史紀錄的資料類型
interface HistoryRecord {
  _id: string;
  time: string;
  image: string;
  trainingCount: number;
  score: number;
  createdAt: Date;
}

export default function HistoryScreen() {
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // MongoDB 連線設定 - 請根據您的實際設定修改
  const MONGODB_API_URL = 'YOUR_MONGODB_API_ENDPOINT'; // 請替換為您的 MongoDB API 端點

  // 從 MongoDB 獲取歷史資料
  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      
      // 這裡使用您的 MongoDB API 端點
      const response = await fetch(`${MONGODB_API_URL}/api/training-history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 如果需要認證，請添加 Authorization header
          // 'Authorization': 'Bearer YOUR_TOKEN'
        },
      });

      if (response.ok) {
        const data = await response.json();
        // 按時間排序，最新的在前面
        const sortedData = data.sort((a: HistoryRecord, b: HistoryRecord) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setHistoryData(sortedData);
      } else {
        Alert.alert('錯誤', '無法獲取歷史紀錄');
      }
    } catch (error) {
      console.error('獲取歷史紀錄失敗:', error);
      // 使用模擬數據作為範例
      const mockData: HistoryRecord[] = [
        {
          _id: '1',
          time: '2025-01-19 14:30',
          image: 'https://via.placeholder.com/150x100/4A90E2/FFFFFF?text=Training+1',
          trainingCount: 10,
          score: 85,
          createdAt: new Date('2025-01-19T14:30:00')
        },
        {
          _id: '2',
          time: '2025-01-18 16:45',
          image: 'https://via.placeholder.com/150x100/FF6B6B/FFFFFF?text=Training+2',
          trainingCount: 15,
          score: 92,
          createdAt: new Date('2025-01-18T16:45:00')
        },
        {
          _id: '3',
          time: '2025-01-17 10:15',
          image: 'https://via.placeholder.com/150x100/50C878/FFFFFF?text=Training+3',
          trainingCount: 8,
          score: 78,
          createdAt: new Date('2025-01-17T10:15:00')
        },
        {
          _id: '4',
          time: '2025-01-16 09:00',
          image: 'https://via.placeholder.com/150x100/FFB347/FFFFFF?text=Training+4',
          trainingCount: 12,
          score: 89,
          createdAt: new Date('2025-01-16T09:00:00')
        }
      ];
      setHistoryData(mockData);
      Alert.alert('提示', '目前顯示模擬數據，請設定 MongoDB 連線');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 下拉刷新
  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistoryData();
  };

  // 獲取評分顏色
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#50C878'; // 綠色 - 優秀
    if (score >= 70) return '#FFB347'; // 橙色 - 良好
    if (score >= 50) return '#FF6B6B'; // 紅色 - 需要改善
    return '#808080'; // 灰色 - 差
  };

  // 格式化時間
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  // 渲染每個歷史紀錄項目
  const renderHistoryItem = ({ item }: { item: HistoryRecord }) => (
    <ThemedView style={styles.historyItem}>
      {/* 左側圖片 */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.trainingImage}
          resizeMode="cover"
        />
      </View>

      {/* 中間資訊 */}
      <View style={styles.infoContainer}>
        <ThemedText type="defaultSemiBold" style={styles.timeText}>
          {formatTime(item.time)}
        </ThemedText>
        <ThemedText style={styles.countText}>
          訓練次數: {item.trainingCount} 次
        </ThemedText>
      </View>

      {/* 右側評分 */}
      <View style={styles.scoreContainer}>
        <ThemedText style={styles.scoreLabel}>評分</ThemedText>
        <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.score) }]}>
          <ThemedText style={styles.scoreText}>
            {item.score.toFixed(1)}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );

  // 空資料顯示
  const renderEmptyList = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText type="subtitle" style={styles.emptyText}>
        目前沒有訓練紀錄
      </ThemedText>
      <ThemedText style={styles.emptySubtext}>
        完成您的第一次訓練來查看紀錄！
      </ThemedText>
    </ThemedView>
  );

  // 載入時執行
  useEffect(() => {
    fetchHistoryData();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8F4FD', dark: '#2C3E50' }}
      headerImage={
        <ExpoImage
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">訓練歷史</ThemedText>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <ThemedText style={styles.refreshButtonText}>刷新</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {loading ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <ThemedText style={styles.loadingText}>載入中...</ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={historyData}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyList}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  refreshButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 5,
  },
  imageContainer: {
    marginRight: 15,
  },
  trainingImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    minWidth: 45,
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});