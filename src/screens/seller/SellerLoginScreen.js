
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View, Text, TextInput, TouchableOpacity, ScrollView,
//   StyleSheet, Alert, KeyboardAvoidingView, Platform,
//   ActivityIndicator, Animated, StatusBar, Dimensions,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';

// const { width, height } = Dimensions.get('window');

// const C = {
//   primary: '#082843',
//   primaryDark: '#082843',
//   primaryLight: '#FFFFFF',
//   white: '#FFFFFF',
//   bg: '#FFFFFF',
//   card: '#FFFFFF',
//   border: '##0e3243',
//   text: '#1A1A2E',
//   textSec: '#6B7280',
//   textHint: '#C4C4C4',
// };

// const InputField = ({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType = 'default', icon, rightElement }) => {
//   const [focused, setFocused] = useState(false);
//   return (
//     <View style={s.fieldWrap}>
//       {label ? <Text style={s.fieldLabel}>{label}</Text> : null}
//       <View style={[s.fieldBox, focused && s.fieldBoxFocused]}>
//         {icon ? <Text style={s.fieldIcon}>{icon}</Text> : null}
//         <TextInput
//           style={s.fieldInput}
//           placeholder={placeholder}
//           placeholderTextColor={C.textHint}
//           value={value}
//           onChangeText={onChangeText}
//           secureTextEntry={secureTextEntry}
//           keyboardType={keyboardType}
//           autoCapitalize="none"
//           onFocus={() => setFocused(true)}
//           onBlur={() => setFocused(false)}
//         />
//         {rightElement}
//       </View>
//     </View>
//   );
// };

// const SellerLoginScreen = ({ navigation }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPwd, setShowPwd] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(40)).current;
//   const scaleAnim = useRef(new Animated.Value(0.9)).current;
//   const floatAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
//       Animated.timing(slideAnim, { toValue: 0, duration: 650, useNativeDriver: true }),
//       Animated.spring(scaleAnim, { toValue: 1, friction: 7, useNativeDriver: true }),
//     ]).start();

//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(floatAnim, { toValue: -10, duration: 2000, useNativeDriver: true }),
//         Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
//       ])
//     ).start();
//   }, []);

//   const handleLogin = () => {
//     if (!email.trim()) { Alert.alert('Required', 'Please enter email or phone number.'); return; }
//     if (!password) { Alert.alert('Required', 'Please enter your password.'); return; }
//     setLoading(true);
//     setTimeout(() => {
//       setLoading(false);
//       navigation.replace('SellerTabs');
//     }, 1200);
//   };

//   return (
//     <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
//       <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

//       {/* Background decorations */}
//       <View style={s.bgBlob1} />
//       <View style={s.bgBlob2} />

//       <ScrollView
//         style={s.screen}
//         contentContainerStyle={s.content}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//       >
//         {/* Back button */}
//         <TouchableOpacity
//           style={s.backBtn}
//           onPress={() => navigation.navigate('SellerOnboardingScreen')}
//         >
//           <Text style={s.backArrow}>←</Text>
//         </TouchableOpacity>

//         {/* Avatar hero area */}
//         <Animated.View
//           style={[s.heroSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
//         >
//           <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
//             <LinearGradient
//               colors={[C.primaryLight, C.white]}
//               style={s.avatarCircle}
//             >
//               <Text style={s.avatarEmoji}>👤</Text>
//             </LinearGradient>
//           </Animated.View>

//           {/* Orbiting badges */}
//           <View style={[s.orbitBadge, s.orbitBadge1]}>
//             <Text style={{ fontSize: 16 }}>🛍️</Text>
//           </View>
//           <View style={[s.orbitBadge, s.orbitBadge2]}>
//             <Text style={{ fontSize: 16 }}>⭐</Text>
//           </View>
//           <View style={[s.orbitBadge, s.orbitBadge3]}>
//             <Text style={{ fontSize: 16 }}>💰</Text>
//           </View>
//         </Animated.View>

//         <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
//           {/* Welcome text */}
//           <View style={s.welcomeTextBlock}>
//             <Text style={s.welcomeHello}>Welcome Back! 👋</Text>
//             <Text style={s.welcomeSub}>Login to manage your HandiCraft seller store</Text>
//           </View>

