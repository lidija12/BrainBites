# Dokumentation: BrainBites (Flashcards-Lernapp)

Modul: **335 Mobile Applikation planen, entwickeln und publizieren**  
Autorin: **Lidija Srejic**  
Datum: **30.01.2026**

---

## Überblick

BrainBites ist eine Flashcards-App zum Lernen mit Karteikarten-Decks. Es gibt **Beispiel-Decks (Deutsch)** und man kann eigene **Decks/Karten** erstellen. Im Lernmodus werden Karten angezeigt und können interaktiv gelernt werden.

**Anforderungen erfüllt (Modul 335):**
- **2 Aktoren/Sensoren:**  
  1) **Accelerometer (Shake)** im Lernmodus (z.B. Karten mischen / Shuffle)  
  2) **Lokale Notifications** (Reminder-Funktion)
- **Persistente Storage:** **Firebase Firestore** (Decks/Karten dauerhaft speichern)
- **Authentifizierung:** **Firebase Authentication** (E-Mail/Passwort Login + Registration)

---

## Aufgabe 1: Mobile App – Anforderungen und Planung

### 1.a) Storyboard und Screen-Abläufe
Storyboard-Skizzen wurden auf Papier erstellt. (Ablage im Repo: `./storyboard/` als Bilder)

**Screens / Flow:**
1. **Login / Registrierung**: Einloggen oder Konto erstellen
2. **Deck-Übersicht (Home)**: Decks anzeigen, öffnen
3. **Deck-Details**: Kartenliste im Deck, Karten bearbeiten
4. **Lernmodus**: Karten lernen/flippen, Navigation durch Karten, Shake-Feature
5. **Create**: neues Deck + neue Karten erstellen
6. **Settings**: Reminder einstellen (Wochentage + Uhrzeit), aktivieren/deaktivieren

### 1.b) Funktionalitäten (Liste)
**Decks & Karten**
- Beispiel-Decks vorhanden
- Deck erstellen / umbenennen / löschen
- Karten erstellen / bearbeiten / löschen
- Lernmodus: Karte flippen, nächste/vorherige Karte

**Sensor/Aktor**
- Accelerometer erkennt Schütteln → Kartenreihenfolge wird neu gemischt
- Lokale Reminder-Notifications: Wochentage und Uhrzeit wählbar, aktivier-/deaktivierbar

### 1.c) Testplan (Anwendungsfälle als Testfälle)

| ID  | Testfall | Vorbedingung | Aktion | Erwartetes Resultat |
|---|---|---|---|---|
| TC1 | Registrierung | Internet aktiv | E-Mail+Passwort → Registrieren | Konto erstellt, Weiterleitung zur App |
| TC2 | Login | Konto vorhanden | E-Mail+Passwort → Login | Erfolgreich eingeloggt |
| TC3 | Deck erstellen | Eingeloggt | Create → neues Deck speichern | Deck erscheint in Übersicht |
| TC4 | Karte hinzufügen | Deck existiert | Karte erstellen → speichern | Karte erscheint im Deck |
| TC5 | Lernmodus Flip | Deck hat Karten | Lernmodus öffnen → Karte antippen | Vorder-/Rückseite wechselt |
| TC6 | Shake Shuffle | Lernmodus offen | Gerät schütteln | Kartenreihenfolge wird gemischt |
| TC7 | Reminder aktivieren | Notifications erlaubt | Settings: Tage+Zeit → aktivieren | Notification wird geplant |
| TC8 | Reminder deaktivieren | Reminder aktiv | Settings → deaktivieren | Notification wird entfernt |

---

## Aufgabe 2: Mobile App – Lösungskonzept erarbeiten

### 2.a) Framework und App-Typ
- **Framework:** Expo + React Native (JavaScript)
- **App-Typ:** Hybrid/Cross-Platform App (Android/iOS)
- **Navigation:** Expo Router (file-based routing; Tabs + Detailseiten)

**Wichtige Komponenten / Aufbau:**
- `app/` → Screens & Navigation (Tabs, Login, Deck-Detail, Study)
- `src/` → Logik (Auth, State/Services, Theme)
- `lib/firebase.js` → Firebase Initialisierung (Auth/Firestore)

### 2.b) Elemente genau beschreiben

**Authentifizierung (Firebase Auth)**
- Login/Registration via E-Mail/Passwort
- Nach erfolgreichem Login: Zugriff auf App-Funktionen

**Persistente Speicherung (Firestore)**
- Decks und Karten werden dauerhaft gespeichert
- CRUD: Erstellen/Lesen/Aktualisieren/Löschen von Decks & Karten

**Sensor: Accelerometer**
- Listener im Lernmodus
- Shake-Threshold + Debounce/Cooldown
- Bei Trigger: Shuffle-Funktion (sichtbarer Effekt)

**Aktor: Lokale Notifications**
- `expo-notifications` (Permissions + Android Channel)
- Weekly Reminder: Auswahl Wochentage + Uhrzeit
- Aktivieren/Deaktivieren: schedule / cancel

---

## Aufgabe 3: Mobile App – Mobile App programmieren

- **3.a Funktionalität & Mockups:** Deck-Flow, Create, Study, Settings umgesetzt wie geplant
- **3.b Sensoren/Aktoren:** Accelerometer (Shake) + Notifications umgesetzt

---

## Aufgabe 4: Mobile App – Mobile App publizieren

### 4.a Schritte zum Publizieren (Android)
Ziel: eine **fertig paketierte Datei (.apk)** erstellen.

### 4.b APK Build (Vorschlag mit EAS Build)
1. `npm install`
2. Expo Login: `npx expo login`
3. EAS installieren: `npm i -g eas-cli`
4. Projekt konfigurieren: `eas build:configure`
5. Build starten: `eas build -p android --profile preview`
6. APK im Expo Dashboard herunterladen
7. APK auf Android installieren und testen

*(Alternativ: lokale Android-Builds via Gradle/Android Studio nach `expo prebuild`, falls nötig.)*

---

## Aufgabe 5: Mobile App gemäss Testplan überprüfen

Tests gemäss Testplan durchgeführt, Resultate dokumentiert:

| Testfall | Resultat | Notizen/Fixes |
|---|---|---|
| TC1 | OK / FAIL |  |
| TC2 | OK / FAIL |  |
| TC3 | OK / FAIL |  |
| TC4 | OK / FAIL |  |
| TC5 | OK / FAIL |  |
| TC6 | OK / FAIL |  |
| TC7 | OK / FAIL |  |
| TC8 | OK / FAIL |  |

---

## Lokales Starten (für Bewertung)

```bash
npm install
npx expo start
