// src/config/api.js
import { Platform } from "react-native";

// ✅ FIXED: Use the actual Wi-Fi IP of your computer (192.168.1.2) so that
//   BOTH physical Android devices AND emulators can reach the Spring Boot backend.
//   - 10.0.2.2  → only works inside Android Emulator (loopback alias)
//   - 192.168.1.2 → works on any device on the same Wi-Fi network
// If your Wi-Fi IP ever changes, run: Get-NetIPAddress -AddressFamily IPv4
export const API_BASE_URL = Platform.select({
  android: "http://192.168.0.101:8080",
  ios: "http://192.168.0.101:8080",
  default: "http://192.168.0.101:8080",
});
