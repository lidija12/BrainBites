// app/(tabs)/_layout.js
// Tab Navigation (Bottom Tabs) + Login-Guard

import React, { useEffect, useState } from "react";
import { Tabs, router } from "expo-router";
import { getCurrentUser } from "../../src/auth/auth";

export default function TabsLayout() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        (async () => {
            const u = await getCurrentUser();
            if (!u) {
                router.replace("/login"); // wenn nicht eingeloggt -> Login Screen
                return;
            }
            setReady(true);
        })();
    }, []);

    if (!ready) return null; // verhindert kurz "Flackern"

    return (
        <Tabs screenOptions={{ headerShown: true }}>
            <Tabs.Screen name="index" options={{ title: "Decks", tabBarLabel: "Decks" }} />
            <Tabs.Screen name="create" options={{ title: "Erstellen", tabBarLabel: "Erstellen" }} />
            <Tabs.Screen name="settings" options={{ title: "Einstellungen", tabBarLabel: "Einstellungen" }} />
        </Tabs>
    );
}
