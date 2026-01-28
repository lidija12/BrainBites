## Überblick

BrainBites ist eine Flashcards-App zum Lernen mit Karteikarten-Decks. Die App enthält **eingebaute Beispiel-Decks (Deutsch)** und ermöglicht es, eigene Decks und Karten zu erstellen.  
Im Lernmodus können Karten umgedreht und durchgearbeitet werden. Zusätzlich gibt es lokale Erinnerungen via Notifications.

### Modul-Anforderungen (Kurzcheck)

- **2 Elemente (Sensor/Aktor):**
  - **Sensor:** Accelerometer (Tilt links/rechts) → Karten mischen (Shuffle)
  - **Aktor:** Lokale Notifications → Lern-Erinnerungen (planbar/aktivierbar/deaktivierbar)
- **Persistente Speicherung:** Firebase Firestore → Decks/Karten dauerhaft speichern
- **Authentifizierung:** Lokal (AsyncStorage) → Login/Registrierung + Demo-User

---

## Projektstruktur (aktueller Stand)

> Hinweis: Die Struktur basiert auf **Expo Router** (file-based routing).

```text
app/
  login.js
  _layout.js
  (tabs)/
    _layout.js
    index.js
    create.js
    settings.js
  deck/
    [deckId]/
      index.js
      study.js
      edit.js
      cards/
        [cardId]/
          edit.js
src/
  auth/
    auth.js
  theme/
    colors.js
state/
  DeckStore.js
assets/
  icon.png
app.json
package.json
README.md


````
## Wichtige Komponenten (Screens/Dateien)

- **Decks Screen (`app/(tabs)/index.js`)**: Deck-Liste (Built-in + User-Decks)
- **Deck-Detail (`app/deck/[deckId]/index.js`)**: Deck-Infos und Navigation zum Lernmodus
- **Learn/Study Screen (`app/deck/[deckId]/study.js`)**: Karten anzeigen, Flip, Next/Prev, **Tilt→Shuffle (Accelerometer)**
- **Create Screen (`app/(tabs)/create.js`)**: Deck/Karte erstellen, Validierung, Speichern (Firestore)
- **Settings Screen (`app/(tabs)/settings.js`)**: Reminder (Notifications) + (optional) Logout
- **DeckStore (`state/DeckStore.js`)**: Zentrale State-/Datenlogik für Decks & Karten

---

## Verwendete Packages (Übersicht)

| Package             | Zweck |
|---------------------|------|
| expo                | Framework |
| react-native        | UI / App Runtime |
| expo-router         | Navigation (file-based) |
| firebase            | Firestore (persistente Speicherung) |
| expo-sensors        | Accelerometer (Tilt) |
| expo-notifications  | Lokale Reminder/Notifications |
| @react-native-async-storage/async-storage | Lokale Speicherung (Auth-Session + Users) |


---

# Aufgabe 1: Anforderungen und Planung

## 1.a) Screen-Übersicht (Storyboard / Flow)

Storyboard-Bilder: `./docs/storyboard/` (oder `./storyboard/`)

**Screen 1: Login**

* E-Mail + Passwort Eingabe
* Button: Login
* Fehleranzeige bei falschen Eingaben
* Navigation: "Account erstellen" → Registrierung
<img width="440" height="956" alt="Screen 1@1x" src="https://github.com/user-attachments/assets/df901bc9-9814-4e0e-a451-9e0a72a45a03" />

**Screen 2: Account erstellen (Registrierung)**

* E-Mail + Passwort + Passwort bestätigen
* Button: Registrieren
* Navigation: Zurück zum Login
<img width="440" height="956" alt="Screen 2@1x" src="https://github.com/user-attachments/assets/28d05ecc-7160-49cd-ae84-7813f95ed24f" />

**Screen 3: Home / Deck-Übersicht**

* Liste aller Decks (Beispiel-Decks + eigene Decks)
* Button: „Neues Deck erstellen“
* Navigation: Deck antippen → Deck-Details
<img width="440" height="956" alt="Screen 3@1x" src="https://github.com/user-attachments/assets/22e3e60c-5bc1-473b-a430-8ab7dc063929" />

**Screen 4: Deck-Details**

* Deckname
* Buttons: „Lernen starten“, „Karten verwalten“
* Option: Deck bearbeiten
<img width="440" height="956" alt="Screen 4@1x" src="https://github.com/user-attachments/assets/adca26a2-bfb7-4c66-8060-75617365d2f1" />

**Screen 5: Lernmodus (Study)**

* Eine Karte zurzeit (Vorderseite → umdrehen → Rückseite)
* Navigation durch Karten (z.B. Buttons oder Swipe links/rechts)
* Shuffle-Funktion vorhanden (siehe Sensor / Fallback unten)
* Anzeige: Fortschritt (z.B. 3/20)
<img width="440" height="956" alt="Screen 7@1x" src="https://github.com/user-attachments/assets/ba39a9c3-ad83-4502-a7e5-35808e1a6610" />

**Screen 6: Karten verwalten (Create/Edit)**

* Karte erstellen: Vorderseite + Rückseite
* Kartenliste mit Bearbeiten(+)/Löschen
* Speichern in Firebase Firestore
<img width="440" height="956" alt="Screen 5@1x" src="https://github.com/user-attachments/assets/b331b1cf-636b-44b8-894f-9ffd2dfd4060" />
<img width="440" height="956" alt="Screen 6@1x" src="https://github.com/user-attachments/assets/f5d00211-0ea1-4df4-b2b3-2bac8cdc8817" />

**Screen 7: Einstellungen / Erinnerungen**

* Erinnerungen aktivieren/deaktivieren
* Wochentage und Uhrzeit definieren
* Permissions abfragen
* geplante Notifications verwalten (cancel/reschedule)
<img width="440" height="956" alt="Screen 8@1x" src="https://github.com/user-attachments/assets/f41accf4-e8c7-4320-af26-200b9f6cde7b" />

---

## 1.b) Funktionale Anforderungen

**Deck-Übersicht (Home)**

* Die App zeigt eine Liste aller verfügbaren Decks an.
* Es gibt eingebaute Beispiel-Decks (lokal, read-only) sowie eigene Decks des Benutzers.
* Ein Deck kann ausgewählt werden, um Details anzusehen oder direkt den Lernmodus zu starten.
* Über eine Aktion kann ein neues Deck erstellt werden.

**Deck-Verwaltung (Create/Edit)**

* Benutzer können eigene Decks erstellen (Deckname erfassen und speichern).
* Eigene Decks können bearbeitet und gelöscht werden.
* Beispiel-Decks sind nicht editierbar, damit immer stabile Demo-Inhalte vorhanden sind.

**Karten-Verwaltung (CRUD pro Deck)**

* Zu einem Deck können Karten erstellt werden mit Vorderseite/Rückseite.
* Karten können bearbeitet und gelöscht werden.
* Validierung: Leere Eingaben sind nicht erlaubt.

**Lernmodus (Study)**

* Eine Karte wird angezeigt, Flip Front/Back ist möglich.
* Navigation durch Karten ist möglich (z.B. Swipe links/rechts oder Buttons).
* Fortschritt wird angezeigt.

**Sensor-Funktion (Accelerometer / Tilt-to-Shuffle)**

- Im Lernmodus wird der **Accelerometer** (expo-sensors) verwendet, um die Bewegung bzw. Neigung des Geräts zu messen.
- **Shuffle (Karten mischen)** bedeutet: Die Reihenfolge der Karten wird zufällig neu gemischt (Fisher–Yates), damit die Karten in einer neuen Reihenfolge gelernt werden können.
- Die Shuffle-Funktion wird **zuverlässig ausgelöst**, wenn das Gerät **deutlich nach links oder rechts geneigt** wird (Tilt):
  - Es wird ein **Threshold** verwendet (`TILT_THRESHOLD`), z.B. `x < -0.75` (links) oder `x > 0.75` (rechts).
  - Damit es nicht dauernd auslöst, gibt es einen **Cooldown** (`COOLDOWN`, z.B. 900ms) und eine **Neutral-Zone** (`NEUTRAL`), in der das Gerät zuerst wieder „gerade“ sein muss, bevor erneut gemischt wird.
- Nach einem erfolgreichen Shuffle wird der Lernmodus auf die **erste Karte zurückgesetzt** (`index = 0`) und die Karte wird wieder auf **Vorderseite** gesetzt (`flipped = false`), damit der Effekt klar sichtbar ist.

**Aktor-Funktion (Lokale Notifications)**

* Benutzer können Lern-Erinnerungen aktivieren und deaktivieren.
* Beim Aktivieren wird die Berechtigung für Notifications abgefragt.
* Es werden lokale Notifications geplant (z.B. wöchentlich nach Wochentag + Uhrzeit).
* Beim Deaktivieren werden geplante Notifications entfernt.

**Persistente Speicherung (Firebase Firestore)**

* Eigene Decks und Karten werden in Firestore gespeichert und beim App-Start wieder geladen.
* Beispiel-Decks bleiben lokal, damit die App sofort Inhalte hat.

---

## 1.c) Testplan (Anwendungsfälle als Testfälle)

| ID   | Testfall              | Vorbedingung           | Schritte                         | Erwartetes Ergebnis                  |
| ---- | --------------------- | ---------------------- | -------------------------------- | ------------------------------------ |
| TC1  | Registrierung         | App gestartet          | E-Mail/Passwort → Registrieren   | Konto erstellt, User eingeloggt      |
| TC2  | Login                 | Konto existiert        | E-Mail/Passwort → Login          | Login ok, Navigation in App          |
| TC3  | Deck-Liste            | Eingeloggt             | Home öffnen                      | Decks werden angezeigt               |
| TC4  | Deck erstellen        | Eingeloggt             | Neues Deck → Name → Speichern    | Deck erscheint in Liste              |
| TC5  | Deck löschen          | Eigenes Deck existiert | Deck löschen                     | Deck ist entfernt                    |
| TC6  | Karte erstellen       | Deck existiert         | Karte hinzufügen → Speichern     | Karte erscheint im Deck              |
| TC7  | Karte löschen         | Karte existiert        | Karte löschen                    | Karte ist entfernt                   |
| TC8  | Lernmodus Flip        | Deck mit Karten        | Lernmodus → Karte antippen       | Karte flippt (Front/Back)            |
| TC9  | Shuffle Trigger       | Lernmodus offen        | Tilt links/rechts (Accelerometer)| Kartenreihenfolge wird gemischt      |
| TC10 | Reminder aktivieren   | Permissions erlaubt    | Settings: Tage+Zeit → aktivieren | Reminder wird geplant                |
| TC11 | Reminder deaktivieren | Reminder aktiv         | Settings → deaktivieren          | Reminder wird entfernt               |
| TC12 | Firestore Persistenz  | Internet aktiv         | App neu starten                  | Eigene Decks/Karten bleiben erhalten |

---

# Aufgabe 2: Mobile App – Lösungskonzept erarbeiten

## 2.a) Framework und App-Typ

* **Framework:** Expo + React Native (JavaScript)
* **App-Typ:** Hybrid-/Cross-Platform App (eine Codebasis für iOS und Android)
* **Entwicklungsumgebung:** VS Code / IntelliJ + Expo CLI
* **Navigation:** Expo Router (file-based)

**Warum Expo + React Native?**

* Eine Codebasis für Android/iOS spart Zeit und reduziert Aufwand.
* Expo bietet Sensoren (expo-sensors) und Notifications (expo-notifications) als fertige Module.
* Firebase (Auth + Firestore) ist gut integrierbar.
* Schnelle Entwicklung durch Hot Reload.

---

## 2.b) Umsetzung der Elemente (Sensor/Aktor, Storage, Auth)

> In diesem Kapitel wird beschrieben, **wie** die geforderten Elemente technisch umgesetzt wurden (inkl. kurzer Code-Auszüge).  
> Die Codeblöcke sind bewusst gekürzt und zeigen nur die Kernlogik.

---

### Element 1: Sensor – Accelerometer (Tilt links/rechts → Shuffle)

**Package:** `expo-sensors`  
**Ort:** `app/deck/[deckId]/study.js`

**Wofür?**  
Im Lernmodus wird der Accelerometer genutzt, um eine deutliche Neigung nach links oder rechts zu erkennen. Bei erkannter Neigung werden die Karten **neu gemischt** (Shuffle), damit der Lernmodus mit einer neuen Reihenfolge weitergeht.

**Funktionsweise**
- Accelerometer wird im Lernmodus abonniert (Update-Intervall ca. 120ms).
- Bei **Tilt links/rechts** über die `x`-Achse (Threshold) wird ein Shuffle ausgelöst.
- Mit **Cooldown** (z.B. 900ms) und **Neutral-Zone** wird Mehrfachauslösung verhindert.
- Shuffle mischt die Karten per **Fisher–Yates** und setzt den Lernmodus zurück (`index = 0`, `flipped = false`), damit der Effekt sichtbar ist.

**Code-Auszug (Tilt + Cooldown + Neutral-Zone):**
```js
import { Accelerometer } from "expo-sensors";

