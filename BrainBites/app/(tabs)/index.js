// app/(tabs)/index.js
// Deck-Übersicht: kommt aus dem globalen Store (Context).

import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useDecks } from "../../state/DeckStore";
import { COLORS } from "../../src/theme/colors";

export default function DecksScreen() {
    const router = useRouter();
    const { decks, loading } = useDecks();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>BrainBites</Text>
            <Text style={styles.subtitle}>Wähle ein Deck zum Lernen</Text>

            {loading && <Text style={styles.loading}>Lade Decks...</Text>}

            <FlatList
                data={decks}
                keyExtractor={(deck) => deck.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <Pressable style={styles.card} onPress={() => router.push(`/deck/${item.id}`)}>
                        <Text style={styles.cardTitle}>{item.title}</Text>

                        {!!item.description && <Text style={styles.cardDesc}>{item.description}</Text>}

                        <View style={styles.metaRow}>
                            <Text style={styles.cardMeta}>{item.cards.length} Karten</Text>

                            {/* Kleiner “Open” Hint in Sage */}
                            <Text style={styles.openHint}>Öffnen</Text>
                        </View>
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
        backgroundColor: COLORS.bg,
    },

    title: { fontSize: 28, fontWeight: "900", color: COLORS.text },
    subtitle: { marginTop: 6, fontSize: 14, opacity: 0.75, color: COLORS.text },
    loading: { marginTop: 10, opacity: 0.7, color: COLORS.text },

    listContent: { gap: 12, paddingTop: 16, paddingBottom: 16 },

    card: {
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
        borderRadius: 14,
        gap: 6,
    },

    cardTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text },
    cardDesc: { marginTop: 2, opacity: 0.75, color: COLORS.text },

    metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
    cardMeta: { fontSize: 12, opacity: 0.65, color: COLORS.text },

    openHint: { fontSize: 12, fontWeight: "900", color: COLORS.primary },
});