//           {/* Form card */}
//           <View style={s.formCard}>
//             <InputField
//               label="Email or Phone Number"
//               placeholder="Enter email or phone"
//               value={email}
//               onChangeText={setEmail}
//               icon="✉️"
//               keyboardType="email-address"
//             />
//             <InputField
//               label="Password"
//               placeholder="Enter your password"
//               value={password}
//               onChangeText={setPassword}
//               icon="🔒"
//               secureTextEntry={!showPwd}
//               rightElement={
//                 <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={{ padding: 4 }}>
//                   <Text style={{ fontSize: 16 }}>{showPwd ? '🙈' : '👁️'}</Text>
//                 </TouchableOpacity>
//               }
//             />

//             <TouchableOpacity
//               onPress={() => Alert.alert('Forgot Password', 'A reset link will be sent to your registered email.')}
//               style={s.forgotWrap}
//             >
//               <Text style={s.forgotText}>Forgot Password?</Text>
//             </TouchableOpacity>

//             {/* Login button */}
//             <TouchableOpacity
//               style={s.loginBtn}
//               onPress={handleLogin}
//               disabled={loading}
//               activeOpacity={0.87}
//             >
//               <LinearGradient
//                 colors={[C.primary, C.primaryDark]}
//                 start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
//                 style={s.loginBtnGrad}
//               >
//                 {loading
//                   ? <ActivityIndicator color={C.white} size="small" />
//                   : <Text style={s.loginBtnText}>Login to Dashboard  →</Text>}
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>

//           {/* Or divider */}
//           <View style={s.orRow}>
//             <View style={s.orLine} />
//             <Text style={s.orText}>or continue with</Text>
//             <View style={s.orLine} />
//           </View>

//           {/* Social buttons */}
//           <View style={s.socialRow}>
//             <TouchableOpacity
//               style={s.socialBtn}
//               onPress={() => Alert.alert('Google', 'Google login coming soon.')}
//               activeOpacity={0.8}
//             >
//               <Text style={s.googleG}>G</Text>
//               <Text style={s.socialText}>Google</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[s.socialBtn, s.fbBtn]}
//               onPress={() => Alert.alert('Facebook', 'Facebook login coming soon.')}
//               activeOpacity={0.8}
//             >
//               <Text style={s.fbF}>f</Text>
//               <Text style={[s.socialText, { color: C.white }]}>Facebook</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Register link */}
//           <TouchableOpacity
//             style={s.registerRow}
//             onPress={() => navigation.navigate('SellerRegistrationScreen')}
//           >
//             <Text style={s.registerText}>
//               New seller?{' '}
//               <Text style={s.registerBold}>Create an Account 🚀</Text>
//             </Text>
//           </TouchableOpacity>
//         </Animated.View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const s = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: C.bg },
//   content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 },

//   bgBlob1: {
//     position: 'absolute', top: -80, right: -60,
//     width: 240, height: 240, borderRadius: 120,
//     backgroundColor: C.primaryLight, opacity: 0.25,
//   },
//   bgBlob2: {
//     position: 'absolute', bottom: 120, left: -80,
//     width: 200, height: 200, borderRadius: 100,
//     backgroundColor: '#FFD0E8', opacity: 0.18,
//   },

//   backBtn: {
//     width: 42, height: 42, borderRadius: 21,
//     backgroundColor: C.white, alignItems: 'center', justifyContent: 'center',
//     shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 },
//     elevation: 3, marginBottom: 8, alignSelf: 'flex-start',
//   },
//   backArrow: { fontSize: 20, color: C.primary, fontWeight: '700' },

