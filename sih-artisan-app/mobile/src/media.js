// Camera / gallery / microphone helpers for the AI product wizard.
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { readAsStringAsync } from "expo-file-system/legacy";
import { IOSOutputFormat, AudioQuality } from "expo-audio";
import { Platform } from "react-native";

/**
 * Take a photo (source "camera") or pick one ("library").
 * Returns { uri, base64 } resized to ≤1600px JPEG, or null if cancelled.
 */
export async function pickPhoto(source = "camera") {
  const perm = source === "camera"
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error(source === "camera" ? "Camera permission denied" : "Gallery permission denied");

  const opts = { mediaTypes: ["images"], quality: 0.9, allowsEditing: false };
  const res = source === "camera" ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (res.canceled || !res.assets?.length) return null;
  return prepareImage(res.assets[0].uri, res.assets[0].width, res.assets[0].height);
}

/** Resize a local/remote image to ≤1600px and return { uri, base64 }. */
export async function prepareImage(uri, width = 0, height = 0, max = 1600) {
  const ctx = ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > max || !width) {
    ctx.resize(width >= height ? { width: max } : { height: max });
  }
  const ref = await ctx.renderAsync();
  const out = await ref.saveAsync({ base64: true, compress: 0.85, format: SaveFormat.JPEG });
  return { uri: out.uri, base64: out.base64 };
}

/**
 * Recording format Gemini accepts on each platform:
 *  - Android: AAC in an ADTS stream (audio/aac)
 *  - iOS: 16 kHz mono linear PCM (audio/wav)
 */
export const RECORDING_OPTIONS = {
  isMeteringEnabled: true,
  extension: Platform.OS === "ios" ? ".wav" : ".aac",
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 64000,
  android: { extension: ".aac", outputFormat: "aac_adts", audioEncoder: "aac", sampleRate: 16000 },
  ios: {
    extension: ".wav",
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.HIGH,
    sampleRate: 16000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: { mimeType: "audio/webm", bitsPerSecond: 64000 },
};

export const recordingMime = () => (Platform.OS === "ios" ? "audio/wav" : Platform.OS === "android" ? "audio/aac" : "audio/webm");

/** Read a recorded file as base64 for upload. */
export async function readAudioBase64(uri) {
  if (Platform.OS === "web") {
    const blob = await (await fetch(uri)).blob();
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1]);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }
  return readAsStringAsync(uri, { encoding: "base64" });
}