Accelerometer.setUpdateInterval(120);

const COOLDOWN = 900;
const TILT_THRESHOLD = 0.75;
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
    shuffleCards(); // Fisher–Yates + index=0 + flipped=false
  }
});
````

**Code-Auszug (Shuffle / Fisher–Yates):**

```js
const shuffleCards = () => {
  setCardsOrder((prev) => {
    const arr = [...prev];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  setIndex(0);
  setFlipped(false);
};
```

---

### Element 2: Aktor – Lokale Notifications (Lern-Erinnerung)

**Package:** `expo-notifications`
**Ort:** `app/(tabs)/settings.js`

**Wofür?**
In den Settings können Lern-Erinnerungen aktiviert/deaktiviert werden. Die App plant lokale Notifications (z.B. wöchentlich nach Wochentag + Uhrzeit) und kann geplante Reminder wieder entfernen.

**Funktionsweise**

* Permission wird abgefragt (granted/denied wird behandelt).
* Auf Android wird ein Notification-Channel gesetzt.
* Reminder werden geplant (schedule) und IDs gespeichert.
* Beim Deaktivieren werden die gespeicherten IDs gecancelt (cancel).

**Code-Auszug (Permission + Channel):**

```js
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function ensurePermission() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === "granted";
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("reminders", {
    name: "Reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}
```

