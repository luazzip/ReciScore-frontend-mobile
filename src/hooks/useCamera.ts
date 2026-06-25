import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Toast from 'react-native-toast-message';
import { getAccessToken } from '../services/tokenService';

export function useCamera() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  async function openCamera() {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert(
          'Permiso de cámara denegado',
          'Ve a Configuración > Aplicaciones > ReciScore > Permisos para habilitarla.',
          [{ text: 'Entendido' }]
        );
        return;
      }
    }
    setShowCamera(true);
  }

  async function takePhoto() {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo) {
        setPhotoUri(photo.uri);
        setShowCamera(false);
        await uploadPhoto(photo.uri);
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error al tomar foto',
        text2: 'Inténtalo de nuevo.',
      });
    }
  }


async function uploadPhoto(uri: string) {
  setUploading(true);
  try {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: `reciclaje_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);

    const token = await getAccessToken();

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/upload`,
      {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    setUploadedPhotoUrl(data.url);
    Toast.show({
      type: 'success',
      text1: 'Foto cargada',
      text2: 'La foto se subió correctamente.',
    });
  } catch {
    Toast.show({
      type: 'error',
      text1: 'Error al subir foto',
      text2: 'Revisa tu conexión e inténtalo de nuevo.',
    });
    setPhotoUri(null);
  } finally {
    setUploading(false);
  }
}

  function resetCamera() {
    setPhotoUri(null);
    setUploadedPhotoUrl(null);
  }

  return {
    cameraRef,
    showCamera,
    setShowCamera,
    photoUri,
    uploadedPhotoUrl,
    uploading,
    openCamera,
    takePhoto,
    resetCamera,
  };
}