//   heroSection: {
//     alignItems: 'center', justifyContent: 'center',
//     height: 160, marginVertical: 8, position: 'relative',
//   },
//   avatarCircle: {
//     width: 110, height: 110, borderRadius: 55,
//     alignItems: 'center', justifyContent: 'center',
//     shadowColor: C.primary, shadowOpacity: 0.25,
//     shadowOffset: { width: 0, height: 10 }, elevation: 10,
//   },
//   avatarEmoji: { fontSize: 54 },
//   orbitBadge: {
//     position: 'absolute',
//     width: 40, height: 40, borderRadius: 20,
//     backgroundColor: C.white,
//     alignItems: 'center', justifyContent: 'center',
//     shadowColor: '#000', shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 3 }, elevation: 4,
//   },
//   orbitBadge1: { top: 10, left: '15%' },
//   orbitBadge2: { top: 10, right: '15%' },
//   orbitBadge3: { bottom: 10, left: '50%', marginLeft: -20 },

//   welcomeTextBlock: { alignItems: 'center', marginBottom: 24 },
//   welcomeHello: { fontSize: 26, fontWeight: '900', color: C.text, textAlign: 'center' },
//   welcomeSub: { fontSize: 13, color: C.textSec, textAlign: 'center', marginTop: 6, lineHeight: 20 },

//   formCard: {
//     backgroundColor: C.white, borderRadius: 24, padding: 20,
//     shadowColor: C.primary, shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 8 }, elevation: 8,
//     marginBottom: 20,
//     borderWidth: 1, borderColor: '#FCE4EC',
//   },

//   fieldWrap: { marginBottom: 16 },
//   fieldLabel: { fontSize: 12.5, fontWeight: '700', color: C.text, marginBottom: 6, letterSpacing: 0.2 },
//   fieldBox: {
//     flexDirection: 'row', alignItems: 'center',
//     backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: C.border,
//     borderRadius: 12, paddingHorizontal: 14,
//     paddingVertical: Platform.OS === 'ios' ? 13 : 5, minHeight: 50,
//   },
//   fieldBoxFocused: { borderColor: C.primary, borderWidth: 2, backgroundColor: C.white },
//   fieldIcon: { fontSize: 15, marginRight: 8 },
//   fieldInput: { flex: 1, fontSize: 14, color: C.text, padding: 0 },

//   forgotWrap: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 16 },
//   forgotText: { fontSize: 13, color: C.primary, fontWeight: '700' },

//   loginBtn: {
//     borderRadius: 14, overflow: 'hidden',
//     shadowColor: C.primary, shadowOpacity: 0.4,
//     shadowOffset: { width: 0, height: 8 }, elevation: 8,
//   },
//   loginBtnGrad: { paddingVertical: 17, alignItems: 'center', justifyContent: 'center' },
//   loginBtnText: { color: C.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

//   orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
//   orLine: { flex: 1, height: 1, backgroundColor: C.border },
//   orText: { fontSize: 12, color: C.textSec },

//   socialRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
//   socialBtn: {
//     flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
//     paddingVertical: 14, borderRadius: 12, gap: 8,
//     backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
//     shadowColor: '#000', shadowOpacity: 0.04,
//     shadowOffset: { width: 0, height: 2 }, elevation: 2,
//   },
//   fbBtn: { backgroundColor: '#1877F2', borderColor: '#1877F2' },
//   googleG: { fontSize: 18, fontWeight: '900', color: '#DB4437' },
//   fbF: { fontSize: 18, fontWeight: '900', color: C.white },
//   socialText: { fontSize: 14, fontWeight: '700', color: C.text },

//   registerRow: { alignItems: 'center', paddingVertical: 8 },
//   registerText: { fontSize: 13.5, color: C.textSec },
//   registerBold: { color: C.primary, fontWeight: '800' },
// });

// export default SellerLoginScreen;





















// src/screens/seller/SellerLoginScreen.js
// ✅ FIXED:
//  - Uses loginSeller() from ShopContext
//  - If seller is PENDING, shows "waiting for admin approval" message
//  - If seller is APPROVED, logs in and goes to SellerTabs
//  - Demo login still works for testing

import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated, StatusBar, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useShop } from "../../context/ShopContext";

const { width, height } = Dimensions.get("window");

const C = {
  primary: "#082843",
  primaryDark: "#082843",
  primaryLight: "#FFFFFF",
  white: "#FFFFFF",
  bg: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E5E7EB",
  text: "#1A1A2E",
  textSec: "#6B7280",
  textHint: "#C4C4C4",
  orange: "#F97316",
  green: "#16A34A",
};

