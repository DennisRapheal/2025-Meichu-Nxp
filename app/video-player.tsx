import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ResizeMode, Video } from 'expo-av';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useRef } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

const ipAddress = "192.168.1.58"; // ip address from imx93

export default function VideoPlayerScreen() {
  const { filename, shouldReopenModal } = useLocalSearchParams<{ 
    filename: string;
    shouldReopenModal?: string;
  }>();
  const videoRef = useRef<Video>(null);

  const goBack = () => {
    router.back();
  };

  if (!filename) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: '影片播放器' }} />
        <View style={styles.errorContainer}>
          <ThemedText type="title">錯誤</ThemedText>
          <ThemedText>沒有指定影片檔案</ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <ThemedText style={styles.backButtonText}>返回</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `播放：${filename}`,
          headerLeft: () => (
            <TouchableOpacity onPress={goBack} style={styles.headerBackButton}>
              <ThemedText style={styles.headerBackText}>← 返回</ThemedText>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={{
            uri: `http://${ipAddress}:8000/video/${filename}`,
          }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          onError={(error) => {
            console.error('影片播放錯誤:', error);
            Alert.alert('播放錯誤', `影片播放失敗: ${JSON.stringify(error)}`);
          }}
          onLoad={() => {
            console.log('✅ 影片載入成功:', filename);
          }}
          onLoadStart={() => {
            console.log('🔄 開始載入影片:', filename);
          }}
        />
      </View>
      
      <View style={styles.infoContainer}>
        <ThemedText style={styles.infoText}>
          影片檔案: {filename}
        </ThemedText>
        <ThemedText style={styles.infoText}>
          來源: {ipAddress} 訓練設備
        </ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ThemedText style={styles.backButtonText}>返回歷史紀錄</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#171515ff',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#0c0c0cff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerBackButton: {
    paddingHorizontal: 10,
  },
  headerBackText: {
    color: '#007AFF',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});