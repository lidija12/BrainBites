// lib/seed.js
// Beispiel-Daten (Decks + Karten) auf Deutsch.
// Diese dienen als Startinhalt, damit die App nicht leer ist.

export const seedDecks = [
    {
        id: "netzwerk",
        title: "Netzwerk-Grundlagen",
        description: "Subnetting, Ports, OSI",
        cards: [
            {
                id: "n1",
                front: "Was ist TCP?",
                back: "Ein verbindungsorientiertes Transportprotokoll (zuverlässig).",
            },
            {
                id: "n2",
                front: "Welcher Port wird typischerweise für HTTPS verwendet?",
                back: "Port 443",
            },
        ],
    },
    {
        id: "linux",
        title: "Linux-Befehle",
        description: "Alltags-CLI",
        cards: [
            {
                id: "l1",
                front: "Wie listest du Dateien und Ordner auf?",
                back: "ls",
            },
            {
                id: "l2",
                front: "Wie zeigst du das aktuelle Verzeichnis an?",
                back: "pwd",
            },
        ],
    },
];
