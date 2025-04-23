import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const App = () => {
  const [mood, setMood] = useState('');
  const [food, setFood] = useState('');
  const spinValue = new Animated.Value(0);

  // Vinyl record spinning animation
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#19180A', '#2A628F']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Beats & Bites</Text>
        <Text style={styles.subtitle}>Where Music Meets Your Mood and Comfort Food</Text>
      </View>

      <View style={styles.vinylContainer}>
        <Animated.View
          style={[
            styles.vinylRecord,
            { transform: [{ rotate: spin }] },
          ]}
        >
          {/* Vinyl record design */}
          <View style={styles.vinylInner}>
            <View style={styles.vinylLabel} />
          </View>
        </Animated.View>
      </View>

      <View style={styles.controls}>
        <TextInput
          style={styles.input}
          placeholder="How are you feeling?"
          placeholderTextColor="#CECECE"
          value={mood}
          onChangeText={setMood}
        />
        <TextInput
          style={styles.input}
          placeholder="What food are you craving?"
          placeholderTextColor="#CECECE"
          value={food}
          onChangeText={setFood}
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Get Recommendations</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#19180A',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#BCC4DB',
    textAlign: 'center',
  },
  vinylContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  vinylRecord: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#89CFF0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  vinylInner: {
    width: '90%',
    height: '90%',
    borderRadius: width * 0.27,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylLabel: {
    width: '20%',
    height: '20%',
    borderRadius: width * 0.06,
    backgroundColor: '#89CFF0',
  },
  controls: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 20,
    borderRadius: 20,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    color: '#FFFFFF',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(188,196,219,0.2)',
  },
  button: {
    backgroundColor: 'rgba(137,207,240,0.2)',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(137,207,240,0.3)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App; 