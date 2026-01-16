// app/deck/[deckId]/index.js
// Deck-Detail: lädt Deck aus globalem Store anhand deckId.

import React from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDecks } from "../../../state/DeckStore";
import { COLORS } from "../../../src/theme/colors"; // ✅ FIX: richtiger Pfad
import { Stack } from "expo-router";


export default function DeckDetail() {
    const { deckId } = useLocalSearchParams();
    const router = useRouter();

    const { getDeckById } = useDecks();
    const deck = getDeckById(deckId);

    if (!deck) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Deck nicht gefunden</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: deck.title }} />
            <Text style={styles.title}>{deck.title}</Text>
            {!!deck.description && <Text style={styles.subtitle}>{deck.description}</Text>}

            {/* Deck bearbeiten */}
            <Pressable style={styles.secondaryButton} onPress={() => router.push(`/deck/${deck.id}/edit`)}>
                <Text style={styles.secondaryButtonText}>Deck bearbeiten</Text>
            </Pressable>

            {/* Lernmodus */}
            <Pressable style={styles.primaryButton} onPress={() => router.push(`/deck/${deck.id}/study`)}>
                <Text style={styles.primaryButtonText}>Lernmodus starten</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Karten</Text>

            <FlatList
                data={deck.cards}
                keyExtractor={(c) => c.id}
                contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.cardRow}
                        onPress={() => router.push(`/deck/${deck.id}/cards/${item.id}/edit`)}
                    >
                        <Text style={styles.front}>{item.front}</Text>
                        <Text style={styles.back}>{item.back}</Text>
                    </Pressable>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 18,
        backgroundColor: COLORS.bg, // ✅
        gap: 8,
    },

    title: { fontSize: 24, fontWeight: "800", color: COLORS.text }, // ✅
    subtitle: { marginTop: 6, opacity: 0.75, color: COLORS.text }, // ✅

    sectionTitle: {
        marginTop: 18,
        marginBottom: 10,
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.text, // ✅
    },

    // ✅ Secondary Button (white)
    secondaryButton: {
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
        alignItems: "center",
    },
    secondaryButtonText: { fontWeight: "800", color: COLORS.text },

    // ✅ Primary Button (sage)
    primaryButton: {
        marginTop: 14,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
        alignItems: "center",
    },
    primaryButtonText: { fontWeight: "900", color: "#fff" },

    // ✅ Card rows
    cardRow: {
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        gap: 6,
    },
    front: { fontWeight: "800", color: COLORS.text },
    back: { opacity: 0.75, color: COLORS.text },
});
