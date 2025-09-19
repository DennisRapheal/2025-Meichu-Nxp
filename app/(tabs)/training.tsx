import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Image } from 'expo-image';

export default function TrainingScreen() {
  // 教練性別選項
  const genderOptions = ['男性', '女性'];
  const [selectedGender, setSelectedGender] = useState(0);

  // 執教風格選項
  const styleOptions = ['溫和型', '嚴厲型', '激勵型', '技術型'];
  const [selectedStyle, setSelectedStyle] = useState(0);

  // 訓練次數選項 (1-20次)
  const sessionOptions = Array.from({ length: 20 }, (_, i) => `${i + 1} 次`);
  const [selectedSessions, setSelectedSessions] = useState(0);

  // 轉輪組件
  const WheelSelector = ({ 
    title, 
    options, 
    selectedIndex, 
    onIndexChange 
  }: {
    title: string;
    options: string[];
    selectedIndex: number;
    onIndexChange: (index: number) => void;
  }) => {
    const handlePrevious = () => {
      const newIndex = selectedIndex === 0 ? options.length - 1 : selectedIndex - 1;
      onIndexChange(newIndex);
    };

    const handleNext = () => {
      const newIndex = selectedIndex === options.length - 1 ? 0 : selectedIndex + 1;
      onIndexChange(newIndex);
    };

    return (
      <ThemedView style={styles.wheelContainer}>
        <ThemedText type="subtitle" style={styles.wheelTitle}>
          {title}
        </ThemedText>
        <View style={styles.wheel}>
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPress={handlePrevious}
          >
            <ThemedText style={styles.arrow}>‹</ThemedText>
          </TouchableOpacity>
          
          <ThemedView style={styles.selectedOption}>
            <ThemedText type="defaultSemiBold" style={styles.optionText}>
              {options[selectedIndex]}
            </ThemedText>
          </ThemedView>
          
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPress={handleNext}
          >
            <ThemedText style={styles.arrow}>›</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  // 開始訓練處理函數
  const handleStartTraining = () => {
    const trainingConfig = {
      gender: genderOptions[selectedGender],
      style: styleOptions[selectedStyle],
      sessions: sessionOptions[selectedSessions]
    };

    Alert.alert(
      '訓練設定確認',
      `教練性別: ${trainingConfig.gender}\n執教風格: ${trainingConfig.style}\n訓練次數: ${trainingConfig.sessions}`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '開始訓練',
          onPress: () => {
            // 這裡可以添加實際的訓練邏輯
            Alert.alert('訓練開始', '10 秒鐘後 IMX93 紀錄...');
          },
        },
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">訓練設定</ThemedText>
        </ThemedView>

        <ThemedView style={styles.contentContainer}>
          {/* 教練性別選擇 */}
          <WheelSelector
            title="教練性別"
            options={genderOptions}
            selectedIndex={selectedGender}
            onIndexChange={setSelectedGender}
          />

          {/* 執教風格選擇 */}
          <WheelSelector
            title="執教風格"
            options={styleOptions}
            selectedIndex={selectedStyle}
            onIndexChange={setSelectedStyle}
          />

          {/* 訓練次數選擇 */}
          <WheelSelector
            title="訓練次數"
            options={sessionOptions}
            selectedIndex={selectedSessions}
            onIndexChange={setSelectedSessions}
          />

          {/* 開始訓練按鈕 */}
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={handleStartTraining}
          >
            <ThemedText type="subtitle" style={styles.startButtonText}>
              開始訓練
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
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
    alignItems: 'center',
    marginBottom: 30,
  },
  contentContainer: {
    gap: 25,
  },
  wheelContainer: {
    marginBottom: 20,
  },
  wheelTitle: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 18,
  },
  wheel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  arrowButton: {
    padding: 15,
    backgroundColor: '#4A90E2',
    borderRadius: 25,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  selectedOption: {
    flex: 1,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#4A90E2',
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});