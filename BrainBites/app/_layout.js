// app/_layout.js
import React from "react";
import { Stack } from "expo-router";
import { DeckProvider, useDecks } from "../state/DeckStore";
import { LogBox } from "react-native";

// ✅ Expo Go: diese Warnung nervt, ist aber "nur" remote-push (lokale Notifications gehen trotzdem)
LogBox.ignoreLogs([
    "expo-notifications: Android Push notifications (remote notifications) functionality",
]);

function DeckHeaderTitle() {
    const { deckId } = require("expo-router").useLocalSearchParams();
    const { getDeckById } = useDecks();
    const deck = getDeckById(deckId);
    return deck?.title ?? "Deck";
}

export default function RootLayout() {
    return (
        <DeckProvider>
            <Stack>
                {/* Login Screen ohne Header */}
                <Stack.Screen name="login" options={{ headerShown: false }} />

                {/* Tabs */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                {/* ✅ WICHTIG: index file ist "deck/[deckId]" (nicht /index) */}
                <Stack.Screen
                    name="deck/[deckId]"
                    options={{
                        headerTitle: () => <DeckHeaderTitle />,
                    }}
                />

                <Stack.Screen
                    name="deck/[deckId]/study"
                    options={{
                        title: "Lernmodus",
                    }}
                />

                <Stack.Screen
                    name="deck/[deckId]/edit"
                    options={{
                        title: "Deck bearbeiten",
                    }}
                />

                <Stack.Screen
                    name="deck/[deckId]/cards/[cardId]/edit"
                    options={{
                        title: "Karte bearbeiten",
                    }}
                />
            </Stack>
        </DeckProvider>
    );
}
