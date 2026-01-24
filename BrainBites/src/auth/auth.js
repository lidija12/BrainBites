import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_KEY = "bb_users_v1";
const CURRENT_KEY = "bb_current_user_v1";
const DEMO_USER = { email: "demo@brainbites.ch", password: "demo1234" };

async function loadUsers() {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];

    //Wenn noch keine Users existieren -> Demo-User automatisch anlegen
    if (!Array.isArray(users) || users.length === 0) {
        const seeded = [DEMO_USER];
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(seeded));
        return seeded;
    }

    return users;
}

async function saveUsers(users) {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function register(email, password) {
    const users = await loadUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error("User existiert bereits.");

    const next = [...users, { email, password }];
    await saveUsers(next);
    await AsyncStorage.setItem(CURRENT_KEY, JSON.stringify({ email }));
    return { email };
}

export async function login(email, password) {
    const users = await loadUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error("Falsche Login-Daten.");
    await AsyncStorage.setItem(CURRENT_KEY, JSON.stringify({ email: user.email }));
    return { email: user.email };
}

export async function logout() {
    await AsyncStorage.removeItem(CURRENT_KEY);
}

export async function getCurrentUser() {
    const raw = await AsyncStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : null;
}
