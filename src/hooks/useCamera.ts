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
    const token = await getAccessToken();

    const url = `${process.env.EXPO_PUBLIC_API_URL}/upload`;

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            setUploadedPhotoUrl(data.url);
            Toast.show({
              type: 'success',
              text1: 'Foto cargada',
              text2: 'La foto se subió correctamente.',
            });
            resolve();
          } catch {
            reject(new Error('Respuesta inválida del servidor'));
          }
        } else {
          console.error('Upload error status:', xhr.status, xhr.responseText);
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        console.error('XHR network error');
        reject(new Error('Error de red'));
      };

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: `reciclaje_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      xhr.send(formData);
    });

  } catch (err) {
    console.error('Upload exception:', err);
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