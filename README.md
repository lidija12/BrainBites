# Dokumentation: BrainBites (Flashcards)

Modul: **335 Mobile Applikation planen, entwickeln und publizieren**  
Autor: **Lidija Srejic**  
Datum: **24.01.2026**

---

## Überblick

BrainBites ist eine Flashcards-App zum Lernen mit Karteikarten-Decks. Die App enthält mehrere eingebaute Beispiel-Decks auf Deutsch und ermöglicht es, eigene Decks und Karten über einen Create-Screen zu erstellen. Im Lernmodus kann man Karten umdrehen und durchgehen. Über den Accelerometer-Sensor können Karten durch Schütteln (Shake) gemischt werden. Zusätzlich gibt es lokale Notifications als Lern-Erinnerungen.

**Technische Kernelemente (Modul-Anforderungen):**
- **Sensor:** Accelerometer → Shake-Erkennung → Karten mischen (Shuffle)
- **Aktor:** Lokale Notifications → Lern-Erinnerungen (planbar/aktivierbar/deaktivierbar)
- **Persistente Speicherung:** Firebase Firestore (Decks/Karten dauerhaft speichern)
- **Authentifizierung:** umgesetzt (Firebase Auth - E-Mail/Passwort)

---

# Aufgabe 1: Anforderungen und Planung

## 1.a) Screen-Übersicht (Storyboard / Flow)

Storyboard-Bilder: `./docs/storyboard/` (oder `./storyboard/`)

**Screen 1: Login**
- E-Mail + Passwort Eingabe
- Button: Login
- Fehleranzeige bei falschen Eingaben
- Navigation: "Account erstellen" → Registrierung

**Screen 2: Account erstellen (Registrierung)**
- E-Mail + Passwort + Passwort bestätigen
- Button: Registrieren
- Navigation: Zurück zum Login

**Screen 3: Home / Deck-Übersicht**
- Liste aller Decks (Beispiel-Decks + eigene Decks)
- Suche/Filter (optional)
- Button: „Neues Deck erstellen“
- Navigation: Deck antippen → Deck-Details

**Screen 4: Deck-Details**
- Deckname
- Buttons: „Lernen starten“, „Karten verwalten“
- Option: Deck bearbeiten

**Screen 5: Lernmodus (Study)**
- Eine Karte zurzeit (Vorderseite → umdrehen → Rückseite)
- Buttons: „Falsch“, „Richtig“ (oder „Weiter“)
- Shake-Geste: Karten mischen (Shuffle)
- Anzeige: Fortschritt (z.B. 3/20)

**Screen 6: Karten verwalten (Create/Edit)**
- Karte erstellen: Vorderseite + Rückseite
- Kartenliste mit Bearbeiten(+)/Löschen
- Speichern in Firebase Firestore

**Screen 7: Einstellungen / Erinnerungen**
- Erinnerungen aktivieren/deaktivieren
- Uhrzeit/Intervall definieren
- Test-Notification auslösen (optional)

---

## 1.b) Funktionale Anforderungen

**Deck-Übersicht (Home)**
- Die App zeigt eine Liste aller verfügbaren Decks an.
- Es gibt eingebaute Beispiel-Decks (lokal, read-only) sowie eigene Decks des Benutzers.
- Ein Deck kann ausgewählt werden, um Details anzusehen oder direkt den Lernmodus zu starten.
- Über eine Aktion (z.B. Button) kann ein neues Deck erstellt werden.

**Deck-Verwaltung (Create/Edit)**
- Benutzer können eigene Decks erstellen (Deckname erfassen und speichern).
- Eigene Decks können bearbeitet (z.B. umbenannt) und gelöscht werden.
- Beispiel-Decks sind nicht editierbar, damit immer stabile Demo-Inhalte vorhanden sind.

**Karten-Verwaltung (CRUD pro Deck)**
- Zu einem Deck können Karten erstellt werden mit:
  - Vorderseite (FrontText)
  - Rückseite (BackText)
- Karten können bearbeitet und gelöscht werden.
- Validierung: Leere Eingaben sind nicht erlaubt (Speichern wird verhindert bzw. es wird ein Hinweis angezeigt).

