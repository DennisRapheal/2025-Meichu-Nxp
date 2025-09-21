import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image as ExpoImage } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const ipAddress = "192.168.1.156"; 
const userId = "antony"; // 假設的使用者 ID

// 歷史紀錄的資料類型
interface TrainingInfo {
  score: number; // 該次訓練的分數
  speed: number; // 該次訓練的速度
  video: string;
}

interface HistoryRecord {
  _id: string;
  user_id: string;
  user_name: string;
  timestamp: string; // 訓練時間戳
  duration: string | number; // 訓練持續時間，可以是秒數或時間格式字符串
  swing_nums: number; // 揮桿次數
  avg_score: number; // 平均分數
  avg_speed: number; // 平均速度
  best_score: number; // 最高分數
  best_speed: number; // 最高速度
  ref_speed: number; // 參考速度
  trainings: TrainingInfo[]; // 每次訓練的詳細資訊
  advice?: string; // 可選的建議欄位
  createdAt: Date; // 紀錄創建時間
}




export default function HistoryScreen() {
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [shouldReopenModal, setShouldReopenModal] = useState(false);
  const shouldAutoOpenModalOnFocusRef = React.useRef(false);
  const nextVideoIdRef = React.useRef<string | null>(null);
  const lastClickedRecordIdRef = React.useRef<string | null>(null);


  // 從 MongoDB API 獲取歷史資料
  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      // 使用 MongoDB Data API 或建立一個簡單的 Node.js 服務
      // 要連在同一個 WiFi 網路下
      const response = await fetch(`http://${ipAddress}:3001/api/training-history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // 處理從 MongoDB 返回的資料
        const processedData = data.map((record: any) => ({
          ...record,
          createdAt: new Date(record.createdAt || record.timestamp)
        }));

        // 按時間排序，最新的在前面
        const sortedData = processedData.sort((a: HistoryRecord, b: HistoryRecord) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setHistoryData(sortedData);
      } else {
        throw new Error('無法從資料庫獲取資料');
      }
    } catch (error) {
      console.error('獲取歷史紀錄失敗:', error);
      // 使用模擬數據作為備用
      const mockData: HistoryRecord[] = [
        {
          _id: '67632b1e8f9a5c2d1e4f5a6b',
          user_id: 'user001',
          user_name: '張小明',
          timestamp: '2025-01-19T14:30:00',
          duration: '0:00:29.554757', // 使用新的時間格式
          swing_nums: 15,
          avg_score: 85.5,
          avg_speed: 12.3,
          best_score: 95.0,
          best_speed: 15.8,
          ref_speed: 10.0,
          trainings: [
            { score: 82.5, speed: 11.2, video: "video_1.mp4" },
            { score: 88.0, speed: 13.1, video: "video_2.mp4" },
            { score: 95.0, speed: 15.8, video: "video_3.mp4" },
            { score: 76.5, speed: 9.8, video: "video_4.mp4" }
          ],
          createdAt: new Date('2025-01-19T14:30:00')
        },
        {
          _id: '67632b1e8f9a5c2d1e4f5a6c',
          user_id: 'user001',
          user_name: '張小明',
          timestamp: '2025-01-18T16:45:00',
          duration: '0:01:42.123456', // 1分42秒格式
          swing_nums: 20,
          avg_score: 92.3,
          avg_speed: 14.7,
          best_score: 98.5,
          best_speed: 18.2,
          ref_speed: 12.0,
          trainings: [
            { score: 88.5, speed: 13.5, video: "video_5.mp4" },
            { score: 94.0, speed: 15.2, video: "video_6.mp4" },
            { score: 98.5, speed: 18.2, video: "video_7.mp4" },
            { score: 89.2, speed: 12.8, video: "video_8.mp4" },
            { score: 91.5, speed: 14.9, video: "video_9.mp4" }
          ],
          createdAt: new Date('2025-01-18T16:45:00')
        },
        {
          _id: '67632b1e8f9a5c2d1e4f5a6d',
          user_id: 'user001',
          user_name: '張小明',
          timestamp: '2025-01-17T10:15:00',
          duration: 150, // 2.5分鐘
          swing_nums: 12,
          avg_score: 78.9,
          avg_speed: 10.5,
          best_score: 86.5,
          best_speed: 13.1,
          ref_speed: 9.5,
          trainings: [
            { score: 75.0, speed: 9.2, video: "video_10.mp4" },
            { score: 81.5, speed: 11.3, video: "video_11.mp4" },
            { score: 86.5, speed: 13.1, video: "video_12.mp4" },
            { score: 72.8, speed: 8.4, video: "video_13.mp4" }
          ],
          createdAt: new Date('2025-01-17T10:15:00')
        },
        {
          _id: '67632b1e8f9a5c2d1e4f5a6e',
          user_id: 'user001',
          user_name: '張小明',
          timestamp: '2025-01-16T09:00:00',
          duration: 210, // 3.5分鐘
          swing_nums: 18,
          avg_score: 89.7,
          avg_speed: 13.2,
          best_score: 96.0,
          best_speed: 16.5,
          ref_speed: 11.0,
          trainings: [
            { score: 85.5, speed: 12.1, video: "video_14.mp4" },
            { score: 92.0, speed: 14.8, video: "video_15.mp4" },
            { score: 96.0, speed: 16.5, video: "video_16.mp4" },
            { score: 87.2, speed: 11.9, video: "video_17.mp4" },
            { score: 90.8, speed: 13.7, video: "video_18.mp4" }
          ],
          createdAt: new Date('2025-01-16T09:00:00')
        },
        {
          _id: '67632b1e8f9a5c2d1e4f5a6f',
          user_id: 'user001',
          user_name: '張小明',
          timestamp: '2025-01-15T20:30:00',
          duration: 300, // 5分鐘
          swing_nums: 25,
          avg_score: 95.2,
          avg_speed: 15.8,
          best_score: 99.5,
          best_speed: 19.3,
          ref_speed: 13.5,
          trainings: [
            { score: 92.5, speed: 14.2, video: "video_19.mp4" },
            { score: 96.0, speed: 16.8, video: "video_20.mp4" },
            { score: 99.5, speed: 19.3, video: "video_21.mp4" },
            { score: 94.8, speed: 15.1, video: "video_22.mp4" },
            { score: 93.2, speed: 14.6, video: "video_23.mp4" },
            { score: 97.1, speed: 17.9, video: "video_24.mp4" }
          ],
          createdAt: new Date('2025-01-15T20:30:00')
        }
      ];
      setHistoryData(mockData);
      Alert.alert('提示', '目前顯示模擬數據，請設定 MongoDB 連線');
    } finally {
      setLoading(false);
    }
  };

  // 關閉 Modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedRecord(null);
  };

  // 播放影片 - 關閉 Modal 後導航到新頁面
  const playVideo = (videoId: string) => {
    console.log('🎬 準備播放影片，先關閉 Modal，影片檔案:', videoId);
    // 跳轉前不要自動開啟 Modal
    setShouldReopenModal(false);
    shouldAutoOpenModalOnFocusRef.current = false;
    setModalVisible(false);
    nextVideoIdRef.current = videoId;
    if (selectedRecord && selectedRecord._id) {
      lastClickedRecordIdRef.current = selectedRecord._id;
    }
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

  // 格式化持續時間：將 "0:00:29.554757" 格式轉換為秒數並保留一位小數
  const formatDuration = (duration: string | number): string => {
    // 如果是數字，直接轉換為分秒格式
    if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      
      if (minutes > 0) {
        return `${minutes}分${seconds.toFixed(0)}秒`;
      } else {
        return `${seconds.toFixed(0)}秒`;
      }
    }
    
    // 如果是字符串且包含冒號，解析時間格式
    if (typeof duration === 'string' && duration.includes(':')) {
      const parts = duration.split(':');
      if (parts.length === 3) {
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseFloat(parts[2]) || 0;

        if (minutes > 0) {
          return minutes + '分' + seconds.toFixed(0) + '秒';
        } else {
          return seconds.toFixed(0) + '秒';
        }
      }
    }
    
    // 回退方案
    return duration.toString();
  };

  // 載入時執行
  useEffect(() => {
    fetchHistoryData();
  }, []);

  // 處理頁面重新聚焦時重開 Modal
  useFocusEffect(
    useCallback(() => {
      if (shouldAutoOpenModalOnFocusRef.current && lastClickedRecordIdRef.current) {
        const record = historyData.find(r => r._id === lastClickedRecordIdRef.current);
        if (record) {
          setSelectedRecord(record);
          setModalVisible(true);
        }
        setShouldReopenModal(false);
        lastClickedRecordIdRef.current = null;
        shouldAutoOpenModalOnFocusRef.current = false;
      }
    }, [historyData])
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8F4FD', dark: '#2C3E50' }}
      headerImage={
        <ExpoImage
          source={require('@/assets/images/baseball_hit.jpg')}
          style={styles.headerImage}
          contentFit="cover"
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">歷史紀錄</ThemedText>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchHistoryData}>
            <ThemedText style={styles.refreshButtonText}>刷新</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {loading ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <ThemedText style={styles.loadingText}>載入中...</ThemedText>
          </ThemedView>
        ) : historyData.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle" style={styles.emptyText}>
              目前沒有訓練紀錄
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              完成您的第一次訓練來查看紀錄！
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.scrollContainer}>
            {historyData.map((item, index) => (
              <View key={item._id}>
                <TouchableOpacity 
                  style={styles.historyItem}
                  onPress={() => {
                    setSelectedRecord(item);
                    setModalVisible(true);
                  }}
                >
                  <View style={styles.itemContent}>
                    {/* 使用預設圖片代替 */}
                    <View style={styles.imageContainer}>
                      <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>揮棒訓練</Text>
                      </View>
                    </View>
                    
                    <View style={styles.textContainer}>
                      <Text style={styles.timeText}>
                        {formatTime(item.timestamp)}
                      </Text>
                      <Text style={styles.detailText}>
                        次數: {item.swing_nums} 次
                      </Text>
                      <Text style={styles.detailText}>
                        時長: {formatDuration(item.duration)}
                      </Text>
                    </View>
                    
                    <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.avg_score) }]}>
                      <Text style={styles.scoreText}>
                        {item.avg_score.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                {index < historyData.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </ThemedView>
        )}
      </ThemedView>

      {/* 訓練摘要 Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
        onDismiss={() => {
          // Modal 關閉動畫結束後執行跳轉
          if (nextVideoIdRef.current) {
            // 跳轉後，返回時才自動開啟 Modal
            shouldAutoOpenModalOnFocusRef.current = true;
            router.push({
              pathname: '/video-player',
              params: {
                filename: nextVideoIdRef.current,
                shouldReopenModal: 'true'
              }
            });
            nextVideoIdRef.current = null;
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRecord && (
              <>
                {/* Modal 標題 - 固定在頂部 */}
                <View style={styles.modalHeader}>
                  <ThemedText type="subtitle" style={styles.modalTitle}>
                    訓練統計數據
                  </ThemedText>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                  </TouchableOpacity>
                </View>

                {/* 可滑動的內容區域 */}
                <ScrollView 
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* 訓練圖片 - 改為預設顯示 */}
                  <View style={styles.modalImageContainer}>
                    <View style={styles.modalPlaceholderImage}>
                      <Text style={styles.modalPlaceholderText}>揮棒訓練</Text>
                    </View>
                  </View>

                  {/* 基本資訊 */}
                  <View style={styles.modalInfoSection}>
                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalInfoLabel}>訓練時間:</ThemedText>
                      <ThemedText style={styles.modalInfoValue}>
                        {formatTime(selectedRecord.timestamp)}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalInfoLabel}>揮桿次數:</ThemedText>
                      <ThemedText style={styles.modalInfoValue}>
                        {selectedRecord.swing_nums} 次
                      </ThemedText>
                    </View>

                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalInfoLabel}>訓練時長:</ThemedText>
                      <ThemedText style={styles.modalInfoValue}>
                        {formatDuration(selectedRecord.duration)}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalInfoLabel}>平均分數:</ThemedText>
                      <View style={[styles.modalScoreBadge, { backgroundColor: getScoreColor(selectedRecord.avg_score) }]}>
                        <ThemedText style={styles.modalScoreText}>
                          {selectedRecord.avg_score.toFixed(1)}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalInfoLabel}>最佳分數:</ThemedText>
                      <View style={[styles.modalScoreBadge, { backgroundColor: getScoreColor(selectedRecord.best_score) }]}>
                        <ThemedText style={styles.modalScoreText}>
                          {selectedRecord.best_score.toFixed(1)}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalInfoLabel}>平均速度:</ThemedText>
                      <ThemedText style={styles.modalInfoValue}>
                        {selectedRecord.avg_speed.toFixed(1)} m/s
                      </ThemedText>
                    </View>

                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalInfoLabel}>最佳速度:</ThemedText>
                      <ThemedText style={styles.modalInfoValue}>
                        {selectedRecord.best_speed.toFixed(1)} m/s
                      </ThemedText>
                    </View>
                  </View>

                  {/* 詳細摘要 */}
                  <View style={styles.modalSummarySection}>
                    <ThemedText type="defaultSemiBold" style={styles.modalSectionTitle}>
                      訓練數據整理及建議
                    </ThemedText>
                    <View style={styles.modalSummaryContent}>
                      <ThemedText style={styles.modalSummaryText}>
                        • 表現評估: {selectedRecord.avg_score >= 90 ? '優秀' : selectedRecord.avg_score >= 70 ? '良好' : selectedRecord.avg_score >= 50 ? '需要改善' : '待加強'}
                      </ThemedText>
                      <ThemedText style={styles.modalSummaryText}>
                        • 訓練強度: {selectedRecord.swing_nums >= 20 ? '高強度' : selectedRecord.swing_nums >= 15 ? '中強度' : '輕度訓練'}
                      </ThemedText>
                      <ThemedText style={styles.modalSummaryText}>
                        • 速度表現: {selectedRecord.avg_speed >= selectedRecord.ref_speed * 1.2 ? '超越目標' : selectedRecord.avg_speed >= selectedRecord.ref_speed ? '達到目標' : '需要提升'}
                      </ThemedText>
                      <ThemedText style={styles.modalSummaryText}>
                        • 建議:
                      </ThemedText>
                      <ThemedText style={[styles.modalSummaryText, { marginLeft: 16, marginTop: 4 }]}>
                        {selectedRecord.advice || '持續保持訓練，專注於揮棒技巧和速度提升。'}
                      </ThemedText>
                    </View>
                  </View>

                  {/* 單次訓練詳情 */}
                  {selectedRecord.trainings && selectedRecord.trainings.length > 0 && (
                    <View style={styles.modalSummarySection}>
                      <ThemedText type="defaultSemiBold" style={styles.modalSectionTitle}>
                        單次揮棒記錄
                      </ThemedText>
                      <View style={styles.trainingsContainer}>
                        {selectedRecord.trainings.map((training, index) => (
                          <TouchableOpacity 
                            key={index} 
                            style={styles.trainingItem}
                            onPress={() => training.video && playVideo(training.video)}
                            disabled={!training.video}
                          >
                            <Text style={styles.trainingIndex}>#{index + 1}</Text>
                            <Text style={styles.trainingDetail}>
                              分數: {training.score.toFixed(1)} | 速度: {training.speed.toFixed(1)} m/s
                            </Text>
                            {training.video ? (
                              <View style={styles.playButtonContainer}>
                                <Text style={styles.playButton}>▶️ 播放</Text>
                              </View>
                            ) : (
                              <Text style={styles.noVideoText}>無影片</Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </ScrollView>

                {/* 關閉按鈕 - 固定在底部 */}
                <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                  <ThemedText style={styles.modalCloseButtonText}>關閉</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  scrollContainer: {
    paddingBottom: 20,
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
    paddingTop: 20,
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
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Modal 樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    flex: 1,
    marginVertical: 40,
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  modalInfoSection: {
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalInfoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalInfoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  modalScoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  modalScoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSummarySection: {
    marginBottom: 25,
  },
  modalSectionTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
  },
  modalSummaryContent: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
  },
  modalSummaryText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalCloseButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 新增缺少的樣式
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  placeholderImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#4A90E2',
    fontWeight: '600',
    textAlign: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  modalPlaceholderImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPlaceholderText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  trainingsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
  },
  trainingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 4,
  },
  trainingIndex: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90E2',
    minWidth: 40,
  },
  trainingDetail: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginHorizontal: 10,
  },
  playButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  playButton: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    textAlign: 'center',
  },
  noVideoText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});