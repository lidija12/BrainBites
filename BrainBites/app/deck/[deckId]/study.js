// app/deck/[deckId]/study.js
// Lernmodus: Karte flippen + Richtig/Falsch + Ergebnis + ✅ Tilt (links/rechts) Shuffle

import React, { useMemo, useState, useEffect, useRef } from "react"; //useRef dazu
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useDecks } from "../../../state/DeckStore";
import { COLORS } from "../../../src/theme/colors";
import { Accelerometer } from "expo-sensors"; //NEW

export default function StudyScreen() {
    const { deckId } = useLocalSearchParams();
    const { decks } = useDecks();

    const deck = useMemo(
        () => decks.find((d) => String(d.id) === String(deckId)),
        [decks, deckId]
    );

    //lokale Karten-Reihenfolge (damit Shuffle nur hier wirkt)
    const [cardsOrder, setCardsOrder] = useState([]);
    const cards = cardsOrder.length ? cardsOrder : (deck?.cards ?? []);

    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    //Antworten pro Karte speichern: { [cardId]: "correct" | "wrong" }
    const [answers, setAnswers] = useState({});

    const card = cards[index];

    //Deck-Wechsel / Reload -> reset + Karten-Order setzen
    useEffect(() => {
        setIndex(0);
        setFlipped(false);
        setAnswers({});
        setCardsOrder(deck?.cards ?? []);
    }, [deckId, deck?.cards?.length]); // deckId reicht meist, length hilft bei neu geladenen Karten

    // -----------------------------
    //Tilt-to-Shuffle (links/rechts neigen)
    // -----------------------------
    const subRef = useRef(null);
    const lastTiltRef = useRef(0);
    const armedRef = useRef(true); // muss erst wieder neutral sein

    const shuffleCards = () => {
        // Fisher–Yates
        setCardsOrder((prev) => {
            const arr = [...prev];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        });

        // optional: wieder zur ersten Karte (fühlt sich "Shuffle" an)
        setIndex(0);
        setFlipped(false);
    };

    useEffect(() => {
        // wenn keine Karten -> kein Listener
        if (!cards.length) return;

        Accelerometer.setUpdateInterval(120);

        const COOLDOWN = 900;        // ms
        const TILT_THRESHOLD = 0.75; // ggf. 0.65–0.85
        const NEUTRAL = 0.25;

        subRef.current = Accelerometer.addListener(({ x, y }) => {
            const now = Date.now();

            // wieder "scharf" wenn neutral
            if (Math.abs(x) < NEUTRAL && Math.abs(y) < NEUTRAL) {
                armedRef.current = true;
            }
            if (!armedRef.current) return;

            const tiltLeft = x < -TILT_THRESHOLD;
            const tiltRight = x > TILT_THRESHOLD;

            if ((tiltLeft || tiltRight) && now - lastTiltRef.current > COOLDOWN) {
                lastTiltRef.current = now;
                armedRef.current = false;
                shuffleCards();
            }
        });

        return () => {
            subRef.current?.remove?.();
            subRef.current = null;
        };
    }, [cards.length]); // nur wenn Kartenzahl sich ändert

    const frontText = useMemo(() => {
        if (!card) return "";
        return card.front ?? card.question ?? card.term ?? card.title ?? "Vorderseite fehlt";
    }, [card]);

    const backText = useMemo(() => {
        if (!card) return "";
        return card.back ?? card.answer ?? card.definition ?? card.content ?? "Rückseite fehlt";
    }, [card]);

    const total = cards.length;
    const currentAnswer = card?.id ? answers[card.id] : null;

    const correctCount = useMemo(
        () => Object.values(answers).filter((v) => v === "correct").length,
        [answers]
    );
    const wrongCount = useMemo(
        () => Object.values(answers).filter((v) => v === "wrong").length,
        [answers]
    );

    const finish = () => {
        Alert.alert(
            "Ergebnis",
            `Du hast ${correctCount} von ${total} richtig ✅\nFalsch: ${wrongCount} ❌`
        );
    };

    const goNext = () => {
        if (!cards.length) return;
        setFlipped(false);
        setIndex((prev) => (prev + 1 < cards.length ? prev + 1 : prev));
    };

    const goPrev = () => {
        if (!cards.length) return;
        setFlipped(false);
        setIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
    };

    const mark = (value) => {
        if (!card?.id) return;
        setAnswers((prev) => ({ ...prev, [card.id]: value }));
    };

    if (!deck) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Lernmodus</Text>
                <Text style={{ color: COLORS.text }}>Deck nicht gefunden.</Text>
                <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
                    <Text style={styles.secondaryText}>Zurück</Text>
                </Pressable>
            </View>
        );
    }

    if (!cards.length) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{deck.title ?? deck.name ?? "Deck"}</Text>
                <Text style={{ color: COLORS.text, opacity: 0.75 }}>Keine Karten im Deck.</Text>
                <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
                    <Text style={styles.secondaryText}>Zurück</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>{deck.title ?? deck.name ?? "Lernmodus"}</Text>
                <Text style={styles.progress}>
                    {index + 1}/{total}
                </Text>
            </View>

            {/* Live Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statPill}><Text style={styles.statText}>✅ {correctCount}</Text></View>
                <View style={styles.statPill}><Text style={styles.statText}>❌ {wrongCount}</Text></View>

                <Pressable style={styles.finishPill} onPress={finish}>
                    <Text style={styles.finishText}>Ergebnis</Text>
                </Pressable>
            </View>

            {/* Karte */}
            <Pressable
                onPress={() => setFlipped((v) => !v)}
                style={[
                    styles.card,
                    currentAnswer === "correct" && styles.cardCorrect,
                    currentAnswer === "wrong" && styles.cardWrong,
                ]}
            >
                <Text style={styles.sideLabel}>{flipped ? "Antwort" : "Frage"}</Text>
                <Text style={styles.cardText}>{flipped ? backText : frontText}</Text>
                <Text style={styles.tapHint}>Tippen zum Umdrehen</Text>
            </Pressable>

            {/* Richtig/Falsch (bleibt sichtbar, weil answer gespeichert) */}
            <View style={styles.answerRow}>
                <Pressable
                    onPress={() => mark("wrong")}
                    style={[
                        styles.answerBtn,
                        styles.wrongBtn,
                        currentAnswer === "wrong" && styles.answerSelected,
                    ]}
                >
                    <Text style={styles.answerText}>Falsch</Text>
                </Pressable>

                <Pressable
                    onPress={() => mark("correct")}
                    style={[
                        styles.answerBtn,
                        styles.correctBtn,
                        currentAnswer === "correct" && styles.answerSelected,
                    ]}
                >
                    <Text style={styles.answerText}>Richtig</Text>
                </Pressable>
            </View>

            {/* Navigation (manuell Weiter/Zurück) */}
            <View style={styles.navRow}>
                <Pressable style={styles.secondaryBtn} onPress={goPrev} disabled={index === 0}>
                    <Text style={[styles.secondaryText, index === 0 && { opacity: 0.4 }]}>Zurück</Text>
                </Pressable>

                <Pressable
                    style={styles.primaryBtn}
                    onPress={() => {
                        if (index >= total - 1) finish();
                        else goNext();
                    }}
                >
                    <Text style={styles.primaryText}>{index >= total - 1 ? "Fertig" : "Weiter"}</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 18, gap: 14, backgroundColor: COLORS.bg },

    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
    title: { fontSize: 22, fontWeight: "900", color: COLORS.text },
    progress: { fontWeight: "900", color: COLORS.text, opacity: 0.7 },

    statsRow: { flexDirection: "row", gap: 10, alignItems: "center" },
    statPill: {
        paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999,
        borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card,
    },
    statText: { fontWeight: "900", color: COLORS.text },

    finishPill: {
        marginLeft: "auto",
        paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999,
        borderWidth: 1, borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft,
    },
    finishText: { fontWeight: "900", color: COLORS.text },

    card: {
        borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card,
        borderRadius: 18, padding: 18, minHeight: 220, justifyContent: "center", gap: 10,
    },
    cardCorrect: { borderColor: COLORS.greenBorder, borderWidth: 2 },
    cardWrong: { borderColor: COLORS.redBorder, borderWidth: 2 },

    sideLabel: { fontWeight: "900", opacity: 0.6, color: COLORS.text },
    cardText: { fontSize: 18, fontWeight: "900", color: COLORS.text, lineHeight: 24 },
    tapHint: { marginTop: 10, opacity: 0.55, fontSize: 12, color: COLORS.text },

    answerRow: { flexDirection: "row", gap: 12 },
    answerBtn: {
        flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: "center", borderWidth: 1,
    },
    wrongBtn: { backgroundColor: COLORS.redBg, borderColor: COLORS.redBorder },
    correctBtn: { backgroundColor: COLORS.greenBg, borderColor: COLORS.greenBorder },
    answerSelected: { borderWidth: 2 },

    answerText: { fontWeight: "900", color: COLORS.text },

    navRow: { flexDirection: "row", gap: 12, marginTop: 6 },
    primaryBtn: {
        flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: "center",
        borderWidth: 1, borderColor: COLORS.primary, backgroundColor: COLORS.primary,
    },
    primaryText: { fontWeight: "900", color: "#fff" },

    secondaryBtn: {
        flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: "center",
        borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card,
    },
    secondaryText: { fontWeight: "900", color: COLORS.text },
});