**Lernmodus (Study)**
- Im Lernmodus wird jeweils eine Karte angezeigt.
- Die Karte kann umgedreht (Flip Front/Back) werden.
- Der Benutzer kann zur nächsten Karte wechseln und sieht einen Fortschritt (z.B. „3/20“).
- Optional (je nach Umsetzung): einfache Bewertung wie „Gewusst / Nicht gewusst“ oder nur „Weiter“.

**Sensor-Funktion (Accelerometer)**
- Der Accelerometer wird im Lernmodus genutzt, um ein Schütteln (Shake) zu erkennen.
- Bei erkannter Shake-Geste werden die Karten gemischt (Shuffle) und der Lernmodus läuft mit neuer Reihenfolge weiter.

**Aktor-Funktion (Lokale Notifications)**
- Benutzer können Lern-Erinnerungen aktivieren und deaktivieren.
- Beim Aktivieren wird die Berechtigung für Notifications abgefragt.
- Bei aktivierter Erinnerung wird eine lokale Notification zu einer definierten Zeit/Regel geplant (z.B. täglich).
- Beim Deaktivieren werden geplante Notifications wieder entfernt.

**Persistente Speicherung (Firebase Firestore)**
- Eigene Decks und Karten werden in Firestore gespeichert und beim App-Start wieder geladen.
- Beispiel-Decks bleiben lokal, damit die App sofort Inhalte hat (und als Demo jederzeit funktioniert).

---

## 1.c) Testplan (Anwendungsfälle als Testfälle)

| ID  | Testfall | Vorbedingung | Schritte | Erwartetes Ergebnis |
|---|---|---|---|---|
| TC1 | Registrierung | App gestartet | E-Mail/Passwort eingeben → Registrieren | Benutzerkonto wird erstellt, User ist eingeloggt |
| TC2 | Login | Konto existiert | E-Mail/Passwort → Login | Login erfolgreich, Navigation in App |
| TC3 | Deck-Liste | Eingeloggt | Home öffnen | Beispiel-Decks + eigene Decks werden angezeigt |
| TC4 | Deck erstellen | Eingeloggt | „Neues Deck“ → Name → Speichern | Neues Deck erscheint in der Liste |
| TC5 | Deck bearbeiten | Eigenes Deck existiert | Deck bearbeiten/umbenennen | Name wird gespeichert/aktualisiert |
| TC6 | Deck löschen | Eigenes Deck existiert | Deck löschen | Deck ist entfernt |
| TC7 | Karte erstellen | Eigenes Deck existiert | Karte hinzufügen (Front/Back) → Speichern | Karte erscheint in Kartenliste |
| TC8 | Karte bearbeiten | Karte existiert | Karte bearbeiten → Speichern | Karte ist aktualisiert |
| TC9 | Karte löschen | Karte existiert | Karte löschen | Karte ist entfernt |
| TC10 | Lernmodus Flip | Deck mit Karten | Lernmodus öffnen → Karte antippen | Karte flippt (Front/Back) |
| TC11 | Shake Shuffle | Lernmodus offen | Gerät schütteln | Kartenreihenfolge wird gemischt |
| TC12 | Reminder Notifications | Permission erlaubt | Settings: Tage + Uhrzeit aktivieren | Notification wird geplant und kommt zur Zeit |

---

# Aufgabe 2: Mobile App – Lösungskonzept erarbeiten (BrainBites)

## 2.a) Framework und App-Typ

- **Framework:** Expo + React Native (JavaScript)
- **App-Typ:** Hybrid-/Cross-Platform App (eine Codebasis für iOS und Android)
- **Entwicklungsumgebung:** Visual Studio Code oder IntelliJ + Expo CLI
- **Navigation:** Expo Router (File-based Routing)

**Warum Expo + React Native?**
- Eine Codebasis für Android/iOS spart Zeit und reduziert Aufwand.
- Expo stellt Sensoren (Accelerometer) und Notifications mit klaren APIs bereit.
- Sehr gute Integration mit Firebase (Auth + Firestore).
- Schnelle Iteration durch Hot Reload und einfache Build-/Run-Prozesse.

**Projektstruktur (aktueller Stand + Ergänzungen)**
**Wichtige Komponenten**
- Decks Screen (index.js): Deck-Liste (Built-in + User-Decks)
- Deck-Detail ([deckId].js): Deck-Infos und Navigation zum Lernmodus
- Learn Screen (study.js): Karten anzeigen, Flip/Next/Prev, Shake→Shuffle
- Create Screen (create.js): Deck/Karte erstellen, Validierung, Speichern
- Settings Screen (settings.js): Reminder (Notifications), Logout
- DeckStore (DeckStore.js): App-State (z. B. geladene Decks/Karten)

