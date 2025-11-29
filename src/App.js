import React, { useEffect, useState, useRef } from "react";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch
} from "firebase/firestore";

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyCTRgIri_ViX5iJovcf_jGzQlF7VDg6JOY",
  authDomain: "money-management-app-fc287.firebaseapp.com",
  projectId: "money-management-app-fc287",
  storageBucket: "money-management-app-fc287.firebasestorage.app",
  messagingSenderId: "769343213350",
  appId: "1:769343213350:web:7f90a219007ccc7001fbe7",
  measurementId: "G-LVK5P19ZG7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Static App ID for the database path
const appId = "money-management-app-fc287"; 

// --- CSS STYLES ---
const CSS_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

:root {
  /* Default M3 Colors (Overridden by JS) */
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #EADDFF;
  --md-sys-color-on-primary-container: #21005D;
  
  --md-sys-color-surface: #FEF7FF;
  --md-sys-color-surface-container: #F3EDF7;
  --md-sys-color-on-surface: #1D1B20;
  --md-sys-color-on-surface-variant: #49454F;
  
  --md-sys-color-outline: #79747E;
  --md-sys-color-outline-variant: #CAC4D0;

  --md-sys-color-error: #B3261E;
  --md-sys-color-success: #146c2e;

  --md-elevation-1: 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
  --md-elevation-3: 0px 4px 8px 3px rgba(0, 0, 0, 0.15);

  --font-family: 'Roboto', sans-serif;
  --radius-full: 100px;
  --radius-card: 16px;
  --radius-sheet: 28px;
}

[data-theme="dark"] {
  /* Dark Mode Base Colors */
  --md-sys-color-surface: #141218;
  --md-sys-color-surface-container: #211F26;
  --md-sys-color-on-surface: #E6E1E5;
  --md-sys-color-on-surface-variant: #CAC4D0;
  
  --md-sys-color-outline: #938F99;
  --md-sys-color-outline-variant: #49454F;

  --md-sys-color-error: #F2B8B5;
  --md-sys-color-success: #6dd58c;
}

/* --- RESET --- */
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
body {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-family: var(--font-family);
  transition: background-color 0.3s, color 0.3s;
}

/* --- LAYOUT --- */
.app-shell {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  background-color: var(--md-sys-color-surface);
  padding-bottom: 100px; /* space for FAB */
}

.main-content {
  padding: 0 16px;
}

/* --- TOP BAR --- */
.m3-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 20px;
  background: var(--md-sys-color-surface);
}

.m3-headline-large {
  font-size: 32px;
  line-height: 40px;
  font-weight: 400;
  color: var(--md-sys-color-on-surface);
}

.m3-label-small {
  font-size: 12px;
  letter-spacing: 0.5px;
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 500;
}

.m3-headline {
  font-size: 22px;
  font-weight: 400;
}

.top-bar-actions {
  display: flex;
  gap: 0px;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--md-sys-color-on-surface-variant);
  width: 48px;
  height: 48px;
  font-size: 1.2rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.icon-btn:hover { background: var(--md-sys-color-surface-container); }
.danger-text { color: var(--md-sys-color-error); }

/* --- CHIPS --- */
.m3-chip-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 12px;
  scrollbar-width: none;
}
.m3-chip-row::-webkit-scrollbar { display: none; }

.m3-chip {
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline);
  color: var(--md-sys-color-on-surface-variant);
  padding: 0 16px;
  height: 32px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.m3-chip.active {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-color: transparent;
}

/* --- TABS --- */
.m3-tabs {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--radius-full);
  display: flex;
  padding: 4px;
  margin-bottom: 24px;
}

.m3-tab {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition: 0.2s;
}
.m3-tab.active {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  box-shadow: var(--md-elevation-1);
}

/* --- CARDS & LISTS --- */
.m3-card {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--radius-card);
  padding: 16px;
  margin-bottom: 12px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.overview-header h3 { font-size: 16px; font-weight: 500; }

