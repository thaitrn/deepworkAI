import { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from 'react-native-paper';

const NUM_CONFETTI = 30;
const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

export function Confetti({ isActive }: { isActive: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const theme = useTheme();
  const { width: screenWidth } = Dimensions.get('window');

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: NUM_CONFETTI }).map((_, index) => ({
        id: index,
        x: Math.random() * screenWidth,
        y: -20,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive]);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            {
              position: 'absolute',
              left: particle.x,
              width: 8,
              height: 8,
              backgroundColor: particle.color,
              borderRadius: 4,
              transform: [
                { translateY: withSequence(
                  withDelay(
                    particle.id * 50,
                    withSpring(-300 - Math.random() * 200, {
                      damping: 15,
                      stiffness: 40,
                    })
                  ),
                  withTiming(800, {
                    duration: 2000,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                  })
                ) },
                { rotate: `${withTiming(particle.rotation + 360 * 3, { duration: 2000 })}deg` },
                { scale: withSequence(
                  withSpring(particle.scale),
                  withTiming(0, { duration: 2000 })
                ) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
} 