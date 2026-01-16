// app/login.js
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { router } from "expo-router";
import { getCurrentUser, login, register } from "../src/auth/auth";
import { COLORS } from "../src/theme/colors";

export default function LoginScreen() {
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Wenn schon eingeloggt -> Tabs
    useEffect(() => {
        (async () => {
            const u = await getCurrentUser();
            if (u) router.replace("/(tabs)");
        })();
    }, []);

    // ✅ Wenn Mode wechselt -> Felder leeren
    useEffect(() => {
        setEmail("");
        setPassword("");
    }, [mode]);

    const submit = async () => {
        try {
            const e = email.trim();

            if (!e.includes("@") || password.length < 4) {
                Alert.alert("Fehler", "Bitte gültige E-Mail und Passwort (min. 4 Zeichen) eingeben.");
                return;
            }

            if (mode === "login") await login(e, password);
            else await register(e, password);

            // ✅ nach Erfolg leeren
            setEmail("");
            setPassword("");
            router.replace("/(tabs)");
        } catch (err) {
            Alert.alert("Fehler", err?.message ?? "Unbekannter Fehler");
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: COLORS.primarySoft }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={80}
            >
                <ScrollView
                    contentContainerStyle={styles.screen}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.card}>
                        <Text style={styles.brand}>BrainBites</Text>
                        <Text style={styles.title}>{mode === "login" ? "Login" : "Account erstellen"}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="E-Mail"
                            placeholderTextColor={COLORS.mutedText}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            importantForAutofill="no"     // ✅ Android: weniger Autofill
                            autoComplete="off"            // ✅
                            textContentType="none"        // ✅ iOS
                            returnKeyType="next"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Passwort"
                            placeholderTextColor={COLORS.mutedText}
                            autoCapitalize="none"
                            autoCorrect={false}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            importantForAutofill="no"
                            autoComplete="off"
                            textContentType="none"
                            returnKeyType="done"
                            onSubmitEditing={submit}
                        />

                        <Pressable style={styles.primaryBtn} onPress={submit}>
                            <Text style={styles.primaryText}>{mode === "login" ? "Einloggen" : "Registrieren"}</Text>
                        </Pressable>

                        <Pressable onPress={() => setMode((prev) => (prev === "login" ? "register" : "login"))}>
                            <Text style={styles.link}>
                                {mode === "login" ? "Noch kein Konto? Registrieren" : "Schon ein Konto? Login"}
                            </Text>
                        </Pressable>

                        {mode === "login" ? (
                            <View style={styles.demoBox}>
                                <Text style={styles.demoTitle}>Demo-Login</Text>
                                <Text style={styles.demoText}>E-Mail: demo@brainbites.ch</Text>
                                <Text style={styles.demoText}>Passwort: demo1234</Text>
                            </View>
                        ) : null}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    screen: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 18,
    },
    card: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 18,
        gap: 12,
    },
    brand: { color: COLORS.primary, fontWeight: "900", fontSize: 18 },
    title: { fontSize: 30, fontWeight: "900", color: COLORS.text, marginBottom: 4 },

    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: COLORS.text,
    },

    primaryBtn: {
        marginTop: 6,
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: "center",
        backgroundColor: COLORS.primary,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    primaryText: { color: "#fff", fontWeight: "900", fontSize: 16 },

    link: { marginTop: 6, textAlign: "center", color: COLORS.primary, fontWeight: "900" },

    demoBox: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.primarySoft,
        borderRadius: 16,
        padding: 12,
        gap: 4,
    },
    demoTitle: { fontWeight: "900", color: COLORS.text, fontSize: 16 },
    demoText: { color: COLORS.text, opacity: 0.85, fontWeight: "700" },
});
