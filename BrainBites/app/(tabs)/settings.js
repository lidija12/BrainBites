// app/(tabs)/settings.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch, Pressable, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { COLORS } from "../../src/theme/colors";
import { router } from "expo-router";
import { getCurrentUser, logout } from "../../src/auth/auth";

const STORAGE_KEY = "bb_reminder_settings_v2";
const CHANNEL_ID = "reminders";

const DAY_OPTIONS = [
    { key: 2, label: "Mo" },
    { key: 3, label: "Di" },
    { key: 4, label: "Mi" },
    { key: 5, label: "Do" },
    { key: 6, label: "Fr" },
    { key: 7, label: "Sa" },
    { key: 1, label: "So" },
];

async function ensureAndroidChannel() {
    if (Platform.OS !== "android") return;
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
    });
}

async function requestNotifPermissions() {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted || current.status === "granted") return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted || req.status === "granted";
}

export default function SettingsScreen() {
    const [enabled, setEnabled] = useState(false);
    const [hour, setHour] = useState(19);
    const [minute, setMinute] = useState(30);
    const [scheduledIds, setScheduledIds] = useState([]);
    const [weekdays, setWeekdays] = useState([2, 3, 4, 5, 6]);

    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: false,
                shouldSetBadge: false,
            }),
        });

        (async () => {
            try {
                await ensureAndroidChannel();

                const u = await getCurrentUser();
                setUserEmail(u?.email ?? "");

                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (!raw) return;

                const s = JSON.parse(raw);
                setEnabled(!!s.enabled);
                setHour(Number.isFinite(s.hour) ? s.hour : 19);
                setMinute(Number.isFinite(s.minute) ? s.minute : 30);
                setWeekdays(Array.isArray(s.weekdays) ? s.weekdays : [2, 3, 4, 5, 6]);
                setScheduledIds(Array.isArray(s.scheduledIds) ? s.scheduledIds : []);
            } catch (e) {
                console.warn("Settings load error:", e);
            }
        })();
    }, []);

    const saveSettings = async (next) => {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    const cancelReminders = async (idsToCancel) => {
        try {
            if (!Array.isArray(idsToCancel)) return;
            for (const id of idsToCancel) {
                if (id) await Notifications.cancelScheduledNotificationAsync(id);
            }
        } catch (e) {
            console.warn("Cancel reminder error:", e);
        }
    };

    const scheduleWeeklyReminders = async (selectedDays, h, m) => {
        const newIds = [];
        for (const day of selectedDays) {
            const id = await Notifications.scheduleNotificationAsync({
                content: { title: "BrainBites", body: "Zeit zum Lernen – mach ein paar Flashcards! 💡" },
                trigger: {
                    weekday: day,
                    hour: h,
                    minute: m,
                    repeats: true,
                    ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
                },
            });
            newIds.push(id);
        }
        return newIds;
    };

    const applyReminder = async (nextEnabled, nextDays, nextHour, nextMinute, currentIds) => {
        if (nextEnabled) {
            if (!nextDays || nextDays.length === 0) {
                Alert.alert("Wochentage fehlen", "Bitte mindestens einen Wochentag auswählen.");
                setEnabled(false);
                await cancelReminders(currentIds);
                setScheduledIds([]);
                await saveSettings({ enabled: false, hour: nextHour, minute: nextMinute, weekdays: nextDays, scheduledIds: [] });
                return;
            }

            const ok = await requestNotifPermissions();
            if (!ok) {
                Alert.alert("Keine Berechtigung", "Bitte erlaube Notifications in den Handy-Einstellungen.");
                setEnabled(false);
                await cancelReminders(currentIds);
                setScheduledIds([]);
                await saveSettings({ enabled: false, hour: nextHour, minute: nextMinute, weekdays: nextDays, scheduledIds: [] });
                return;
            }

            await ensureAndroidChannel();
            await cancelReminders(currentIds);

            const newIds = await scheduleWeeklyReminders(nextDays, nextHour, nextMinute);
            setScheduledIds(newIds);

            await saveSettings({ enabled: true, hour: nextHour, minute: nextMinute, weekdays: nextDays, scheduledIds: newIds });
        } else {
            await cancelReminders(currentIds);
            setScheduledIds([]);
            await saveSettings({ enabled: false, hour: nextHour, minute: nextMinute, weekdays: nextDays, scheduledIds: [] });
        }
    };

    const toggleEnabled = async (v) => {
        setEnabled(v);
        await applyReminder(v, weekdays, hour, minute, scheduledIds);
    };

    const toggleWeekday = async (day) => {
        const exists = weekdays.includes(day);
        const nextDays = exists ? weekdays.filter((d) => d !== day) : [...weekdays, day];

        setWeekdays(nextDays);
        await saveSettings({ enabled, hour, minute, weekdays: nextDays, scheduledIds });

        if (enabled) await applyReminder(true, nextDays, hour, minute, scheduledIds);
    };

    const bumpTime = async (deltaMinutes) => {
        let total = hour * 60 + minute + deltaMinutes;
        while (total < 0) total += 1440;
        total = total % 1440;

        const nh = Math.floor(total / 60);
        const nm = total % 60;

        setHour(nh);
        setMinute(nm);

        if (enabled) await applyReminder(true, weekdays, nh, nm, scheduledIds);
        else await saveSettings({ enabled: false, hour: nh, minute: nm, weekdays, scheduledIds: [] });
    };

    const testNotification = async () => {
        const ok = await requestNotifPermissions();
        if (!ok) {
            Alert.alert("Keine Berechtigung", "Bitte erlaube Notifications in den Einstellungen.");
            return;
        }

        await ensureAndroidChannel();
        await Notifications.scheduleNotificationAsync({
            content: { title: "BrainBites", body: "Test-Erinnerung ✅" },
            trigger: { seconds: 2, ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}) },
        });
        Alert.alert("Ok", "Test-Notification kommt in ca. 2 Sekunden.");
    };

    const onLogout = () => {
        Alert.alert("Abmelden?", "Du wirst zurück zum Login geführt.", [
            { text: "Abbrechen", style: "cancel" },
            {
                text: "Abmelden",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    router.replace("/login");
                },
            },
        ]);
    };

    const timeLabel = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Einstellungen</Text>

            <View style={styles.card}>
                {!!userEmail && <Text style={styles.userText}>Eingeloggt als: {userEmail}</Text>}

                <View style={styles.row}>
                    <Text style={styles.label}>Lern-Erinnerungen</Text>
                    <Switch value={enabled} onValueChange={toggleEnabled} />
                </View>

                <Text style={styles.subtext}>
                    Ausgewählte Tage um <Text style={styles.mono}>{timeLabel}</Text>
                </Text>

                <View style={styles.daysWrap}>
                    {DAY_OPTIONS.map((d) => {
                        const active = weekdays.includes(d.key);
                        return (
                            <Pressable
                                key={d.key}
                                onPress={() => toggleWeekday(d.key)}
                                style={[styles.dayChip, active && styles.dayChipActive]}
                            >
                                <Text style={[styles.dayText, active && styles.dayTextActive]}>{d.label}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                <View style={styles.timeRow}>
                    <Pressable style={styles.timeBtn} onPress={() => bumpTime(-15)}>
                        <Text style={styles.timeBtnText}>- 15 min</Text>
                    </Pressable>
                    <Pressable style={styles.timeBtn} onPress={() => bumpTime(+15)}>
                        <Text style={styles.timeBtnText}>+ 15 min</Text>
                    </Pressable>
                </View>

                <Pressable style={styles.primaryBtn} onPress={testNotification}>
                    <Text style={styles.primaryBtnText}>Test-Notification senden</Text>
                </Pressable>

                <Pressable style={styles.logoutBtn} onPress={onLogout}>
                    <Text style={styles.logoutText}>Abmelden</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 18, gap: 12, backgroundColor: COLORS.bg },
    title: { fontSize: 22, fontWeight: "900", color: COLORS.text },

    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        gap: 10,
        backgroundColor: COLORS.card,
        borderColor: COLORS.border,
    },

    userText: { fontWeight: "800", color: COLORS.text, opacity: 0.8 },

    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    label: { fontSize: 16, fontWeight: "900", color: COLORS.text },
    subtext: { opacity: 0.75, color: COLORS.text },
    mono: { fontWeight: "900", color: COLORS.text },

    daysWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
    dayChip: {
        borderWidth: 1,
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    dayChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    dayText: { fontWeight: "900", color: COLORS.text },
    dayTextActive: { color: "#fff" },

    timeRow: { flexDirection: "row", gap: 10 },
    timeBtn: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: "center",
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primarySoft,
    },
    timeBtnText: { fontWeight: "900", color: COLORS.text },

    primaryBtn: {
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 4,
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    primaryBtnText: { fontWeight: "900", color: "#fff" },

    logoutBtn: {
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        borderColor: COLORS.redBorder,
        backgroundColor: COLORS.redBg,
        marginTop: 2,
    },
    logoutText: { fontWeight: "900", color: COLORS.text },
});
