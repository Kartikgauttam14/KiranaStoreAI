import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

interface AvatarProps {
  source?: { uri: string } | number;
  size?: 'small' | 'medium' | 'large';
  initials?: string;
  backgroundColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 'medium',
  initials,
  backgroundColor = '#E6F4FE',
}) => {
  const sizeMap = {
    small: { width: 32, height: 32, fontSize: 12 },
    medium: { width: 48, height: 48, fontSize: 16 },
    large: { width: 64, height: 64, fontSize: 18 },
  };

  const currentSize = sizeMap[size];

  if (source) {
    return (
      <Image
        source={source}
        style={[
          styles.avatar,
          {
            width: currentSize.width,
            height: currentSize.height,
            borderRadius: currentSize.width / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: currentSize.width,
          height: currentSize.height,
          borderRadius: currentSize.width / 2,
          backgroundColor,
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      <Text style={{ fontSize: currentSize.fontSize, fontWeight: 'bold', color: '#1F2937' }}>
        {initials || '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    overflow: 'hidden',
  },
});

export default Avatar;
