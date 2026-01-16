// app/(tabs)/create.js
// Erstellen-Screen: neues Deck anlegen + Karten zu einem Deck hinzufügen (Firestore via Store).

import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { useDecks } from "../../state/DeckStore";
import { COLORS } from "../../src/theme/colors"; // ✅ NEW

export default function CreateScreen() {
    const { decks, addDeck, addCard } = useDecks();

    const [deckTitle, setDeckTitle] = useState("");
    const [deckDesc, setDeckDesc] = useState("");

    const [selectedDeckId, setSelectedDeckId] = useState("");
    const [front, setFront] = useState("");
    const [back, setBack] = useState("");

    useEffect(() => {
        if (!selectedDeckId && decks.length > 0) {
            setSelectedDeckId(decks[0].id);
        }
    }, [decks, selectedDeckId]);

    const onAddDeck = async () => {
        const title = deckTitle.trim();
        if (!title) return;

        const newId = await addDeck(title, deckDesc.trim());

        setDeckTitle("");
        setDeckDesc("");

        if (newId) setSelectedDeckId(newId);
    };

    const onAddCard = async () => {
        const f = front.trim();
        const b = back.trim();

        if (!selectedDeckId) return;
        if (!f || !b) return;

        await addCard(selectedDeckId, f, b);

        setFront("");
        setBack("");
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: COLORS.bg }} // ✅
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={90}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Text style={styles.title}>Erstellen</Text>

                    {/* --- SECTION: Neues Deck --- */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Neues Deck</Text>

                        <TextInput
                            style={styles.input}
                            placeholder='Deck-Titel (z.B. "Java Grundlagen")'
                            placeholderTextColor={COLORS.text + "80"}
                            value={deckTitle}
                            onChangeText={setDeckTitle}
                            returnKeyType="next"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Beschreibung (optional)"
                            placeholderTextColor={COLORS.text + "80"}
                            value={deckDesc}
                            onChangeText={setDeckDesc}
                            returnKeyType="done"
                        />

                        <Pressable style={styles.primaryBtn} onPress={onAddDeck}>
                            <Text style={styles.primaryText}>Deck hinzufügen</Text>
                        </Pressable>
                    </View>

                    {/* --- SECTION: Karte hinzufügen --- */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Karte hinzufügen</Text>

                        <Text style={styles.label}>Deck auswählen:</Text>

                        <FlatList
                            horizontal
                            data={decks}
                            keyExtractor={(d) => d.id}
                            contentContainerStyle={{ gap: 8, paddingVertical: 6 }}
                            keyboardShouldPersistTaps="handled"
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const active = item.id === selectedDeckId;

                                return (
                                    <Pressable
                                        style={[styles.deckChip, active && styles.deckChipActive]}
                                        onPress={() => setSelectedDeckId(item.id)}
                                    >
                                        <Text style={[styles.deckChipText, active && styles.deckChipTextActive]}>
                                            {item.title}
                                        </Text>
                                    </Pressable>
                                );
                            }}
                        />

                        <TextInput
                            style={[styles.input, styles.multiInput]}
                            placeholder="Vorderseite (Frage)"
                            placeholderTextColor={COLORS.text + "80"}
                            value={front}
                            onChangeText={setFront}
                            multiline
                        />

                        <TextInput
                            style={[styles.input, styles.multiInput]}
                            placeholder="Rückseite (Antwort)"
                            placeholderTextColor={COLORS.text + "80"}
                            value={back}
                            onChangeText={setBack}
                            multiline
                        />

                        <Pressable style={styles.primaryBtn} onPress={onAddCard}>
                            <Text style={styles.primaryText}>Karte hinzufügen</Text>
                        </Pressable>
                    </View>

                    <Text style={styles.hint}>Tipp: Im Tab „Decks“ siehst du neue Decks/Karten sofort.</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 18,
        paddingBottom: 40,
        gap: 12,
        backgroundColor: COLORS.bg, // ✅
    },

    title: { fontSize: 24, fontWeight: "900", color: COLORS.text }, // ✅

    card: {
        backgroundColor: COLORS.card, // ✅
        borderColor: COLORS.border, // ✅
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        gap: 10,
    },

    sectionTitle: { fontSize: 16, fontWeight: "900", color: COLORS.text }, // ✅
    label: { opacity: 0.75, marginTop: 4, color: COLORS.text }, // ✅

    input: {
        borderWidth: 1,
        borderColor: COLORS.border, // ✅
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#fff",
        color: COLORS.text, // ✅
    },

    multiInput: {
        minHeight: 56,
        textAlignVertical: "top",
    },

    primaryBtn: {
        borderWidth: 1,
        borderColor: COLORS.primary, // ✅
        backgroundColor: COLORS.primary, // ✅
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 4,
    },
    primaryText: { fontWeight: "900", color: "#fff" },

    deckChip: {
        borderWidth: 1,
        borderColor: COLORS.border, // ✅
        backgroundColor: COLORS.card, // ✅
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    deckChipActive: {
        backgroundColor: COLORS.primary, // ✅
        borderColor: COLORS.primary, // ✅
    },
    deckChipText: { fontWeight: "800", color: COLORS.text },
    deckChipTextActive: { color: "#fff" },

    hint: { marginTop: 2, opacity: 0.65, color: COLORS.text }, // ✅
});