const InputField = ({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType = "default", icon, rightElement }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.fieldWrap}>
      {label ? <Text style={s.fieldLabel}>{label}</Text> : null}
      <View style={[s.fieldBox, focused && s.fieldBoxFocused]}>
        {icon ? <Text style={s.fieldIcon}>{icon}</Text> : null}
        <TextInput
          style={s.fieldInput}
          placeholder={placeholder}
          placeholderTextColor={C.textHint}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightElement}
      </View>
    </View>
  );
};

const SellerLoginScreen = ({ navigation }) => {
  const { loginSeller } = useShop();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 650, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert("Required", "Please enter email or phone number.");
      return;
    }
    if (!password) {
      Alert.alert("Required", "Please enter your password.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      // ✅ Use ShopContext loginSeller
      const result = loginSeller(email.trim(), password);

      if (!result) {
        Alert.alert("Login Failed", "Invalid credentials. Please try again.");
        return;
      }

      // ✅ Check if seller is still PENDING approval
      if (result.error === "pending") {
        Alert.alert(
          "Account Pending ⏳",
          result.message || "Your account is pending admin approval. You will be notified once approved.",
          [{ text: "OK" }]
        );
        return;
      }

      // ✅ Check if not found
      if (result.error === "not_found") {
        Alert.alert(
          "Login Failed",
          result.message || "No account found with these credentials. Please register first.",
          [
            { text: "Register", onPress: () => navigation.navigate("SellerRegistrationScreen") },
            { text: "Try Again", style: "cancel" },
          ]
        );
        return;
      }

      // ✅ Success — navigate to seller dashboard
      navigation.replace("SellerTabs");
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.bgBlob1} />
      <View style={s.bgBlob2} />

      <ScrollView
        style={s.screen}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.navigate("SellerOnboardingScreen")}
        >
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>

        <Animated.View style={[s.heroSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <LinearGradient colors={[C.primaryLight, C.white]} style={s.avatarCircle}>
              <Text style={s.avatarEmoji}>👤</Text>
            </LinearGradient>
          </Animated.View>
          <View style={[s.orbitBadge, s.orbitBadge1]}><Text style={{ fontSize: 16 }}>🛍️</Text></View>
          <View style={[s.orbitBadge, s.orbitBadge2]}><Text style={{ fontSize: 16 }}>⭐</Text></View>
          <View style={[s.orbitBadge, s.orbitBadge3]}><Text style={{ fontSize: 16 }}>💰</Text></View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={s.welcomeTextBlock}>
            <Text style={s.welcomeHello}>Welcome Back! 👋</Text>
            <Text style={s.welcomeSub}>Login to manage your seller store</Text>
          </View>

          <View style={s.formCard}>
            <InputField
              label="Email or Phone Number"
              placeholder="Enter email or phone"
              value={email}
              onChangeText={setEmail}
              icon="✉️"
              keyboardType="email-address"
            />
            <InputField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              icon="🔒"
              secureTextEntry={!showPwd}
              rightElement={
                <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 16 }}>{showPwd ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              onPress={() => Alert.alert("Forgot Password", "A reset link will be sent to your registered email.")}
              style={s.forgotWrap}
            >
              <Text style={s.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.loginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.87}
            >
              <LinearGradient
                colors={[C.primary, C.primaryDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.loginBtnGrad}
              >
                {loading
                  ? <ActivityIndicator color={C.white} size="small" />
                  : <Text style={s.loginBtnText}>Login to Dashboard  →</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ✅ Demo login hint */}
          <View style={s.demoBox}>
            <Text style={s.demoTitle}>🧪 Demo Login</Text>
            <Text style={s.demoText}>Email: demo@seller.com | Password: any</Text>
          </View>

          <View style={s.orRow}>
            <View style={s.orLine} />
            <Text style={s.orText}>or continue with</Text>
            <View style={s.orLine} />
          </View>

          <View style={s.socialRow}>
            <TouchableOpacity
              style={s.socialBtn}
              onPress={() => Alert.alert("Google", "Google login coming soon.")}
              activeOpacity={0.8}
            >
              <Text style={s.googleG}>G</Text>
              <Text style={s.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.socialBtn, s.fbBtn]}
              onPress={() => Alert.alert("Facebook", "Facebook login coming soon.")}
              activeOpacity={0.8}
            >
              <Text style={s.fbF}>f</Text>
              <Text style={[s.socialText, { color: C.white }]}>Facebook</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={s.registerRow}
            onPress={() => navigation.navigate("SellerRegistrationScreen")}
          >
            <Text style={s.registerText}>
              New seller?{" "}
              <Text style={s.registerBold}>Create an Account 🚀</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 },
  bgBlob1: {
    position: "absolute", top: -80, right: -60,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: "#E0F2FE", opacity: 0.4,
  },
  bgBlob2: {
    position: "absolute", bottom: 120, left: -80,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: "#FFD0E8", opacity: 0.18,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: C.white, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 },
    elevation: 3, marginBottom: 8, alignSelf: "flex-start",
  },
  backArrow: { fontSize: 20, color: C.primary, fontWeight: "700" },
  heroSection: {
    alignItems: "center", justifyContent: "center",
    height: 160, marginVertical: 8, position: "relative",
  },
  avatarCircle: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: "center", justifyContent: "center",
    shadowColor: C.primary, shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 }, elevation: 10,
  },
  avatarEmoji: { fontSize: 54 },
  orbitBadge: {
    position: "absolute", width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.white, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  orbitBadge1: { top: 10, left: "15%" },
  orbitBadge2: { top: 10, right: "15%" },
  orbitBadge3: { bottom: 10, left: "50%", marginLeft: -20 },
  welcomeTextBlock: { alignItems: "center", marginBottom: 24 },
  welcomeHello: { fontSize: 26, fontWeight: "900", color: C.text, textAlign: "center" },
  welcomeSub: { fontSize: 13, color: C.textSec, textAlign: "center", marginTop: 6, lineHeight: 20 },
  formCard: {
    backgroundColor: C.white, borderRadius: 24, padding: 20,
    shadowColor: C.primary, shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 }, elevation: 8,
    marginBottom: 16, borderWidth: 1, borderColor: "#FCE4EC",
  },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 12.5, fontWeight: "700", color: C.text, marginBottom: 6, letterSpacing: 0.2 },
  fieldBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 5, minHeight: 50,
  },
  fieldBoxFocused: { borderColor: C.primary, borderWidth: 2, backgroundColor: C.white },
  fieldIcon: { fontSize: 15, marginRight: 8 },
  fieldInput: { flex: 1, fontSize: 14, color: C.text, padding: 0 },
  forgotWrap: { alignSelf: "flex-end", marginTop: -8, marginBottom: 16 },
  forgotText: { fontSize: 13, color: C.primary, fontWeight: "700" },
  loginBtn: {
    borderRadius: 14, overflow: "hidden",
    shadowColor: C.primary, shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  loginBtnGrad: { paddingVertical: 17, alignItems: "center", justifyContent: "center" },
  loginBtnText: { color: C.white, fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
  // ✅ Demo hint box
  demoBox: {
    backgroundColor: "#FFF7ED", borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: "#FED7AA", marginBottom: 16,
  },
  demoTitle: { fontSize: 12, fontWeight: "900", color: "#92400E", marginBottom: 2 },
  demoText: { fontSize: 11, color: "#78350F", fontWeight: "600" },
  orRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: C.border },
  orText: { fontSize: 12, color: C.textSec },
  socialRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  socialBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 14, borderRadius: 12, gap: 8,
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
    shadowColor: "#000", shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  fbBtn: { backgroundColor: "#1877F2", borderColor: "#1877F2" },
  googleG: { fontSize: 18, fontWeight: "900", color: "#DB4437" },
  fbF: { fontSize: 18, fontWeight: "900", color: C.white },
  socialText: { fontSize: 14, fontWeight: "700", color: C.text },
  registerRow: { alignItems: "center", paddingVertical: 8 },
  registerText: { fontSize: 13.5, color: C.textSec },
  registerBold: { color: C.primary, fontWeight: "800" },
});

export default SellerLoginScreen;