.overview-totals {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 14px;
  font-weight: 500;
}
.income-text, .val-inc, .inc { color: var(--md-sys-color-success); }
.expense-text, .val-exp, .exp { color: var(--md-sys-color-error); }

.month-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.month-item {
  background: var(--md-sys-color-surface);
  border: none;
  padding: 12px;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
}
.month-name { display: block; font-weight: 500; margin-bottom: 4px; font-size: 14px; }
.month-values { font-size: 12px; display: flex; gap: 8px; }

/* List Item (M3 Style) */
.m3-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}
.m3-list-item:last-child { border-bottom: none; }

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
  color: var(--md-sys-color-primary);
}
.m3-title-medium { font-size: 16px; font-weight: 500; letter-spacing: 0.15px; }

.list-content { display: flex; flex-direction: column; }
.list-headline { font-size: 16px; color: var(--md-sys-color-on-surface); }
.list-supporting { font-size: 12px; color: var(--md-sys-color-on-surface-variant); margin-top: 2px; }

.list-trailing {
  display: flex;
  align-items: center;
  gap: 12px;
}
.amount-text { font-weight: 500; font-size: 16px; }

.icon-btn-small {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  opacity: 0.5;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}
.icon-btn-small:hover { opacity: 1; background: var(--md-sys-color-outline-variant); }

/* --- RECYCLE BIN --- */
.bin-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bin-info { display: flex; flex-direction: column; gap: 4px; }
.bin-reason { font-weight: 500; color: var(--md-sys-color-on-surface-variant); text-decoration: line-through; }
.bin-meta { font-size: 12px; color: var(--md-sys-color-outline); }
.bin-actions { display: flex; gap: 8px; }

