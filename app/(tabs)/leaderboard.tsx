import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

  // 從 app.json 獲取 IP 配置
  const ipAddress = "192.168.1.156"; // ip address from this computer
  const apiPort = "3001";

// 排行榜數據類型
interface LeaderboardEntry {
  _id: string; // user_name - 用戶名稱 (來自 MongoDB 的 $group 聚合)
  avgScore: number; // 訓練平均最高分
  bestSingleScore: number; // 單次最高分
  bestSingleSpeed: number; // 單次速度最高
  totalTrainings: number; // 總訓練次數
  lastTraining: string; // 最後訓練時間
}

// 排序選項類型
type SortOption = 'avgScore' | 'bestSingleScore' | 'bestSingleSpeed';

export default function LeaderboardScreen() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSort, setCurrentSort] = useState<SortOption>('avgScore');


  // 處理排序選擇
  const handleSortChange = async (sortOption: SortOption) => {
    if (sortOption === currentSort) return; // 避免重複請求
    
    setCurrentSort(sortOption);
    
    try {
      setLoading(true);
      console.log(`嘗試連接: http://${ipAddress}:${apiPort}/api/leaderboard/${sortOption}`);

      const response = await fetch(`http://${ipAddress}:${apiPort}/api/leaderboard/${sortOption}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('獲取排行榜數據:', data);
        setLeaderboardData(data);
      } else {
        const errorText = await response.text();
        console.log('API 錯誤回應:', errorText);
        throw new Error(`API 回應錯誤: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('獲取排行榜失敗:', error);
      Alert.alert('錯誤', '無法重新排序，請檢查網路連線');
    } finally {
      setLoading(false);
    }
  };

  // 獲取排序按鈕的樣式
  const getSortButtonStyle = (sortOption: SortOption) => [
    styles.sortButton,
    currentSort === sortOption && styles.activeSortButton
  ];

  // 獲取排序按鈕文字樣式
  const getSortButtonTextStyle = (sortOption: SortOption) => [
    styles.sortButtonText,
    currentSort === sortOption && styles.activeSortButtonText
  ];

  // 從 API 獲取排行榜數據
  const fetchLeaderboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      console.log(`嘗試連接: http://${ipAddress}:${apiPort}/api/leaderboard/${currentSort}`);

      const response = await fetch(`http://${ipAddress}:${apiPort}/api/leaderboard/${currentSort}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API 回應狀態:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('獲取排行榜數據:', data);
        setLeaderboardData(data);
      } else {
        const errorText = await response.text();
        console.log('API 錯誤回應:', errorText);
        throw new Error(`API 回應錯誤: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('獲取排行榜失敗:', error);
      
      // 顯示具體錯誤信息
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      Alert.alert('連線錯誤', `無法獲取排行榜數據: ${errorMessage}\n\n請確認:\n1. MongoDB API 服務是否運行\n2. IP 地址是否正確: ${ipAddress}:${apiPort}\n3. 網路連線是否正常`);
      
      // 使用模擬數據作為備用
      const mockData: LeaderboardEntry[] = [
        {
          _id: '張小明',
          avgScore: 95.2,
          bestSingleScore: 99.5,
          bestSingleSpeed: 19.3,
          totalTrainings: 5,
          lastTraining: '2025-01-19T14:30:00'
        },
        {
          _id: '李小華',
          avgScore: 89.7,
          bestSingleScore: 96.0,
          bestSingleSpeed: 16.5,
          totalTrainings: 3,
          lastTraining: '2025-01-18T16:45:00'
        },
        {
          _id: '王小剛',
          avgScore: 85.5,
          bestSingleScore: 95.0,
          bestSingleSpeed: 15.8,
          totalTrainings: 8,
          lastTraining: '2025-01-17T10:15:00'
        }
      ];
      setLeaderboardData(mockData);
      Alert.alert('提示', '目前顯示模擬數據，請檢查 API 連線');
    } finally {
      setLoading(false);
    }
  }, [currentSort]);

  // 獲取排名顏色
  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // 金色
    if (rank === 2) return '#C0C0C0'; // 銀色
    if (rank === 3) return '#CD7F32'; // 銅色
    return '#4A90E2'; // 藍色
  };

  // 獲取排名圖標
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}.`;
  };

  // 格式化最後訓練時間
  const formatLastTraining = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleDateString('zh-TW', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  // 載入時執行
  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFE8E8', dark: '#8B4513' }}
      headerImage={
        <ExpoImage
          source={require('@/assets/images/baseball_betts.webp')}
          style={styles.headerImage}
          contentFit="cover"
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">🏆 訓練排行榜</ThemedText>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchLeaderboardData}>
            <ThemedText style={styles.refreshButtonText}>刷新</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* 排序按鈕區域 */}
        <ThemedView style={styles.sortContainer}>
          <ThemedText style={styles.sortLabel}>排序方式：</ThemedText>
          <View style={styles.sortButtonsContainer}>
            <TouchableOpacity
              style={getSortButtonStyle('avgScore')}
              onPress={() => handleSortChange('avgScore')}
            >
              <ThemedText style={getSortButtonTextStyle('avgScore')}>
                平均分數
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={getSortButtonStyle('bestSingleScore')}
              onPress={() => handleSortChange('bestSingleScore')}
            >
              <ThemedText style={getSortButtonTextStyle('bestSingleScore')}>
                最高分數
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={getSortButtonStyle('bestSingleSpeed')}
              onPress={() => handleSortChange('bestSingleSpeed')}
            >
              <ThemedText style={getSortButtonTextStyle('bestSingleSpeed')}>
                最高速度
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {loading ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <ThemedText style={styles.loadingText}>載入排行榜中...</ThemedText>
          </ThemedView>
        ) : leaderboardData.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle" style={styles.emptyText}>
              目前沒有排行榜資料
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              完成訓練後即可查看排名！
            </ThemedText>
          </ThemedView>
        ) : (
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {leaderboardData.map((entry, index) => {
              const rank = index + 1;
              const userName = entry._id || `用戶${index + 1}`;
              
              return (
                <View key={entry._id || index} style={[
                  styles.leaderboardItem,
                  rank <= 3 && styles.topThreeItem
                ]}>
                  {/* 用戶名稱 - 放在最上方 */}
                  <View style={styles.userNameContainer}>
                    <View style={styles.rankAndNameRow}>
                      <View style={[styles.rankContainer, { backgroundColor: getRankColor(rank) }]}>
                        <ThemedText style={styles.rankText}>
                          {getRankIcon(rank)}
                        </ThemedText>
                      </View>
                      <ThemedText type="defaultSemiBold" style={styles.userNameDisplay}>
                        🏆 {userName}
                      </ThemedText>
                    </View>
                  </View>

                  {/* 最後訓練時間 */}
                  <View style={styles.trainingTimeContainer}>
                    <ThemedText style={styles.lastTraining}>
                      最後訓練：{formatLastTraining(entry.lastTraining)}
                    </ThemedText>
                  </View>

                  {/* 成績統計 - 改為網格佈局 */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <ThemedText style={styles.statLabel}>平均分數</ThemedText>
                      <ThemedText style={styles.statValue}>
                        {entry.avgScore.toFixed(1)}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.statItem}>
                      <ThemedText style={styles.statLabel}>最高分數</ThemedText>
                      <ThemedText style={styles.statValue}>
                        {entry.bestSingleScore.toFixed(1)}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.statItem}>
                      <ThemedText style={styles.statLabel}>最高速度</ThemedText>
                      <ThemedText style={styles.statValue}>
                        {entry.bestSingleSpeed.toFixed(1)} m/s
                      </ThemedText>
                    </View>
                    
                    <View style={styles.statItem}>
                      <ThemedText style={styles.statLabel}>訓練次數</ThemedText>
                      <ThemedText style={styles.statValue}>
                        {entry.totalTrainings} 次
                      </ThemedText>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
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
  sortContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
    alignItems: 'center',
  },
  activeSortButton: {
    backgroundColor: '#4A90E2',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeSortButtonText: {
    color: '#FFFFFF',
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
  scrollContainer: {
    flex: 1,
  },
  leaderboardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
    minHeight: 180,
  },
  topThreeItem: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  userNameContainer: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  rankAndNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userNameDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    flex: 1,
  },
  trainingTimeContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginRight: 15,
  },
  userName: {
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  userNameSubtitle: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
    marginBottom: 2,
  },
  lastTraining: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statItem: {
    width: '47%',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerImage: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});