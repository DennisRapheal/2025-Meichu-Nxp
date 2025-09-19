import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Modal, View, TextInput, Button, Alert } from 'react-native';

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [ip, setIp] = useState('');

  const handleConnect = () => {
    // 模擬連線
    setTimeout(() => {
      setModalVisible(false);
      Alert.alert('連線成功', `已連接到 ${ip}`);
      setIp('');
    }, 800);
  };
  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">訓練首頁</ThemedText>
          <HelloWave />
        </ThemedView>
        <ThemedView style={styles.buttonContainer}>
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Button title="配對" color="#4A90E2" onPress={() => setModalVisible(true)} />
          </View>
          <Link href="/(tabs)/history">
            <ThemedView style={styles.button}>
              <ThemedText type="subtitle">歷史紀錄</ThemedText>
            </ThemedView>
          </Link>
          <Link href="/(tabs)/training">
            <ThemedView style={[styles.button, styles.startButton]}>
              <ThemedText type="subtitle">開始訓練</ThemedText>
            </ThemedView>
          </Link>
        </ThemedView>
      </ParallaxScrollView>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="title">輸入 IP</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="192.168.1.50"
              value={ip}
              onChangeText={setIp}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
              <Button title="取消" onPress={() => setModalVisible(false)} color="#888" />
              <Button title="連接" onPress={handleConnect} color="#1D3D47" disabled={!ip} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 28,
      width: 320,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: '#A1CEDC',
      borderRadius: 8,
      padding: 10,
      width: 220,
      marginTop: 18,
      fontSize: 16,
      backgroundColor: '#F7F7F7',
    },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#A1CEDC',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 12,
    alignItems: 'center',
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  startButton: {
    backgroundColor: '#1D3D47',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
