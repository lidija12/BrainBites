// state/DeckStore.js
// Globaler Deck-Store mit Firestore als Persistenz (ohne AsyncStorage).

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { db } from "../lib/firebase";
import { seedDecks } from "../lib/seed";

// Firestore (modular)
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    getDocs,
    limit,
    arrayUnion,
    getDoc,
    setDoc,
    deleteDoc,
} from "firebase/firestore";

const DeckContext = createContext(null);

export function DeckProvider({ children }) {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Collection: /decks
    const decksRef = collection(db, "decks");

// Falls Firestore leer ist -> Beispiel-Decks rein (nur 1x, mit Marker-Dokument)
    const ensureSeedData = async () => {
        // Marker-Dokument: /meta/seed
        const seedDocRef = doc(db, "meta", "seed");
        const seedSnap = await getDoc(seedDocRef);

        // Wenn schon seeded: abbrechen
        if (seedSnap.exists() && seedSnap.data()?.seeded === true) return;

        // Prüfen, ob schon Decks existieren
        const snap = await getDocs(query(decksRef, limit(1)));
        if (!snap.empty) {
            // Es gibt bereits Daten -> Marker setzen, damit es nicht nochmals versucht wird
            await setDoc(seedDocRef, { seeded: true, seededAt: serverTimestamp() }, { merge: true });
            return;
        }

        // Seed-Decks erstellen
        for (const d of seedDecks) {
            await addDoc(decksRef, {
                title: d.title,
                description: d.description ?? "",
                cards: d.cards ?? [],
                createdAt: serverTimestamp(),
            });
        }

        // Marker setzen
        await setDoc(seedDocRef, { seeded: true, seededAt: serverTimestamp() }, { merge: true });
    };

    // Live Listener: Decks laden
    useEffect(() => {
        let unsub = () => {};

        (async () => {
            try {
                await ensureSeedData();

                // Neueste zuerst (createdAt)
                const q = query(decksRef, orderBy("createdAt", "desc"));

                unsub = onSnapshot(
                    q,
                    (snapshot) => {
                        const list = snapshot.docs.map((d) => ({
                            id: d.id, // Firestore Doc ID
                            ...d.data(),
                        }));
                        setDecks(list);
                        setLoading(false);
                    },
                    (error) => {
                        console.warn("Firestore Listener Fehler:", error);
                        setLoading(false);
                    }
                );
            } catch (e) {
                console.warn("Firestore Init Fehler:", e);
                setLoading(false);
            }
        })();

        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

// Deck erstellen (Firestore) -> gibt die neue Deck-ID zurück
    const addDeck = async (title, description) => {
        const t = title.trim();
        if (!t) return null;

        const ref = await addDoc(decksRef, {
            title: t,
            description: (description ?? "").trim(),
            cards: [],
            createdAt: serverTimestamp(),
        });

        return ref.id; // wichtig für Create-Screen (direkt auswählen)
    };

    // Karte hinzufügen (in cards-Array speichern)
    const addCard = async (deckId, front, back) => {
        const f = front.trim();
        const b = back.trim();
        if (!deckId || !f || !b) return;

        const deckDoc = doc(db, "decks", deckId);

        const newCard = {
            id: `${Date.now()}`, // Demo-ID
            front: f,
            back: b,
            createdAt: Date.now(),
        };

        // arrayUnion fügt Element ans Array an (ohne vorher lesen)
        await updateDoc(deckDoc, {
            cards: arrayUnion(newCard),
        });
    };
    // Deck bearbeiten (Titel/Beschreibung)
    const updateDeck = async (deckId, { title, description }) => {
        if (!deckId) return;

        const deckDoc = doc(db, "decks", deckId);

        const payload = {};
        if (typeof title === "string") payload.title = title.trim();
        if (typeof description === "string") payload.description = description.trim();

        // nichts zu updaten?
        if (Object.keys(payload).length === 0) return;

        await updateDoc(deckDoc, payload);
    };

// Deck löschen
    const deleteDeck = async (deckId) => {
        if (!deckId) return;
        const deckDoc = doc(db, "decks", deckId);
        await deleteDoc(deckDoc);
    };

// Karte bearbeiten (front/back)
    const updateCard = async (deckId, cardId, { front, back }) => {
        if (!deckId || !cardId) return;

        const deck = decks.find((d) => d.id === deckId);
        if (!deck) return;

        const updatedCards = (deck.cards ?? []).map((c) =>
            c.id === cardId
                ? { ...c, front: front?.trim() ?? c.front, back: back?.trim() ?? c.back }
                : c
        );

        const deckDoc = doc(db, "decks", deckId);
        await updateDoc(deckDoc, { cards: updatedCards });
    };

// Karte löschen
    const deleteCard = async (deckId, cardId) => {
        if (!deckId || !cardId) return;

        const deck = decks.find((d) => d.id === deckId);
        if (!deck) return;

        const updatedCards = (deck.cards ?? []).filter((c) => c.id !== cardId);

        const deckDoc = doc(db, "decks", deckId);
        await updateDoc(deckDoc, { cards: updatedCards });
    };

    // Deck im aktuellen State finden
    const getDeckById = (deckId) => decks.find((d) => d.id === deckId);

    const value = useMemo(
        () => ({
            decks,
            loading,
            addDeck,
            addCard,
            getDeckById,
            updateDeck,
            deleteDeck,
            updateCard,
            deleteCard,
        }),
        [decks, loading]
    );

    return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDecks() {
    const ctx = useContext(DeckContext);
    if (!ctx) throw new Error("useDecks must be used inside <DeckProvider>");
    return ctx;
}