.restore-btn:hover { background: #d1e7dd; color: #146c2e; }
.delete-forever-btn:hover { background: #f8d7da; color: #b02a37; }

/* --- FAB --- */
.fab-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.fab-primary {
  width: 56px;
  height: 56px;
  border-radius: 16px; /* M3 Shape */
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border: none;
  box-shadow: var(--md-elevation-3);
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}
.fab-primary:hover { filter: brightness(0.95); }
.fab-icon { transition: transform 0.2s; }
.fab-icon.rotate { transform: rotate(45deg); }

.fab-extended {
  border: none;
  padding: 16px 20px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--md-elevation-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideUp 0.2s ease-out;
  color: white;
}
.fab-income { background: var(--md-sys-color-success); }
.fab-expense { background: var(--md-sys-color-error); }

@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* --- BOTTOM SHEET & FORMS --- */
.scrim {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 20;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.m3-bottom-sheet {
  background: var(--md-sys-color-surface-container);
  width: 100%;
  max-width: 480px;
  border-radius: var(--radius-sheet) var(--radius-sheet) 0 0;
  padding: 24px;
  padding-bottom: 40px;
  animation: slideUp 0.3s cubic-bezier(0.2, 0, 0, 1);
}

.drag-handle {
  width: 32px;
  height: 4px;
  background: var(--md-sys-color-outline-variant);
  border-radius: 2px;
  margin: 0 auto 24px;
  opacity: 0.4;
}

.sheet-title {
  font-size: 24px;
  margin-bottom: 24px;
  color: var(--md-sys-color-on-surface);
  text-align: center;
}

/* M3 Text Field */
.m3-text-field {
  position: relative;
  margin-bottom: 16px;
  background: var(--md-sys-color-surface);
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid var(--md-sys-color-outline);
}

.m3-text-field input {
  width: 100%;
  padding: 24px 16px 8px;
  border: none;
  background: transparent;
  font-size: 16px;
  color: var(--md-sys-color-on-surface);
  outline: none;
}

.m3-text-field label {
  position: absolute;
  left: 16px;
  top: 18px;
  font-size: 16px;
  color: var(--md-sys-color-on-surface-variant);
  pointer-events: none;
  transition: 0.2s;
}

.m3-text-field input:focus ~ label,
.m3-text-field input:not(:placeholder-shown) ~ label {
  top: 6px;
  font-size: 12px;
  color: var(--md-sys-color-primary);
}

.m3-text-field input:focus {
  border-bottom: 2px solid var(--md-sys-color-primary);
}

.sheet-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

.m3-btn-text {
  background: transparent;
  color: var(--md-sys-color-primary);
  border: none;
  padding: 10px 24px;
  border-radius: 100px;
  font-weight: 500;
  cursor: pointer;
}
.m3-btn-filled {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border: none;
  padding: 10px 24px;
  border-radius: 100px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.m3-btn-tonal {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border: none;
  padding: 10px 24px;
  border-radius: 100px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-state { text-align: center; color: var(--md-sys-color-outline); margin-top: 40px; }
.empty-state-small { text-align: center; color: var(--md-sys-color-outline); padding: 20px 0; font-size: 14px; }
.empty-icon { font-size: 48px; display: block; margin-bottom: 16px; opacity: 0.5; }

/* Color Picker Styles */
.color-grid {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 8px 0;
}

.color-swatch {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: var(--md-elevation-1);
  transition: transform 0.2s;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.selected {
  border-color: var(--md-sys-color-on-surface);
  transform: scale(1.1);
}

/* Custom Input */
.custom-color-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}
.custom-color-input {
  width: 48px;
  height: 48px;
  padding: 0;
  border: none;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background: none;
}
.custom-color-input::-webkit-color-swatch-wrapper { padding: 0; }
.custom-color-input::-webkit-color-swatch { border: none; border-radius: 50%; border: 2px solid var(--md-sys-color-outline); }

.text-center { text-align: center; }
.mt-2 { margin-top: 16px; }

/* AI Features */
.ai-button {
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-primary);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: 0.2s;
}
.ai-button:hover {
  background: var(--md-sys-color-primary-container);
  border-color: transparent;
}
.ai-modal-content {
  line-height: 1.6;
  color: var(--md-sys-color-on-surface);
  font-size: 15px;
}
.ai-modal-content ul { padding-left: 20px; margin-top: 8px; }
.ai-modal-content li { margin-bottom: 6px; }
.ai-loader {
  display: inline-block;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.scan-btn-wrapper {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--md-sys-color-outline);
}
`;

// --- COLOR UTILS ---
const hexToHSL = (H) => {
  let r = 0, g = 0, b = 0;
  if (H.length === 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length === 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  r /= 255; g /= 255; b /= 255;
  let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin, h = 0, s = 0, l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
}

const HSLToHex = (h,s,l) => {
  s /= 100; l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c/2, r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);

  if (r.length === 1) r = "0" + r;
  if (g.length === 1) g = "0" + g;
  if (b.length === 1) b = "0" + b;

  return "#" + r + g + b;
}

const generatePalette = (hex, mode) => {
  const { h, s } = hexToHSL(hex);
  if (mode === 'dark') {
    return {
      primary: HSLToHex(h, s, 80),
      onPrimary: HSLToHex(h, s, 20),
      primaryContainer: HSLToHex(h, s, 30),
      onPrimaryContainer: HSLToHex(h, s, 90)
    };
  } else {
    return {
      primary: hex,
      onPrimary: '#FFFFFF',
      primaryContainer: HSLToHex(h, s, 96),
      onPrimaryContainer: HSLToHex(h, s, 10)
    };
  }
};

// --- CONSTANTS ---
const YEARS = [2023, 2024, 2025];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PRESETS = [
  { name: 'Purple', hex: '#6750A4' },
  { name: 'Blue',   hex: '#0061A4' },
  { name: 'Green',  hex: '#006D31' },
  { name: 'Red',    hex: '#B3261E' },
  { name: 'Orange', hex: '#964900' },
];

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [mode, setMode] = useState(() => localStorage.getItem("appTheme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem("appColor") || "#6750A4");

  // --- AUTH & DATA SYNC ---
  useEffect(() => {
    console.log("Initializing auth...");
    
    const initAuth = async () => {
      try {
        console.log("Attempting anonymous sign-in...");
        const userCredential = await signInAnonymously(auth);
        console.log("Signed in anonymously:", userCredential.user.uid);
      } catch (error) {
        console.error("Auth error:", error);
        alert("Authentication failed: " + error.message);
      }
    };
    
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user);
      setUser(user);
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch Entries from Cloud
  const [entries, setEntries] = useState([]);
  
  useEffect(() => {
    if (!user) {
      console.log("No user, skipping data fetch");
      setDataLoading(false);
      return;
    }
    
    console.log("Setting up Firestore listener for user:", user.uid);
    
    try {
      const entriesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'entries');
      const q = query(entriesRef, orderBy("timestamp", "desc"));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log("Received snapshot with", snapshot.docs.length, "documents");
          const fetched = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id
            };
          });
          setEntries(fetched);
          setDataLoading(false);
        }, 
        (error) => {
          console.error("Firestore sync error:", error);
          alert("Data sync error: " + error.message);
          setDataLoading(false);
        }
      );

      return () => {
        console.log("Unsubscribing from Firestore");
        unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up Firestore listener:", error);
      setDataLoading(false);
    }
  }, [user]);

  // Theme setup
  useEffect(() => {
    document.body.setAttribute("data-theme", mode);
    localStorage.setItem("appTheme", mode);
    const colors = generatePalette(themeColor, mode);
    const root = document.documentElement;
    root.style.setProperty('--md-sys-color-primary', colors.primary);
    root.style.setProperty('--md-sys-color-on-primary', colors.onPrimary);
    root.style.setProperty('--md-sys-color-primary-container', colors.primaryContainer);
    root.style.setProperty('--md-sys-color-on-primary-container', colors.onPrimaryContainer);
    localStorage.setItem("appColor", themeColor);
  }, [mode, themeColor]);

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [activeTab, setActiveTab] = useState("varavu");
  
  const [fabOpen, setFabOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetType, setSheetType] = useState("varavu");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");

  const [showBin, setShowBin] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // --- AI STATE ---
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const fileInputRef = useRef(null);

  // --- LOGIC ---
  const activeEntries = entries.filter(e => !e.isDeleted);
  const deletedEntries = entries.filter(e => e.isDeleted);

  const handleFabTypeClick = (type) => {
    setSheetType(type);
    setSheetOpen(true);
    setFabOpen(false);
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please wait, authentication in progress...");
      return;
    }
    
    if (!selectedYear || !selectedMonth) {
      alert("Please select year and month first.");
      return;
    }
    
    if (!reason.trim() || !amount) {
      alert("Please fill in both reason and amount.");
      return;
    }

    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }

    const now = Date.now();
    
    const newEntry = {
      type: sheetType, 
      year: selectedYear,
      month: selectedMonth,
      reason: reason.trim(),
      amount: value,
      isDeleted: false,
      deletedAt: null,
      timestamp: now
    };

    console.log("Adding new entry:", newEntry);

    try {
      const entriesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'entries');
      const docRef = await addDoc(entriesRef, newEntry);
      console.log("Entry saved with ID:", docRef.id);
      
      setSheetOpen(false);
      setReason("");
      setAmount("");
    } catch (err) {
      console.error("Failed to save entry:", err);
      alert("Failed to save to cloud: " + err.message);
    }
  };

  const handleSoftDelete = async (id) => {
    if(!user) return;
    try {
      const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'entries', id);
      await updateDoc(ref, { isDeleted: true, deletedAt: Date.now() });
      console.log("Entry soft deleted:", id);
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete: " + error.message);
    }
  };

  const handleRestore = async (id) => {
    if(!user) return;
    try {
      const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'entries', id);
      await updateDoc(ref, { isDeleted: false, deletedAt: null });
    } catch (error) {
      console.error("Error restoring entry:", error);
      alert("Failed to restore: " + error.message);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!user) return;
    if (window.confirm("Delete forever?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'entries', id));
      } catch (error) {
        console.error("Error permanently deleting:", error);
        alert("Failed to delete: " + error.message);
      }
    }
  };

  const handleEmptyBin = async () => {
    if (!user) return;
    if (window.confirm("Empty the Recycle Bin?")) {
      try {
        const batch = writeBatch(db);
        deletedEntries.forEach((item) => {
          const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'entries', item.id);
          batch.delete(ref);
        });
        await batch.commit();
        console.log("Bin emptied");
      } catch (error) {
        console.error("Error emptying bin:", error);
        alert("Failed to empty bin: " + error.message);
      }
    }
  };

  // --- GEMINI: RECEIPT SCANNER ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAiLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        // Simulate AI response
        setTimeout(() => {
          setReason("Sample Store");
          setAmount("2500");
          setAiLoading(false);
          alert("Receipt scanning simulated - fill in Gemini API key for real scanning");
        }, 1000);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert("Failed to scan receipt.");
      setAiLoading(false);
    }
  };

  // --- GEMINI: FINANCIAL INSIGHTS ---
  const handleGetInsights = async () => {
    if (!selectedYear || !selectedMonth) return;
    
    const monthData = activeEntries
      .filter(e => e.year === selectedYear && e.month === selectedMonth)
      .map(e => `${e.type}: ${e.reason} (${e.amount})`)
      .join("\n");
      
    if (!monthData) {
      alert("Add some entries first!");
      return;
    }

    setAiLoading(true);
    
    // Simulate AI response since API key is empty
    setTimeout(() => {
      setAiInsight(`
        <p><b>Spending Summary:</b> Your financial data shows a good balance between income and expenses for ${selectedMonth} ${selectedYear}.</p>
        <ul>
          <li>Consider setting aside 20% of your income for savings automatically</li>
          <li>Review your recurring expenses to identify potential savings</li>
        </ul>
        <p><i>Note: Fill in Gemini API key for personalized AI insights</i></p>
      `);
      setAiLoading(false);
    }, 1500);
  };

  // --- CALCULATIONS ---
  const filteredEntries = selectedYear && selectedMonth
      ? activeEntries.filter(e => e.year === selectedYear && e.month === selectedMonth && e.type === activeTab)
      : [];

  const getMonthTotals = (year, month) => {
    const monthEntries = activeEntries.filter(e => e.year === year && e.month === month);
    const income = monthEntries.filter(e => e.type === "varavu").reduce((s, e) => s + e.amount, 0);
    const expense = monthEntries.filter(e => e.type === "selavu").reduce((s, e) => s + e.amount, 0);
    return { income, expense };
  };

  const yearEntries = selectedYear ? activeEntries.filter(e => e.year === selectedYear) : [];
  const yearlyIncome = yearEntries.filter(e => e.type === "varavu").reduce((s, e) => s + e.amount, 0);
  const yearlyExpense = yearEntries.filter(e => e.type === "selavu").reduce((s, e) => s + e.amount, 0);

  // --- RENDER ---
  if (authLoading) {
    return (
      <div className="app-shell">
        <style>{CSS_STYLES}</style>
        <div className="loading-state">
          <p>Loading app...</p>
        </div>
      </div>
    );
  }

  if (showBin) {
    return (
      <div className="app-shell">
        <style>{CSS_STYLES}</style>
        <header className="m3-top-bar">
          <button className="icon-btn" onClick={() => setShowBin(false)}>←</button>
          <h1 className="m3-headline">Recycle Bin</h1>
          <button className="icon-btn danger-text" onClick={handleEmptyBin} disabled={deletedEntries.length === 0}>🗑️</button>
        </header>
        <main className="main-content">
          {deletedEntries.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">♻️</span><p>Bin is empty</p></div>
          ) : (
            <div className="bin-list">
              {deletedEntries.sort((a,b) => b.deletedAt - a.deletedAt).map(item => (
                <div key={item.id} className="m3-card bin-card">
                  <div className="bin-info"><span className="bin-reason">{item.reason}</span><span className="bin-meta">{item.type} • ₹{item.amount} • {item.month} {item.year}</span></div>
                  <div className="bin-actions"><button className="icon-btn restore-btn" onClick={() => handleRestore(item.id)}>⟳</button><button className="icon-btn delete-forever-btn" onClick={() => handlePermanentDelete(item.id)}>✕</button></div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <style>{CSS_STYLES}</style>
      <header className="m3-top-bar">
        <div className="top-bar-content">
          <p className="m3-label-small">Welcome back,</p>
          <h1 className="m3-headline-large">Rishi</h1>
        </div>
        <div className="top-bar-actions">
           <button className="icon-btn" onClick={() => setShowColorPicker(true)} title="Theme Color">🎨</button>
           <button className="icon-btn" onClick={() => setShowBin(true)} title="Recycle Bin">♻️</button>
           <button className="icon-btn" onClick={() => setMode(p => p === 'dark' ? 'light' : 'dark')}>{mode === 'dark' ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <main className="main-content">
        <section className="m3-chip-row">
          {YEARS.map((y) => (
            <button key={y} className={`m3-chip ${selectedYear === y ? 'active' : ''}`} onClick={() => { setSelectedYear(y); setSelectedMonth(null); }}>{y}</button>
          ))}
        </section>

        {selectedYear && (
          <section className="m3-chip-row months-row">
            {MONTHS.map((m) => (
              <button key={m} className={`m3-chip small ${selectedMonth === m ? 'active' : ''}`} onClick={() => setSelectedMonth(m)}>{m}</button>
            ))}
          </section>
        )}

        {selectedYear && selectedMonth && (
          <div className="m3-tabs">
            <button className={`m3-tab ${activeTab === 'varavu' ? 'active' : ''}`} onClick={() => setActiveTab('varavu')}>Varavu</button>
            <button className={`m3-tab ${activeTab === 'selavu' ? 'active' : ''}`} onClick={() => setActiveTab('selavu')}>Selavu</button>
          </div>
        )}

        <div className="content-container">
          {!selectedYear ? (
            <div className="empty-state"><p>Select a Year</p></div>
          ) : !selectedMonth ? (
            <div className="m3-card overview-card">
              <div className="overview-header">
                <h3>{selectedYear} Summary</h3>
                <div className="overview-totals"><span className="income-text">+ ₹{yearlyIncome.toLocaleString()}</span><span className="expense-text">- ₹{yearlyExpense.toLocaleString()}</span></div>
              </div>
              <div className="month-grid">
                {MONTHS.map(m => {
                   const { income, expense } = getMonthTotals(selectedYear, m);
                   if(!income && !expense) return null;
                   return (
                     <button key={m} className="month-item" onClick={() => setSelectedMonth(m)}>
                       <span className="month-name">{m}</span>
                       <div className="month-values">{income > 0 && <span className="val-inc">+{income}</span>}{expense > 0 && <span className="val-exp">-{expense}</span>}</div>
                     </button>
                   )
                })}
                {yearlyIncome === 0 && yearlyExpense === 0 && <p className="m3-label-small text-center" style={{width:'100%'}}>No entries yet.</p>}
              </div>
            </div>
          ) : (
            <div className="entry-list-container">
              <div className="list-header">
                <span className="m3-title-medium">{activeTab} List</span>
                <button className="ai-button" onClick={handleGetInsights}>
                  {aiLoading ? <span className="ai-loader">✨</span> : "✨ AI Insights"}
                </button>
              </div>
              
              {dataLoading ? (
                <div className="empty-state-small">Loading entries...</div>
              ) : filteredEntries.length === 0 ? (
                 <div className="empty-state-small">No entries found.</div>
              ) : (
                filteredEntries.map(item => (
                  <div key={item.id} className="m3-list-item">
                    <div className="list-content">
                      <span className="list-headline">{item.reason}</span>
                      <span className="list-supporting">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="list-trailing">
                      <span className={`amount-text ${activeTab === 'varavu' ? 'inc' : 'exp'}`}>₹{item.amount.toLocaleString()}</span>
                      <button className="icon-btn-small delete-trigger" onClick={() => handleSoftDelete(item.id)}>🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <div className={`fab-container ${fabOpen ? 'open' : ''}`}>
        {fabOpen && (
          <div className="fab-actions">
            <button className="fab-extended fab-income" onClick={() => handleFabTypeClick("varavu")}><span>+</span> Varavu</button>
            <button className="fab-extended fab-expense" onClick={() => handleFabTypeClick("selavu")}><span>+</span> Selavu</button>
          </div>
        )}
        <button className="fab-primary" onClick={() => setFabOpen(!fabOpen)}><span className={`fab-icon ${fabOpen ? 'rotate' : ''}`}>+</span></button>
      </div>

      {sheetOpen && (
        <div className="scrim" onClick={() => setSheetOpen(false)}>
          <div className="m3-bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="drag-handle"></div>
            <h2 className="sheet-title">Add {sheetType === 'varavu' ? 'Income' : 'Expense'}</h2>
            
            <div className="scan-btn-wrapper">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                style={{display:'none'}} 
                onChange={handleImageUpload}
              />
              <button className="m3-btn-tonal" onClick={() => fileInputRef.current.click()}>
                 {aiLoading ? <span className="ai-loader">✨ Scanning...</span> : "📷 Scan Receipt ✨"}
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="m3-form">
              <div className="m3-text-field">
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder=" " required />
                <label>Reason {aiLoading && "..."}</label>
              </div>
              <div className="m3-text-field">
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder=" " required />
                <label>Amount (₹) {aiLoading && "..."}</label>
              </div>
              <div className="sheet-actions">
                <button type="button" className="m3-btn-text" onClick={() => setSheetOpen(false)}>Cancel</button>
                <button type="submit" className="m3-btn-filled">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showColorPicker && (
        <div className="scrim" onClick={() => setShowColorPicker(false)}>
          <div className="m3-bottom-sheet" onClick={e => e.stopPropagation()}>
             <div className="drag-handle"></div>
             <h2 className="sheet-title">Select Theme</h2>
             <div className="color-grid">
               {PRESETS.map((preset) => (
                 <button key={preset.hex} className={`color-swatch ${themeColor === preset.hex ? 'selected' : ''}`} style={{ backgroundColor: preset.hex }} onClick={() => setThemeColor(preset.hex)}>
                   {themeColor === preset.hex && <span className="check-icon">✓</span>}
                 </button>
               ))}
               <div className="custom-color-wrapper">
                 <input type="color" className="custom-color-input" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} />
               </div>
             </div>
             <p className="text-center mt-2 m3-label-small">Selected: {themeColor}</p>
          </div>
        </div>
      )}

      {aiInsight && (
         <div className="scrim" onClick={() => setAiInsight(null)}>
           <div className="m3-bottom-sheet" onClick={e => e.stopPropagation()}>
             <div className="drag-handle"></div>
             <h2 className="sheet-title">✨ AI Analysis</h2>
             <div className="ai-modal-content" dangerouslySetInnerHTML={{ __html: aiInsight }} />
             <div className="sheet-actions">
               <button className="m3-btn-text" onClick={() => setAiInsight(null)}>Close</button>
             </div>
           </div>
         </div>
      )}

    </div>
  );
}

export default App;