---

## 2.b) Umsetzung der Elemente (Sensor/Aktor, Storage, Auth)

### Element 1: Sensor – Accelerometer (Shake → Shuffle)
**Package:** expo-sensors

**Funktionsweise**
- Learn-Screen abonniert Accelerometer-Werte (z. B. alle 100ms).
- Bei einem Shake (kurzer Beschleunigungs-„Spike“) wird ein Event ausgelöst.
- Mit Cooldown (z. B. 900ms) Verhinderung von Mehrfachauslösung.
- Kartenliste wird gemischt (z. B. Fisher–Yates) → Index auf 0 gesetzt.

### Element 2: Aktor – Notifications (Lern-Erinnerung)
**Package:** expo-notifications

**Verwendung**
- Im Settings-Screen kann der User Reminder aktivieren/deaktivieren.
- Beim Aktivieren: Permission abfragen → lokale Notification planen (Wochentage + Uhrzeit).
- Beim Deaktivieren: geplante Notifications löschen.

### Element 3: Persistente Speicherung – Firebase Firestore
**Package:** firebase (Firestore)

**Prinzip**
- Eigene Decks und Karten werden in Firestore gespeichert und beim Start geladen.
- Beispiel-Decks sind lokal vorhanden (Demo/Offline möglich).

*(Optional/je nach Umsetzung)* Echtzeit:
- Deck-Liste über Listener (z. B. `onSnapshot`) gefiltert nach ownerUid
- Karten über Listener in `decks/{deckId}/cards`

### Element 4: Authentifizierung – Firebase Authentication
**Package:** firebase (Auth)

**Funktionen**
- Registrierung: `createUserWithEmailAndPassword`
- Login: `signInWithEmailAndPassword`
- Logout: `signOut`
- Session-Check: `onAuthStateChanged` (beim App-Start)

---

# Aufgabe 3: Mobile App – Mobile App programmieren

## 3.a) Funktionalität und Mockups wie geplant umgesetzt
- Screen-Flow gemäss Planung umgesetzt: Login/Registration → Home → Deck-Details → Study → Create/Edit → Settings
- CRUD für eigene Decks/Karten umgesetzt
- Validierungen umgesetzt (z.B. keine leeren Texte)

## 3.b) Sensoren/Aktoren wie geplant umgesetzt
- Accelerometer: Shake-Erkennung im Lernmodus → Shuffle
- Notifications: Lokale Reminder planbar/aktivierbar/deaktivierbar (Settings)

---

# Aufgabe 4: Mobile App – Mobile App publizieren

## 4.a) Nötige Schritte zum Publizieren (Android)
Ziel: eine **fertig paketierte Datei (.apk)** erstellen.

**Variante A: EAS Build (empfohlen)**
1. Abhängigkeiten installieren: `npm install`
2. Expo Login: `npx expo login`
3. EAS CLI installieren: `npm i -g eas-cli`
4. Projekt konfigurieren: `eas build:configure`
5. Android Build starten: `eas build -p android --profile preview`
6. APK aus dem Expo Dashboard herunterladen
7. APK auf Android installieren und testen

## 4.b) Ergebnis (APK)
- Datei: `BrainBites.apk`
- Ablage (Empfehlung): GitHub Release (Assets) oder Ordner `./release/BrainBites.apk`

---

# Aufgabe 5: Mobile App gemäss Testplan überprüfen

## 5.a) Tests durchführen & Ergebnisse festhalten
Die Tests wurden gemäss Testplan durchgeführt. Ergebnisse und ggf. Fixes werden hier dokumentiert:

| Testfall | Ergebnis (OK/FAIL) | Beobachtung | Fix (falls nötig) |
|---|---|---|---|
| TC1 |  |  |  |
| TC2 |  |  |  |
| TC3 |  |  |  |
| TC4 |  |  |  |
| TC5 |  |  |  |
| TC6 |  |  |  |
| TC7 |  |  |  |
| TC8 |  |  |  |
| TC9 |  |  |  |
| TC10 |  |  |  |
| TC11 |  |  |  |
| TC12 |  |  |  |

---

## Projekt lokal starten

```bash
npm install
npx expo start
