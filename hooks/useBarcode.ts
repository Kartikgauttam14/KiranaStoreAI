import { useCallback, useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';

export const useBarcode = () => {
  const [barcode, setBarcode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBarcodeScanned = useCallback((data: any) => {
    setBarcode(data.data);
    setError(null);
    setIsScanning(false);
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled) {
        return result.assets[0].uri;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to pick image');
    }
    return null;
  }, []);

  const captureImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled) {
        return result.assets[0].uri;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to capture image');
    }
    return null;
  }, []);

  const clearBarcode = useCallback(() => {
    setBarcode(null);
    setError(null);
  }, []);

  return {
    barcode,
    isScanning,
    error,
    setIsScanning,
    handleBarcodeScanned,
    pickImage,
    captureImage,
    clearBarcode,
  };
};
