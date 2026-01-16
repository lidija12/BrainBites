import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useDecks } from "../../../state/DeckStore";
import { COLORS } from "../../../src/theme/colors"; // ✅ FIX

export default function DeckEdit() {
    const { deckId } = useLocalSearchParams();
    const router = useRouter();
    const { getDeckById, updateDeck, deleteDeck } = useDecks();

    const deck = getDeckById(deckId);

    const [title, setTitle] = useState(deck?.title ?? "");
    const [description, setDescription] = useState(deck?.description ?? "");

    useEffect(() => {
        setTitle(deck?.title ?? "");
        setDescription(deck?.description ?? "");
    }, [deck?.id]);

    if (!deck) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Deck nicht gefunden</Text>
            </View>
        );
    }

    const onSave = async () => {
        await updateDeck(deck.id, { title, description });
        router.back();
    };

    const onDelete = () => {
        Alert.alert("Deck löschen?", "Das Deck wird dauerhaft gelöscht.", [
            { text: "Abbrechen", style: "cancel" },
            {
                text: "Löschen",
                style: "destructive",
                onPress: async () => {
                    await deleteDeck(deck.id);
                    router.replace("/(tabs)");
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Deck bearbeiten</Text>

            <Text style={styles.label}>Titel</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Beschreibung</Text>
            <TextInput
                style={[styles.input, styles.multiline]}
                value={description}
                onChangeText={setDescription}
                multiline
            />

            <Pressable style={styles.primaryBtn} onPress={onSave}>
                <Text style={styles.primaryText}>Speichern</Text>
            </Pressable>

            <Pressable style={styles.dangerBtn} onPress={onDelete}>
                <Text style={styles.dangerText}>Deck löschen</Text>
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
    multiline: { minHeight: 90, textAlignVertical: "top" },

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
