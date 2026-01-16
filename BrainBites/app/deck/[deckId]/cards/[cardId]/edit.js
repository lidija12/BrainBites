import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useDecks } from "../../../../../state/DeckStore";
import { COLORS } from "../../../../../src/theme/colors"; // ✅ FIX

export default function CardEdit() {
    const { deckId, cardId } = useLocalSearchParams();
    const router = useRouter();

    const { getDeckById, updateCard, deleteCard } = useDecks();
    const deck = getDeckById(deckId);
    const card = deck?.cards?.find((c) => String(c.id) === String(cardId));

    const [front, setFront] = useState(card?.front ?? "");
    const [back, setBack] = useState(card?.back ?? "");

    useEffect(() => {
        setFront(card?.front ?? "");
        setBack(card?.back ?? "");
    }, [deckId, cardId, card?.front, card?.back]);

    if (!deck || !card) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Karte nicht gefunden</Text>
            </View>
        );
    }

    const onSave = async () => {
        await updateCard(deck.id, card.id, { front, back });
        router.back();
    };

    const onDelete = () => {
        Alert.alert("Karte löschen?", "Diese Karte wird dauerhaft gelöscht.", [
            { text: "Abbrechen", style: "cancel" },
            {
                text: "Löschen",
                style: "destructive",
                onPress: async () => {
                    await deleteCard(deck.id, card.id);
                    router.back();
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Karte bearbeiten</Text>

            <Text style={styles.label}>Vorderseite (Frage)</Text>
            <TextInput style={[styles.input, styles.multiline]} value={front} onChangeText={setFront} multiline />

            <Text style={styles.label}>Rückseite (Antwort)</Text>
            <TextInput style={[styles.input, styles.multiline]} value={back} onChangeText={setBack} multiline />

            <Pressable style={styles.primaryBtn} onPress={onSave}>
                <Text style={styles.primaryText}>Speichern</Text>
            </Pressable>

            <Pressable style={styles.dangerBtn} onPress={onDelete}>
                <Text style={styles.dangerText}>Karte löschen</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 18, gap: 10, backgroundColor: COLORS.bg },
    title: { fontSize: 22, fontWeight: "900", marginBottom: 8, color: COLORS.text },
    label: { fontWeight: "800", marginTop: 6, color: COLORS.text },

    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 12,
        color: COLORS.text,
    },
    multiline: { minHeight: 110, textAlignVertical: "top" },

    primaryBtn: {
        marginTop: 10,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
        alignItems: "center",
    },
    primaryText: { fontWeight: "900", color: "#fff" },

    dangerBtn: {
        marginTop: 6,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.redBorder,
        backgroundColor: COLORS.redBg,
        alignItems: "center",
    },
    dangerText: { fontWeight: "900", color: COLORS.text },
});