**Code-Auszug (weekly schedule + cancel):**

```js
export async function scheduleWeekly({ weekday, hour, minute }) {
  return Notifications.scheduleNotificationAsync({
    content: { title: "BrainBites", body: "Zeit zum Lernen" },
    trigger: { weekday, hour, minute, repeats: true, channelId: "reminders" },
  });
}

export async function cancelAll(ids) {
  for (const id of ids) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}
```

---

### Element 3: Persistente Speicherung – Firebase Firestore (Decks/Karten)

**Package:** `firebase` (Firestore)
**Ort:** `lib/firebase.js` + Datenlogik z.B. `state/DeckStore.js`

**Wofür?**
Eigene Decks und Karten werden dauerhaft gespeichert, damit sie nach dem App-Neustart wieder verfügbar sind.

**Funktionsweise**

* Firebase wird initialisiert (App + Firestore).
* Decks/Karten werden in Firestore gespeichert und beim Start geladen.
* CRUD: Deck/Karte erstellen, lesen, (optional) aktualisieren und löschen.

**Code-Auszug (Firebase Init):**

```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "TODO",
  authDomain: "TODO",
  projectId: "TODO",
  storageBucket: "TODO",
  messagingSenderId: "TODO",
  appId: "TODO",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

**Code-Auszug (CRUD Beispiel):**

```js
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export async function createDeck(name, ownerUid) {
  const ref = await addDoc(collection(db, "decks"), {
    name,
    ownerUid,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function loadDecks() {
  const snap = await getDocs(collection(db, "decks"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
```

---

### Element 4: Authentifizierung – Lokal (AsyncStorage) (E-Mail/Passwort)

**Package:** `@react-native-async-storage/async-storage`  
**Ort:** `src/auth/auth.js` + `app/login.js`

**Wofür?**  
Benutzer können sich registrieren und einloggen. Die User werden lokal gespeichert (AsyncStorage). Zusätzlich gibt es einen Demo-User für Tests.

**Funktionsweise**
- Registrierung prüft, ob E-Mail schon existiert und speichert neue User lokal.
- Login prüft E-Mail/Passwort lokal.
- Session (aktueller User) wird separat gespeichert (`CURRENT_KEY`).
- Logout entfernt die Session.

**Code-Auszug (Auth-Logik lokal):**
```js
import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_KEY = "bb_users_v1";
const CURRENT_KEY = "bb_current_user_v1";

export async function login(email, password) { /* ... */ }
export async function register(email, password) { /* ... */ }
export async function logout() { /* ... */ }
export async function getCurrentUser() { /* ... */ }

```
> **Hinweis:** Die Authentifizierung ist bewusst vereinfacht umgesetzt. Passwörter werden im Rahmen dieses Modulprojekts **nicht gehasht**, da der Fokus auf der Umsetzung von Sensor (Accelerometer), Aktor (Notifications) und persistenter Speicherung liegt.


---

# Aufgabe 3: Mobile App – Mobile App programmieren

Gemäss Aufgabenstellung wurde die App mit einem geeigneten Framework umgesetzt und im GitHub Repository versioniert.

## 3.a) Funktionalität und MockUps wie geplant umgesetzt (Ziele erreicht)

- **Screen-Flow umgesetzt:** Login/Registrierung → Home (Decks) → Deck-Detail → Study → Create/Edit → Settings
- **CRUD umgesetzt:** Eigene Decks und Karten können erstellt, angezeigt und gelöscht werden (Bearbeiten je nach Umsetzung).
- **Validierung:** Leere Eingaben werden verhindert (z.B. Front/Back Text darf nicht leer sein).
- **Lernmodus:** Karte flippen (Front/Back), Navigation über „Weiter/Zurück“ und Fortschrittsanzeige.

## 3.b) Sensoren/Aktoren wie geplant umgesetzt (Ziele erreicht)

- **Sensor:** Accelerometer (expo-sensors) im Lernmodus  
  → **Tilt links/rechts** löst **Shuffle** aus (Fisher–Yates), zusätzlich Cooldown + Neutral-Zone gegen Mehrfachauslösung.
- **Aktor:** Lokale Notifications (expo-notifications) in Settings  
  → Erinnerungen aktivieren/deaktivieren, Permission-Handling, geplante Reminder verwalten.

---


# Aufgabe 4: Mobile App publizieren

> Hinweis: Für diesen Kompetenznachweis wird der Publikationsprozess beschrieben.  
> Ein echter Google-Play-Upload wurde nicht durchgeführt (Google Play Developer Account ist kostenpflichtig).

## 4.a) Schritte zur Bereitstellung/Veröffentlichung (Android)

Ziel: Aus dem Projekt eine **installierbare Android-App** erstellen (APK für Test/Installation oder AAB für Google Play).  
Für Expo/React Native erfolgt dies über **EAS Build** (Expo Application Services).

### Vorbereitung
- Expo Konto erstellen auf `expo.dev`

- EAS CLI installieren:
```bash
npm install -g eas-cli
```
* Anmelden:
```
```bash
eas login
```
* Projekt konfigurieren (erstellt u.a. `eas.json`):
```bash
eas build:configure
 ```

### Build erstellen (APK für Tests / interne Verteilung)

* Build starten:
```bash
eas build -p android --profile preview
```
* Während der Einrichtung werden typische Angaben abgefragt (z.B. App/Package ID, Keystore für Signierung).
* Nach Abschluss kann die Build-Datei über das **EAS Dashboard** heruntergeladen werden.

> Hinweis: Für eine echte Store-Veröffentlichung wird üblicherweise ein **AAB** gebaut (z.B. `--profile production`).

### (Optional) Veröffentlichung im Google Play Store (Überblick)

* Google Play Developer Account erstellen (einmalige Gebühr)
* App in der Play Console anlegen
* Store-Infos hinzufügen (Beschreibung, Screenshots, Icon, Datenschutz)
* Release hochladen (meist AAB) und zur Prüfung einreichen
* Nach Freigabe ist die App im Store sichtbar

## 4.b) Ergebnis

* Für eine installierbare Version wird eine **APK** (Test) oder ein **AAB** (Store) erzeugt.
* Die App wird im Rahmen dieses Projekts **nicht im Store veröffentlicht**, der Ablauf ist jedoch dokumentiert.

---

# Aufgabe 5: Mobile App gemäss Testplan überprüfen

## 5.a) Testergebnisse (gemäss Testplan aus 1.c)

Die App wurde gemäss dem Testplan aus Aufgabe **1.c** getestet.  
Alle Tests wurden auf einem Android-Gerät durchgeführt (Expo Go).

### Testresultate (Kurzform)

| ID  | Testfall | Status | Bemerkung |
|---|---|---|---|
| TC1 | Registrierung | ✅ OK | Konto erstellt, User eingeloggt |
| TC2 | Login | ✅ OK | Login erfolgreich, Navigation in App |
| TC3 | Deck-Liste | ✅ OK | Beispiel-Decks + eigene Decks sichtbar |
| TC4 | Deck erstellen | ✅ OK | Neues Deck wird gespeichert & angezeigt |
| TC5 | Deck löschen | ✅ OK | Deck wird entfernt |
| TC6 | Karte erstellen | ✅ OK | Karte wird gespeichert & angezeigt |
| TC7 | Karte löschen | ✅ OK | Karte wird entfernt |
| TC8 | Lernmodus Flip | ✅ OK | Karte flippt Front/Back |
| TC9 | Tilt Shuffle | ✅ OK | Kartenreihenfolge wird gemischt |
| TC10 | Reminder aktivieren | ✅ OK | Permission/Planung funktioniert |
| TC11 | Reminder deaktivieren | ✅ OK | Geplante Reminder werden entfernt |
| TC12 | Firestore Persistenz | ✅ OK | Daten nach Neustart weiterhin vorhanden |

**Zusammenfassung:** ✅ 12 von 12 Tests erfolgreich. Keine kritischen Fehler festgestellt.

### Gefundene Probleme und Verbesserungen während der Entwicklung

1) **Problem:** Popup/Feedback bei Gerätebewegung erschien zu häufig (teilweise auch ausserhalb des Lernmodus)  
   **Ursache:** Bewegungs-Trigger (Dev/Expo + Sensor-Events) kann je nach Umgebung sehr sensibel reagieren und mehrfach auslösen.  
   **Lösung:** Ich habe die Sensor-Logik auf den Lernmodus begrenzt und entprellt (Cooldown + Neutral-Zone/Armed-Logik), um Mehrfachauslösungen deutlich zu reduzieren.

2) **Problem:** Notifications funktionierten anfangs nicht zuverlässig (Permissions/Android)  
   **Ursache:** Permission-Handling und Android Notification-Channel sind notwendig, sonst werden Notifications je nach Gerät nicht sauber angezeigt.  
   **Lösung:** Ich habe den Permission-Request in den Settings ergänzt und den Android Channel gesetzt; beim Deaktivieren werden geplante Reminder konsequent gecancelt.

3) **Problem:** Startup-Verhalten war instabil wegen Notification-Initialisierung  
   **Ursache:** Notification-Handler/Initialisierung war an einer ungünstigen Stelle im App-Lifecycle (zu früh im Start-Flow).  
   **Lösung:** Ich habe die Initialisierung/Handling an eine passendere Stelle verschoben (z.B. Settings/Lifecycle später), um Startprobleme zu vermeiden.

4) **Problem:** Firestore Read/Write war zuerst blockiert (Rules/Setup)  
   **Ursache:** Firestore Rules bzw. initiales Setup waren nicht korrekt gesetzt → Zugriff verweigert.  
   **Lösung:** Ich habe die Firestore Rules angepasst und die benötigte Struktur eingerichtet, danach war CRUD wie geplant möglich.

### Bekannte Einschränkung (nicht kritisch)

- **Popup/Feedback bei Gerätebewegung (Tilt):** In der Testumgebung (Expo/Dev) erscheint gelegentlich weiterhin ein Popup/Feedback bei Bewegung.  
  Der Kernnutzen (**Tilt → Shuffle im Lernmodus**) ist davon nicht betroffen. Speicherung (Firestore), Notifications und Lernmodus funktionieren wie geplant.

---

## Projekt lokal starten

```bash
npm install
npx expo start
```
