import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, View, Easing } from 'react-native';
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Rive, { Fit, RiveRef } from 'rive-react-native';

const CustomPullToRefreshScreen = () => {
  const dragY = useRef(new Animated.Value(0)).current; // Animated value to track the drag position
  const height = 700; // Height to pull down
  const threshold = height * 0.3; // 30% of the height
  const animationRef = useRef<RiveRef>(null); // Rive animation reference
  const [currentDistance, setCurrentDistance] = useState(0); // Track the current drag distance
  const [refreshing, setRefreshing] = useState(false); // Refreshing state
  const [showRive, setShowRive] = useState(false); // State to manage the visibility of the Rive animation
  const listRef = useRef(null); // Reference to the FlatList
  // Using diffClamp to smooth out the drag
  const clampedDragY = useRef(Animated.diffClamp(dragY, 0, threshold)).current;

  // Handle the pull logic
  const onPull = pullDelta => {
    if (refreshing) return 0;

    const newOffset = Math.max(currentDistance + pullDelta, 0);
    const dragConsumed = newOffset - currentDistance;
    setCurrentDistance(newOffset);

    const progress = newOffset / threshold;

    // Update the Rive animation with the current progress
    if (animationRef.current) {
      animationRef.current.setInputState(
        'numberSimulation',
        'pull',
        progress * 100,
      );
    }

    return dragConsumed;
  };

  // Function to handle gesture state change
  const onHandlerStateChange = event => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationY > threshold) {
        // Trigger the refresh logic
        onRefresh();
      } else {
        // Animate back to the original position when released

        Animated.timing(dragY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true, // Use native driver for better performance
        }).start(() => {
          if (animationRef.current) {
            animationRef.current.reset();
          }
          setCurrentDistance(0);
          setShowRive(false); // Hide the Rive animation after reset
        });
      }
    }
  };

  // Handle pan gesture
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    {
      useNativeDriver: true, // Use native driver for smoother animations
      listener: event => {
        const pullDelta = event.nativeEvent.translationY;

        if (pullDelta > 10 && !refreshing) {
          // Only handle downward pulls exceeding the threshold
          onPull(pullDelta);
          setShowRive(true);
        }
      },
    },
  );

  const onRefresh = () => {
    setRefreshing(true);

    if (animationRef.current) {
      animationRef.current.fireState('numberSimulation', 'advance');
    }

    setTimeout(() => {
      if (animationRef.current) {
        animationRef.current.fireState('numberSimulation', 'advance');
      }
      setTimeout(() => {
        setRefreshing(false);
        setCurrentDistance(0);
        Animated.timing(dragY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true, // Use native driver for better performance
        }).start(() => {
          setShowRive(false); // Hide the Rive animation after refreshing
        });
      }, 500);
    }, 2000);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-30, 30]}>
        <Animated.View style={styles.container}>
          {/* Rive animation behind the list, visible only during pull */}
          {showRive && (
            <Rive
              ref={animationRef}
              resourceName="pull_to_refresh_use_case"
              stateMachineName="numberSimulation"
              fit={Fit.Cover}
              style={styles.riveAnimation}
            />
          )}

          {/* List in front of the Rive animation */}
          <Animated.FlatList
            ref={listRef} // Reference for waitFor
            data={Array.from({ length: 25 })}
            keyExtractor={(item, index) => index.toString()}
            renderItem={() => <ListItem />}
            contentContainerStyle={{ backgroundColor: '#001C1C' }} // Add background color to cover the Rive animation
            scrollEnabled={!showRive}
            style={[
              styles.listContainer,
              {
                transform: [
                  {
                    translateY: clampedDragY.interpolate({
                      inputRange: [0, threshold],
                      outputRange: [0, threshold],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const ListItem = () => (
  <View style={styles.listItem}>
    <View style={styles.innerBox1} />
    <View style={styles.innerBox2} />
    <View style={styles.innerBox3} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001C1C',
  },
  riveAnimation: {
    position: 'absolute',
    width: '100%',
    height: 200,
    top: 0,
    zIndex: 0, // Behind the list
    backgroundColor: '#001C1C',
  },
  riveBackground: {
    backgroundColor: '#001C1C', // Background color to match the theme
  },
  listContainer: {
    flex: 1,
    zIndex: 1, // In front of the Rive animation
    backgroundColor: '#001C1C', // Ensure background color is set to cover the Rive animation
  },
  listItem: {
    padding: 16,
    marginBottom: 10,
    width: '100%',
    height: 100,
    backgroundColor: '#003C3D',
    borderRadius: 8,
  },
  innerBox1: {
    position: 'absolute',
    left: 16,
    top: 16,
    width: 64,
    height: 64,
    backgroundColor: 'darkgray',
    borderRadius: 4,
  },
  innerBox2: {
    position: 'absolute',
    left: 88,
    top: 16,
    right: 16,
    height: 16,
    backgroundColor: 'darkgray',
    borderRadius: 4,
  },
  innerBox3: {
    position: 'absolute',
    left: 88,
    top: 40,
    right: 16,
    height: 16,
    backgroundColor: 'darkgray',
    borderRadius: 4,
  },
});

export default CustomPullToRefreshScreen;
