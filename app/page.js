"use client";

import { useState, useEffect, useRef } from "react";
import pkg from "../package.json";

const STORAGE_KEY = "xcstrings-online-data";
const FORMAT_KEY = "xcstrings-online-format";
const COLOR_VISION_KEY = "colorVision";

// Color-vision modes for the appearance menu. The done/new hexes are only the
// menu swatch previews — the real palette lives in globals.css as
// [data-color-vision] CSS variable overrides.
const VISION_MODES = [
  { id: "default", name: "Default", desc: "Standard colors", done: "#059669", new: "#d97706" },
  { id: "protanopia", name: "Protanopia", desc: "Red-blind friendly", done: "#0072b2", new: "#d97706" },
  { id: "deuteranopia", name: "Deuteranopia", desc: "Green-blind friendly", done: "#0072b2", new: "#d97706" },
  { id: "tritanopia", name: "Tritanopia", desc: "Blue-blind friendly", done: "#059669", new: "#cc3311" },
  { id: "grayscale", name: "Grayscale", desc: "Monochrome", done: "#1f2937", new: "#6b7280" },
];

// Display just major.minor (e.g. "2.0") from the package's semver version.
const APP_VERSION = pkg.version.split(".").slice(0, 2).join(".");

// Collect every locale code that appears in a catalog: the source language
// plus the union of all `localizations` keys across all strings. Tolerant of
// strings that omit `localizations` and of an empty/missing `strings` object.
function getLocaleCodes(data) {
  const codes = new Set();
  if (data?.sourceLanguage) codes.add(data.sourceLanguage);
  const strings = data?.strings || {};
  for (const key of Object.keys(strings)) {
    const localizations = strings[key]?.localizations;
    if (localizations) {
      for (const code of Object.keys(localizations)) codes.add(code);
    }
  }
  return Array.from(codes);
}

// Read the representative { value, state } from a single localization,
// supporting both the classic `stringUnit` form and the newer String Catalog
// `variations` form (plural / device). For variations we surface the "other"
// case (falling back to the first available).
function readLocalization(loc) {
  if (!loc) return { value: "", state: undefined };
  if (loc.stringUnit) {
    return { value: loc.stringUnit.value ?? "", state: loc.stringUnit.state };
  }
  const group = loc.variations?.plural || loc.variations?.device;
  if (group) {
    const key = group.other ? "other" : Object.keys(group)[0];
    const unit = group[key]?.stringUnit;
    return { value: unit?.value ?? "", state: unit?.state };
  }
  return { value: "", state: undefined };
}

// Return a new localization object with the representative value updated,
// writing back into `variations` when that's how the entry is shaped so plural
// forms aren't clobbered.
function setLocalizationValue(loc, value) {
  const base = loc ? { ...loc } : {};
  if (!base.stringUnit && base.variations) {
    const groupKey = base.variations.plural
      ? "plural"
      : base.variations.device
      ? "device"
      : null;
    if (groupKey) {
      const variations = { ...base.variations };
      const group = { ...variations[groupKey] };
      const caseKey = group.other ? "other" : Object.keys(group)[0];
      const sub = { ...(group[caseKey] || {}) };
      sub.stringUnit = { ...(sub.stringUnit || { state: "new" }), value };
      group[caseKey] = sub;
      variations[groupKey] = group;
      base.variations = variations;
      return base;
    }
  }
  base.stringUnit = { ...(base.stringUnit || { state: "new" }), value };
  return base;
}

// Parse a legacy .strings file into [{ key, value, comment }] entries.
// Handles /* block */ and // line comments (attached to the entry that
// follows), quoted or bare keys, and \" \\ \n \t \r \Uxxxx escapes.
function parseStringsFile(text) {
  const entries = [];
  const n = text.length;
  let i = 0;
  let pendingComment = null;

  function skipWhitespace() {
    while (i < n && /\s/.test(text[i])) i++;
  }

  function readQuotedString() {
    i++; // opening quote
    let out = "";
    while (i < n) {
      const ch = text[i];
      if (ch === "\\") {
        const next = text[i + 1];
        if (next === "n") out += "\n";
        else if (next === "t") out += "\t";
        else if (next === "r") out += "\r";
        else if (next === "U" || next === "u") {
          const hex = text.slice(i + 2, i + 6);
          if (/^[0-9a-fA-F]{4}$/.test(hex)) {
            out += String.fromCharCode(parseInt(hex, 16));
            i += 6;
            continue;
          }
          out += next;
        } else out += next ?? "";
        i += 2;
        continue;
      }
      if (ch === '"') {
        i++;
        return out;
      }
      out += ch;
      i++;
    }
    throw new Error("Unterminated string literal");
  }

  while (i < n) {
    skipWhitespace();
    if (i >= n) break;
    if (text.startsWith("/*", i)) {
      const end = text.indexOf("*/", i + 2);
      if (end === -1) throw new Error("Unterminated comment");
      pendingComment = text.slice(i + 2, end).trim();
      i = end + 2;
      continue;
    }
    if (text.startsWith("//", i)) {
      const end = text.indexOf("\n", i);
      pendingComment = text.slice(i + 2, end === -1 ? n : end).trim();
      i = end === -1 ? n : end + 1;
      continue;
    }
    let key;
    if (text[i] === '"') {
      key = readQuotedString();
    } else {
      const match = /^[A-Za-z0-9_.-]+/.exec(text.slice(i));
      if (!match) throw new Error(`Unexpected character "${text[i]}"`);
      key = match[0];
      i += key.length;
    }
    skipWhitespace();
    if (text[i] !== "=") throw new Error(`Expected '=' after key "${key}"`);
    i++;
    skipWhitespace();
    if (text[i] !== '"') throw new Error(`Expected quoted value for key "${key}"`);
    const value = readQuotedString();
    skipWhitespace();
    if (text[i] === ";") i++;
    entries.push({ key, value, comment: pendingComment || undefined });
    pendingComment = null;
  }
  return entries;
}

function escapeStringsText(s) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")
    .replace(/\r/g, "\\r");
}

// Small donut chart with the completion percentage in the middle, shown per
// language in the sidebar.
function LangDonut({ pct, active }) {
  const r = 14;
  const circumference = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 36 36" className="h-8 w-8 shrink-0" aria-hidden="true">
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        strokeWidth="4"
        className={active ? "stroke-white/30" : "stroke-black/[0.08] dark:stroke-white/10"}
      />
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        transform="rotate(-90 18 18)"
        style={active ? { stroke: "#ffffff" } : undefined}
        className={active ? "" : "progress-ring-done"}
        strokeDasharray={circumference}
        strokeDashoffset={(circumference * (100 - pct)) / 100}
      />
      <text
        x="18"
        y="18"
        dominantBaseline="central"
        textAnchor="middle"
        className={`text-[9px] font-semibold ${
          active ? "fill-white" : "fill-gray-600 dark:fill-gray-300"
        }`}
      >
        {pct}
      </text>
    </svg>
  );
}

export default function Home() {
  const languages = [
    {
      code: "sq",
      name: "Albanian"
    },
    {
      code: "ar",
      name: "Arabic",
    },
    {
      code: "eu",
      name: "Basque",
    },
    {
      code: "bg",
      name: "Bulgarian",
    },
    {
      code: "ca",
      name: "Catalan",
    },
    {
      code: "zh-Hans",
      name: "Simplified Chinese",
    },
    {
      code: "zh-Hant",
      name: "Traditional Chinese",
    },
    {
      code: "zh-HK",
      name: "Hong Kong Chinese",
    },
    {
      code: "hr",
      name: "Croatian",
    },
    {
      code: "cs",
      name: "Czech",
    },
    {
      code: "da",
      name: "Danish",
    },
    {
      code: "nl",
      name: "Dutch",
    },
    {
      code: "en",
      name: "English",
    },
    {
      code: "et",
      name: "Estonian",
    },
    {
      code: "fi",
      name: "Finnish",
    },
    {
      code: "fr",
      name: "French",
    },
    {
      code: "gl",
      name: "Galician",
    },
    {
      code: "de",
      name: "German",
    },
    {
      code: "el",
      name: "Greek",
    },
    {
      code: "he",
      name: "Hebrew",
    },
    {
      code: "hu",
      name: "Hungarian",
    },
    {
      code: "is",
      name: "Icelandic",
    },
    {
      code: "id",
      name: "Indonesian",
    },
    {
      code: "it",
      name: "Italian",
    },
    {
      code: "ja",
      name: "Japanese",
    },
    {
      code: "ko",
      name: "Korean",
    },
    {
      code: "lv",
      name: "Latvian",
    },
    {
      code: "lt",
      name: "Lithuanian",
    },
    {
      code: "mk",
      name: "Macedonian",
    },
    {
      code: "mt",
      name: "Maltese",
    },
    {
      code: "no",
      name: "Norwegian",
    },
    {
      code: "pl",
      name: "Polish",
    },
    {
      code: "pt-BR",
      name: "Portuguese (Brazil)",
    },
    {
      code: "ro",
      name: "Romanian",
    },
    {
      code: "ru",
      name: "Russian",
    },
    {
      code: "sr",
      name: "Serbian",
    },
    {
      code: "sk",
      name: "Slovak",
    },
    {
      code: "sl",
      name: "Slovenian",
    },
    {
      code: "es",
      name: "Spanish",
    },
    {
      code: "sv",
      name: "Swedish",
    },
    {
      code: "th",
      name: "Thai",
    },
    {
      code: "tr",
      name: "Turkish",
    },
    {
      code: "uk",
      name: "Ukrainian",
    }
  ];

  // Human-readable label for a locale code. The curated list wins; regional
  // variants not in it (e.g. "ar-SA", "de-DE") resolve via Intl.DisplayNames,
  // and anything unresolvable falls back to the raw code.
  function langName(code) {
    const curated = languages.find((l) => l.code === code)?.name;
    if (curated) return curated;
    try {
      const name = new Intl.DisplayNames(["en"], { type: "language" }).of(code);
      if (name && name !== code) return name;
    } catch {
      // Malformed locale code — fall through to the raw code.
    }
    return code;
  }

  const sampleData = {
    "sourceLanguage": "en",
    "strings": {
      "Continue": {
        "extractionState": "manual",
        "localizations": {
          "en": {
            "stringUnit": {
              "state": "translated",
              "value": "Continue"
            }
          },
          "zh-Hant": {
            "stringUnit": {
              "state": "translated",
              "value": "繼續"
            }
          },
          "zh-HK": {
            "stringUnit": {
              "state": "translated",
              "value": "繼續"
            }
          },
          "ar": {
            "stringUnit": {
              "state": "translated",
              "value": "إستمر"
            }
          },
          "fr": {
            "stringUnit": {
              "state": "translated",
              "value": "Continue"
            }
          },
          "it": {
            "stringUnit": {
              "state": "translated",
              "value": "Continua"
            }
          }
        }
      },
      "History": {
        "extractionState": "manual",
        "localizations": {
          "en": {
            "stringUnit": {
              "state": "translated",
              "value": "History"
            }
          },
          "zh-Hant": {
            "stringUnit": {
              "state": "translated",
              "value": "歷史"
            }
          },
          "zh-HK": {
            "stringUnit": {
              "state": "translated",
              "value": "歷史"
            }
          },
          "ar": {
            "stringUnit": {
              "state": "translated",
              "value": "الإستعمالات السابقة"
            }
          },
          "fr": {
            "stringUnit": {
              "state": "translated",
              "value": "Historique"
            }
          },
          "it": {
            "stringUnit": {
              "state": "translated",
              "value": "Cronologia"
            }
          }
        }
      },
      "Loading...": {
        "extractionState": "manual",
        "localizations": {
          "en": {
            "stringUnit": {
              "state": "translated",
              "value": "Loading..."
            }
          },
          "zh-Hant": {
            "stringUnit": {
              "state": "translated",
              "value": "載入中......"
            }
          },
          "zh-HK": {
            "stringUnit": {
              "state": "translated",
              "value": "載入中......"
            }
          },
          "ar": {
            "stringUnit": {
              "state": "translated",
              "value": "...جاري التحميل"
            }
          },
          "fr": {
            "stringUnit": {
              "state": "translated",
              "value": "Chargement..."
            }
          },
          "it": {
            "stringUnit": {
              "state": "translated",
              "value": "Caricamento..."
            }
          }
        }
      },
      "Return": {
        "extractionState": "manual",
        "localizations": {
          "en": {
            "stringUnit": {
              "state": "translated",
              "value": "Return"
            }
          },
          "zh-Hant": {
            "stringUnit": {
              "state": "translated",
              "value": "返回"
            }
          },
          "zh-HK": {
            "stringUnit": {
              "state": "translated",
              "value": "返回"
            }
          },
          "ar": {
            "stringUnit": {
              "state": "translated",
              "value": "إلى الخلف"
            }
          },
          "fr": {
            "stringUnit": {
              "state": "translated",
              "value": "Precedent"
            }
          },
          "it": {
            "stringUnit": {
              "state": "translated",
              "value": "In Dietro"
            }
          }
        }
      },
      "Show History": {
        "extractionState": "manual",
        "localizations": {
          "en": {
            "stringUnit": {
              "state": "translated",
              "value": "Show History"
            }
          },
          "zh-Hant": {
            "stringUnit": {
              "state": "translated",
              "value": "顯示歷史"
            }
          },
          "zh-HK": {
            "stringUnit": {
              "state": "translated",
              "value": "顯示歷史"
            }
          },
          "ar": {
            "stringUnit": {
              "state": "translated",
              "value": "إعرض الإستعمالات السابقة"
            }
          },
          "fr": {
            "stringUnit": {
              "state": "translated",
              "value": "Afficher L'Historique"
            }
          },
          "it": {
            "stringUnit": {
              "state": "translated",
              "value": "Mostra Cronologia"
            }
          }
        }
      },
      "Version": {
        "extractionState": "manual",
        "localizations": {
          "en": {
            "stringUnit": {
              "state": "translated",
              "value": "Version"
            }
          },
          "zh-Hant": {
            "stringUnit": {
              "state": "translated",
              "value": "版本"
            }
          },
          "zh-HK": {
            "stringUnit": {
              "state": "translated",
              "value": "版本"
            }
          },
          "ar": {
            "stringUnit": {
              "state": "translated",
              "value": "الإصدار"
            }
          },
          "fr": {
            "stringUnit": {
              "state": "translated",
              "value": "La Version"
            }
          },
          "it": {
            "stringUnit": {
              "state": "translated",
              "value": "La Versione"
            }
          }
        }
      },
      "What's New in": {
        "extractionState": "manual",
        "localizations": {
          "en": {
            "stringUnit": {
              "state": "translated",
              "value": "What's New in"
            }
          },
          "zh-Hant": {
            "stringUnit": {
              "state": "translated",
              "value": "最新功能"
            }
          },
          "zh-HK": {
            "stringUnit": {
              "state": "translated",
              "value": "最新功能"
            }
          },
          "ar": {
            "stringUnit": {
              "state": "translated",
              "value": "ماهو الجديد"
            }
          },
          "fr": {
            "stringUnit": {
              "state": "translated",
              "value": "C'est Quoi Le Nouveau"
            }
          },
          "it": {
            "stringUnit": {
              "state": "translated",
              "value": "Le novità"
            }
          }
        }
      }
    },
    "version": "1.0"
  }

  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [data, setData] = useState(sampleData);
  const [isTranslating, setIsTranslating] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isDesktop, setIsDesktop] = useState(false);
  const [sortConfig, setSortConfig] = useState({ column: null, direction: "asc" });
  const [colWidths, setColWidths] = useState({
    key: 220,
    value: 340,
    comment: 300,
    state: 130,
  });
  const [langSearch, setLangSearch] = useState("");
  const [addLangQuery, setAddLangQuery] = useState("");
  const [addLangOpen, setAddLangOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDismissed, setMobileDismissed] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [colorVision, setColorVision] = useState("default");
  const [visionMenuOpen, setVisionMenuOpen] = useState(false);
  // Which document type is open: "xcstrings" (multi-language catalog) or
  // "strings" (single-language legacy file). Saving re-exports the same
  // format that was imported.
  const [docFormat, setDocFormat] = useState("xcstrings");
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const historySnapshotRef = useRef(null);
  const hasLoadedFromStorageRef = useRef(false);
  const guideCloseRef = useRef(null);

  const SIDEBAR_MIN = 180;
  const SIDEBAR_MAX = 480;

  // Sync the toggle with the theme (and color-vision mode) the inline <head>
  // script already applied.
  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
    setColorVision(
      document.documentElement.getAttribute("data-color-vision") || "default"
    );
  }, []);

  // Close the color-vision menu on Escape.
  useEffect(() => {
    if (!visionMenuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setVisionMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visionMenuOpen]);

  // Track whether the two-column resizable layout is active (lg breakpoint).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // This editor targets desktop browsers; flag small screens so we can
  // suggest switching to a Mac/Windows browser.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Close the user-guide dialog on Escape, and move focus into it on open so
  // screen readers announce the dialog.
  useEffect(() => {
    if (!guideOpen) return;
    guideCloseRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setGuideOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [guideOpen]);

  // Drag a table column border to resize that column.
  function startColResize(e, colKey) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = colWidths[colKey];

    const onMove = (ev) => {
      const next = Math.max(80, startWidth + (ev.clientX - startX));
      setColWidths((prev) => ({ ...prev, [colKey]: next }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }

  // Drag the divider between the Languages column and the table to resize.
  function startResize(e) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMove = (ev) => {
      const next = Math.min(
        Math.max(startWidth + (ev.clientX - startX), SIDEBAR_MIN),
        SIDEBAR_MAX
      );
      setSidebarWidth(next);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }

  function toggleTheme() {
    const next = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      console.error("Failed to persist theme preference:", e);
    }
    setTheme(next);
  }

  function applyColorVision(mode) {
    if (mode === "default") {
      document.documentElement.removeAttribute("data-color-vision");
    } else {
      document.documentElement.setAttribute("data-color-vision", mode);
    }
    try {
      if (mode === "default") {
        localStorage.removeItem(COLOR_VISION_KEY);
      } else {
        localStorage.setItem(COLOR_VISION_KEY, mode);
      }
    } catch (e) {
      console.error("Failed to persist color-vision preference:", e);
    }
    setColorVision(mode);
    setVisionMenuOpen(false);
  }

  // Load previously auto-saved data from local storage on mount.
  // Kept in useEffect (not useState initializer) to avoid SSR hydration mismatch.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restoring a session isn't a user edit — make the restored catalog
        // the history baseline so it can't be undone.
        historySnapshotRef.current = parsed;
        setData(parsed);
        // Keep the selection valid for the restored document (matters in
        // .strings mode, where the sidebar is hidden and the language can't
        // be switched by hand).
        const codes = getLocaleCodes(parsed);
        if (codes.length && !codes.includes("en")) {
          setSelectedLanguage(parsed.sourceLanguage || codes[0]);
        }
      }
      if (localStorage.getItem(FORMAT_KEY) === "strings") {
        setDocFormat("strings");
      }
    } catch (e) {
      console.error("Failed to load saved data from local storage:", e);
    } finally {
      hasLoadedFromStorageRef.current = true;
    }
  }, []);

  // Auto-save data to local storage whenever it changes (temporary safeguard).
  useEffect(() => {
    if (!hasLoadedFromStorageRef.current) return;

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(FORMAT_KEY, docFormat);
      } catch (e) {
        console.error("Failed to auto-save data to local storage:", e);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [data, docFormat]);

  // Record undo history whenever the catalog changes. Debounced so a burst of
  // keystrokes in one cell collapses into a single undo step; capped at 50
  // steps. Undo/redo and session restore point historySnapshotRef at the data
  // they set, so their own changes aren't re-recorded (the ref-identity check
  // below also makes this safe under StrictMode's double-run of effects).
  useEffect(() => {
    if (historySnapshotRef.current === null) {
      historySnapshotRef.current = data;
      return;
    }
    if (historySnapshotRef.current === data) return;
    const prev = historySnapshotRef.current;
    const timeoutId = setTimeout(() => {
      setUndoStack((stack) => [...stack.slice(-49), prev]);
      setRedoStack([]);
      historySnapshotRef.current = data;
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [data]);

  function undo() {
    if (!undoStack.length) return;
    const prev = undoStack[undoStack.length - 1];
    historySnapshotRef.current = prev;
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([...redoStack, data]);
    setData(prev);
  }

  function redo() {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    historySnapshotRef.current = next;
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack([...undoStack, data]);
    setData(next);
  }

  // Translate a batch of strings in a single request. Returns the translated
  // values in the same order as sourceTexts.
  async function translateTexts(sourceTexts, sourceLanguage) {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: sourceTexts,
        from: sourceLanguage,
        to: selectedLanguage,
      }),
    });

    if (!res.ok) {
      throw new Error(`Translation request failed with status ${res.status}`);
    }

    const json = await res.json();
    if (!Array.isArray(json.outputs) || json.outputs.length !== sourceTexts.length) {
      throw new Error("Translation response did not match the request");
    }
    return json.outputs;
  }

  // Import a legacy .strings file. The format carries no locale, so entries
  // land in the currently selected language: merged into the open catalog
  // when any keys match, otherwise as a fresh catalog with that language as
  // the source.
  function loadStringsFile(text) {
    const entries = parseStringsFile(text);
    if (!entries.length) {
      throw new Error("No key/value pairs found");
    }
    const overlap = entries.filter((e) => data.strings?.[e.key]).length;
    const merge =
      overlap > 0 &&
      confirm(
        `${overlap} of ${entries.length} keys match the open catalog.\n\n` +
          `OK — merge them into ${langName(selectedLanguage)} (${selectedLanguage})\n` +
          `Cancel — replace the catalog with this file`
      );
    if (merge) {
      // Merging enriches the open document, so its format is kept.
      setData((prev) => {
        const next = { ...prev, strings: { ...prev.strings } };
        for (const { key, value, comment } of entries) {
          const entry = { ...(next.strings[key] || { extractionState: "manual" }) };
          if (comment && !entry.comment) entry.comment = comment;
          const localizations = { ...(entry.localizations || {}) };
          const loc = setLocalizationValue(localizations[selectedLanguage], value);
          if (loc.stringUnit) {
            loc.stringUnit = { ...loc.stringUnit, state: "translated" };
          }
          localizations[selectedLanguage] = loc;
          entry.localizations = localizations;
          next.strings[key] = entry;
        }
        return next;
      });
    } else {
      const strings = {};
      for (const { key, value, comment } of entries) {
        strings[key] = {
          extractionState: "manual",
          ...(comment ? { comment } : {}),
          localizations: {
            [selectedLanguage]: {
              stringUnit: { state: "translated", value },
            },
          },
        };
      }
      setData({ sourceLanguage: selectedLanguage, strings, version: "1.0" });
      setDocFormat("strings");
      // The search field lives in the (now hidden) sidebar — clear it so a
      // stale query can't invisibly filter the table.
      setLangSearch("");
    }
  }

  // Read a .xcstrings or .strings file and load it into the editor. Shared by
  // the Import button and drag-and-drop.
  function loadFile(file) {
    if (!file) return;
    const isStrings = /\.strings$/i.test(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (isStrings) {
          loadStringsFile(e.target.result);
          return;
        }
        const parsed = JSON.parse(e.target.result);
        if (!parsed || typeof parsed.strings !== "object" || parsed.strings === null) {
          throw new Error("Missing a 'strings' object");
        }
        setData(parsed);
        setDocFormat("xcstrings");
        // Point the editor at a language that actually exists in the file so
        // the table doesn't render against an absent locale.
        const codes = getLocaleCodes(parsed);
        setSelectedLanguage(
          codes.includes(selectedLanguage)
            ? selectedLanguage
            : parsed.sourceLanguage || codes[0] || "en"
        );
      } catch (err) {
        console.error(`Failed to parse ${isStrings ? ".strings" : ".xcstrings"} file:`, err);
        alert(
          isStrings
            ? "Could not read that file. Make sure it is a valid .strings file."
            : "Could not read that file. Make sure it is a valid .xcstrings catalog."
        );
      }
    };
    reader.readAsText(file);
  }

  // Copy the site URL so mobile visitors can open it later on a desktop.
  async function copyUrl() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch (e) {
      // Clipboard API can be unavailable (http, older browsers); fall back to
      // a temporary input + execCommand.
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  }

  function importData() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xcstrings,.strings";
    fileInput.addEventListener("change", (e) => {
      loadFile(e.target.files[0]);
    });
    fileInput.click();
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    // Only clear when the pointer actually leaves the window, not when moving
    // between child elements.
    if (e.relatedTarget === null || !e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) loadFile(file);
  }

  // Translate every key from the source language into the currently
  // selected language using the Google Translate endpoint (/api/translate).
  async function translateAll() {
    const sourceLanguage = data.sourceLanguage || "en";
    if (selectedLanguage === sourceLanguage) {
      alert(
        "The selected language is the source language. Pick a different language to translate into."
      );
      return;
    }

    // Only fill in strings that are still empty in the target language, so
    // existing translations (including manual edits) are never overwritten.
    const keys = Object.keys(data.strings).filter(
      (key) =>
        !readLocalization(data.strings[key].localizations?.[selectedLanguage])
          .value
    );
    if (!keys.length) {
      alert(
        `Nothing to translate — every string already has a ${langName(selectedLanguage)} (${selectedLanguage}) value.`
      );
      return;
    }

    setIsTranslating(true);
    try {
      const results = [];
      const batchSize = 50;

      for (let i = 0; i < keys.length; i += batchSize) {
        const batchKeys = keys.slice(i, i + batchSize);
        const sourceTexts = batchKeys.map(
          (key) =>
            readLocalization(data.strings[key].localizations?.[sourceLanguage])
              .value || key
        );
        try {
          const outputs = await translateTexts(sourceTexts, sourceLanguage);
          results.push(
            ...batchKeys.map((key, j) => ({ key, value: outputs[j] ?? null }))
          );
        } catch (e) {
          console.error(
            `Failed to translate batch "${batchKeys[0]}"…"${batchKeys[batchKeys.length - 1]}":`,
            e
          );
          results.push(...batchKeys.map((key) => ({ key, value: null })));
        }
      }

      setData((prevData) => {
        const newData = { ...prevData, strings: { ...prevData.strings } };
        for (const { key, value } of results) {
          if (value == null || !newData.strings[key]) continue;
          // Re-check against the latest state: skip anything the user filled
          // in manually while the translation requests were in flight.
          if (
            readLocalization(newData.strings[key].localizations?.[selectedLanguage])
              .value
          ) {
            continue;
          }
          const stringEntry = { ...newData.strings[key] };
          const localizations = { ...stringEntry.localizations };
          const loc = setLocalizationValue(localizations[selectedLanguage], value);
          if (loc.stringUnit) {
            loc.stringUnit = { ...loc.stringUnit, state: "translated" };
          }
          localizations[selectedLanguage] = loc;
          stringEntry.localizations = localizations;
          newData.strings[key] = stringEntry;
        }
        return newData;
      });
    } finally {
      setIsTranslating(false);
    }
  }

  function resetData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FORMAT_KEY);
    } catch (e) {
      console.error("Failed to clear saved data from local storage:", e);
    } finally {
      setData(sampleData);
      setDocFormat("xcstrings");
      alert("Data has been reset.");
    }
  }

  function downloadBlob(content, filename) {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  }

  function exportData() {
    // Save data JSON as .xcstrings file
    downloadBlob(JSON.stringify(data), "Localizable.xcstrings");
  }

  // Export the selected language as a legacy Localizable.strings file.
  // Untranslated keys fall back to the source-language value, then the key,
  // so the file is always complete and usable.
  function exportStrings() {
    const sourceLanguage = data.sourceLanguage || "en";
    const lines = [];
    for (const key of Object.keys(data.strings || {})) {
      const entry = data.strings[key];
      const value =
        readLocalization(entry?.localizations?.[selectedLanguage]).value ||
        readLocalization(entry?.localizations?.[sourceLanguage]).value ||
        key;
      if (entry?.comment) {
        lines.push(`/* ${entry.comment.replace(/\*\//g, "*\\/")} */`);
      }
      lines.push(`"${escapeStringsText(key)}" = "${escapeStringsText(value)}";`, "");
    }
    downloadBlob(lines.join("\n"), "Localizable.strings");
  }

  const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60";
  const btnSecondary = `${btnBase} px-3.5 py-2 text-sm text-gray-700 dark:text-gray-100 bg-white/70 dark:bg-white/10 border border-black/[0.06] dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-white/20`;
  const btnPrimary = `${btnBase} px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25`;
  const iconBtn = `${btnBase} h-9 w-9 text-gray-700 dark:text-gray-100 bg-white/70 dark:bg-white/10 border border-black/[0.06] dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-white/20`;
  const card =
    "rounded-2xl border border-black/[0.06] dark:border-white/10 bg-white/70 dark:bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]";

  const selectedLangName = langName(selectedLanguage);

  // Union of every locale that appears anywhere in the catalog, plus the
  // source language. Robust to strings that have no `localizations` at all.
  const localeCodes = getLocaleCodes(data);

  const stringKeys = Object.keys(data.strings || {});

  // Per-selected-language translation stats for the analytics cards.
  const translatedCount = stringKeys.filter(
    (key) =>
      readLocalization(data.strings[key]?.localizations?.[selectedLanguage])
        .state === "translated"
  ).length;
  const totalKeys = stringKeys.length;
  const completion = totalKeys ? Math.round((translatedCount / totalKeys) * 100) : 0;

  // Translation completion percentage for a given locale, used by the sidebar
  // donut charts.
  function completionForLang(code) {
    if (!totalKeys) return 0;
    const done = stringKeys.reduce(
      (n, key) =>
        n +
        (readLocalization(data.strings[key]?.localizations?.[code]).state ===
        "translated"
          ? 1
          : 0),
      0
    );
    return Math.round((done / totalKeys) * 100);
  }

  // Languages that could still be added (known list minus what's present).
  const addableLanguages = languages.filter((l) => !localeCodes.includes(l.code));

  // Single search over the locales already in the catalog. If nothing
  // matches (e.g. the user is searching for a table key), fall back to
  // showing every language so the sidebar doesn't look empty.
  const langMatches = localeCodes.filter((code) => {
    const q = langSearch.trim().toLowerCase();
    if (!q) return true;
    const name = langName(code).toLowerCase();
    return name.includes(q) || code.toLowerCase().includes(q);
  });
  const filteredLocaleCodes = langMatches.length ? langMatches : localeCodes;

  // Autosuggest matches for the "add language" combobox.
  const addLangMatches = addableLanguages.filter((l) => {
    const q = addLangQuery.trim().toLowerCase();
    if (!q) return true;
    return l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q);
  });

  function requestSort(column) {
    setSortConfig((prev) =>
      prev.column === column
        ? { column, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { column, direction: "asc" }
    );
  }

  function sortValueFor(key, column) {
    const view = readLocalization(
      data.strings[key]?.localizations?.[selectedLanguage]
    );
    switch (column) {
      case "value":
        return view.value || "";
      case "comment":
        return data.strings[key]?.comment || "";
      case "state":
        return view.state === "translated" ? "1" : "0";
      case "key":
      default:
        return key;
    }
  }

  const sortedKeys = sortConfig.column
    ? [...stringKeys].sort((a, b) => {
        const cmp = String(sortValueFor(a, sortConfig.column)).localeCompare(
          String(sortValueFor(b, sortConfig.column)),
          undefined,
          { numeric: true, sensitivity: "base" }
        );
        return sortConfig.direction === "asc" ? cmp : -cmp;
      })
    : stringKeys;

  // Filter the (sorted) rows by the single search field — matches the key,
  // the selected-language value, or the comment. If nothing matches (e.g. the
  // user is searching for a language), fall back to showing every row.
  const keyMatches = sortedKeys.filter((key) => {
    const q = langSearch.trim().toLowerCase();
    if (!q) return true;
    const view = readLocalization(
      data.strings[key]?.localizations?.[selectedLanguage]
    );
    const comment = data.strings[key]?.comment || "";
    return (
      key.toLowerCase().includes(q) ||
      (view.value || "").toLowerCase().includes(q) ||
      comment.toLowerCase().includes(q)
    );
  });
  const visibleKeys = keyMatches.length ? keyMatches : sortedKeys;

  // Add a new locale to every string so it shows up as a translatable column.
  function addLanguage(code) {
    if (!code) return;
    setData((prev) => {
      const next = { ...prev, strings: { ...prev.strings } };
      for (const key of Object.keys(next.strings)) {
        const entry = { ...next.strings[key] };
        const localizations = { ...(entry.localizations || {}) };
        if (!localizations[code]) {
          localizations[code] = { stringUnit: { state: "new", value: "" } };
        }
        entry.localizations = localizations;
        next.strings[key] = entry;
      }
      return next;
    });
    setSelectedLanguage(code);
  }

  return (
    <main
      className="relative flex min-h-screen flex-col items-center gap-2 px-4 pb-2 pt-2 sm:px-6 sm:pb-3 sm:pt-3 lg:h-screen lg:min-h-0 lg:overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Announce long-running translation state to screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {isTranslating ? "Translating all keys…" : ""}
      </div>

      {/* Liquid mesh gradient background */}
      <div className="mesh-bg" aria-hidden="true">
        <span className="mesh-blob mesh-blob-1" />
        <span className="mesh-blob mesh-blob-2" />
        <span className="mesh-blob mesh-blob-3" />
        <span className="mesh-blob mesh-blob-4" />
      </div>

      {/* Drag-and-drop overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md pointer-events-none">
          <div className="rounded-3xl border border-dashed border-white/70 bg-white/15 px-12 py-10 text-center text-white shadow-2xl">
            <i aria-hidden="true" className="fa-solid fa-cloud-arrow-up text-5xl" />
            <p className="mt-4 text-lg font-semibold tracking-tight">
              Drop your .xcstrings or .strings file
            </p>
          </div>
        </div>
      )}

      {/* Mobile: this editor is built for desktop */}
      {isMobile && !mobileDismissed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Best on desktop"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6 backdrop-blur-md"
        >
          <div className={`${card} w-full max-w-sm p-7 text-center`}>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <i aria-hidden="true" className="fa-solid fa-desktop text-2xl" />
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
              Best on desktop
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Localizable Online is designed for larger screens. Please open it
              in a Mac or Windows browser for the full editing experience.
            </p>
            <button
              onClick={copyUrl}
              className={`${btnPrimary} mt-5 w-full justify-center`}
            >
              <i
                aria-hidden="true"
                className={`fa-solid ${urlCopied ? "fa-check" : "fa-link"}`}
              />
              {urlCopied ? "Copied!" : "Copy URL for desktop"}
            </button>
            <button
              onClick={() => setMobileDismissed(true)}
              className={`${btnSecondary} mt-2.5 w-full justify-center`}
            >
              Continue anyway
            </button>
          </div>
        </div>
      )}

      {/* User guide dialog */}
      {guideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="User guide"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setGuideOpen(false)}
          />
          <div
            className={`${card} relative z-10 max-h-[85vh] w-full max-w-xl overflow-y-auto p-6`}
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                <i aria-hidden="true" className="fa-solid fa-circle-question text-blue-500" />
                User Guide
              </h2>
              <button
                ref={guideCloseRef}
                onClick={() => setGuideOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/[0.05] hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
              >
                <i aria-hidden="true" className="fa-solid fa-xmark" />
              </button>
            </div>
            {[
              {
                heading: "Get started",
                items: [
                  {
                    icon: "fa-file-arrow-up",
                    title: "Import a catalog",
                    body: "Click Upload or drag a .xcstrings catalog — or a legacy .strings file — anywhere onto the page. A .strings file loads into the selected language.",
                  },
                  {
                    icon: "fa-download",
                    title: "Export",
                    body: "Save downloads the same format you imported — catalogs as Localizable.xcstrings, legacy files as Localizable.strings.",
                  },
                  {
                    icon: "fa-arrows-rotate",
                    title: "Start over",
                    body: "Reset clears your saved edits and reloads the built-in sample catalog.",
                  },
                ],
              },
              {
                heading: "Editing",
                items: [
                  {
                    icon: "fa-pen-to-square",
                    title: "Edit inline",
                    body: "Click any translation or comment cell and type. Changes autosave to your browser.",
                  },
                  {
                    icon: "fa-rotate-left",
                    title: "Undo & redo",
                    body: "Step backwards or forwards through your edits with the arrow buttons in the toolbar.",
                  },
                  {
                    icon: "fa-list-ol",
                    title: "Plurals & variations",
                    body: "Keys with plural or device variations show their “other” text — editing updates that variation and leaves the rest untouched.",
                  },
                ],
              },
              {
                heading: "Languages & translation",
                items: [
                  {
                    icon: "fa-language",
                    title: "Languages",
                    body: "Switch languages in the sidebar, search them, or add a new one from the autosuggest box.",
                  },
                  {
                    icon: "fa-wand-magic-sparkles",
                    title: "Translate all",
                    body: "Machine-translate every key into the selected language in one click. Existing translations are overwritten, so export a copy first if you're unsure.",
                  },
                  {
                    icon: "fa-chart-simple",
                    title: "Track progress",
                    body: "The score cards above the table show live counts for keys, languages, translated strings and completion.",
                  },
                ],
              },
              {
                heading: "Workspace",
                items: [
                  {
                    icon: "fa-magnifying-glass",
                    title: "Search & sort",
                    body: "Search by key, translation or comment, and click a column header to sort — click again to reverse the order.",
                  },
                  {
                    icon: "fa-left-right",
                    title: "Make room",
                    body: "Drag column edges or the sidebar edge to resize them, or collapse the sidebar entirely.",
                  },
                  {
                    icon: "fa-universal-access",
                    title: "Appearance",
                    body: "Switch light or dark mode from the toolbar, or pick a color-blind-friendly palette from the accessibility menu.",
                  },
                ],
              },
            ].map((section) => (
              <section key={section.heading} className="mt-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {section.heading}
                </h3>
                <ul className="mt-2.5 flex flex-col gap-3.5">
                  {section.items.map((step) => (
                    <li key={step.title} className="flex gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <i aria-hidden="true" className={`fa-solid ${step.icon} text-sm`} />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {step.title}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <p className="mt-6 rounded-xl bg-black/[0.04] px-3.5 py-2.5 text-xs leading-relaxed text-gray-500 dark:bg-white/[0.06] dark:text-gray-400">
              <i aria-hidden="true" className="fa-solid fa-lightbulb mr-1.5 text-amber-500" />
              Your catalog stays in this browser — only Translate sends text to
              the translation service. Press{" "}
              <kbd className="rounded-md border border-black/10 bg-white/80 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-300">
                Esc
              </kbd>{" "}
              to close this guide.
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <header
        className={`${card} sticky top-2 z-30 flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:static`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-1">
          <i aria-hidden="true" className="fa-brands fa-apple text-xl text-gray-900 dark:text-white" />
          <span className="text-[15px] tracking-tight">
            <span className="font-semibold">Localizable</span>{" "}
            <span className="text-gray-500 dark:text-gray-400">Online</span>
          </span>
          <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-white/10 dark:text-gray-400">
            {APP_VERSION}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            className={iconBtn}
            onClick={undo}
            disabled={!undoStack.length}
            title="Undo"
            aria-label="Undo"
          >
            <i aria-hidden="true" className="fa-solid fa-rotate-left" />
          </button>

          <button
            className={iconBtn}
            onClick={redo}
            disabled={!redoStack.length}
            title="Redo"
            aria-label="Redo"
          >
            <i aria-hidden="true" className="fa-solid fa-rotate-right" />
          </button>

          <div className="mx-0.5 h-6 w-px bg-black/10 dark:bg-white/10" />

          <button
            className={btnPrimary}
            onClick={translateAll}
            disabled={isTranslating}
            title={`Translate all keys into ${selectedLangName}`}
            aria-label={`Translate all keys into ${selectedLangName}`}
          >
            {isTranslating ? (
              <i aria-hidden="true" className="fa-solid fa-circle-notch fa-spin" />
            ) : (
              <i aria-hidden="true" className="fa-solid fa-wand-magic-sparkles" />
            )}
            <span className="hidden sm:inline">
              {isTranslating ? "Translating…" : "Translate"}
            </span>
          </button>

          <button
            className={btnSecondary}
            onClick={importData}
            title="Upload a .xcstrings or .strings file"
            aria-label="Upload a .xcstrings or .strings file"
          >
            <i aria-hidden="true" className="fa-solid fa-arrow-up-from-bracket" />
            <span className="hidden md:inline">Upload</span>
          </button>

          <button
            className={btnSecondary}
            onClick={docFormat === "strings" ? exportStrings : exportData}
            title={
              docFormat === "strings"
                ? "Download Localizable.strings"
                : "Download Localizable.xcstrings"
            }
            aria-label={
              docFormat === "strings"
                ? "Download Localizable.strings"
                : "Download Localizable.xcstrings"
            }
          >
            <i aria-hidden="true" className="fa-solid fa-download" />
            <span className="hidden md:inline">Save</span>
          </button>

          <button
            className={btnSecondary}
            onClick={resetData}
            title="Reset to sample data"
            aria-label="Reset to sample data"
          >
            <i aria-hidden="true" className="fa-solid fa-arrows-rotate" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            className={btnSecondary}
            onClick={() => setGuideOpen(true)}
            title="User guide"
            aria-label="User guide"
          >
            <i aria-hidden="true" className="fa-solid fa-circle-question" />
            <span className="hidden md:inline">Guide</span>
          </button>

          <div className="mx-0.5 h-6 w-px bg-black/10 dark:bg-white/10" />

          {/* Light / dark switch */}
          <button
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Toggle light/dark mode"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-black/[0.06] bg-white/70 shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:border-white/10 dark:bg-white/10"
          >
            <i aria-hidden="true" className="fa-solid fa-sun pointer-events-none absolute left-2.5 text-[11px] text-amber-500/80" />
            <i aria-hidden="true" className="fa-solid fa-moon pointer-events-none absolute right-2.5 text-[11px] text-indigo-400/80" />
            <span
              className={`flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 dark:bg-gray-100 ${
                theme === "dark" ? "translate-x-8" : "translate-x-1"
              }`}
            >
              <i
                aria-hidden="true"
                className={`fa-solid text-[11px] ${
                  theme === "dark"
                    ? "fa-moon text-indigo-500"
                    : "fa-sun text-amber-500"
                }`}
              />
            </span>
          </button>

          {/* Color-vision (color blind) options */}
          <div className="relative">
            <button
              onClick={() => setVisionMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={visionMenuOpen}
              aria-label="Color vision options"
              title="Color vision options"
              className={`${iconBtn} ${
                colorVision !== "default" ? "text-blue-600 dark:text-blue-400" : ""
              }`}
            >
              <i aria-hidden="true" className="fa-solid fa-universal-access text-base" />
            </button>
            {visionMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setVisionMenuOpen(false)}
                />
                <div
                  role="menu"
                  aria-label="Color vision options"
                  onKeyDown={(e) => {
                    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                    e.preventDefault();
                    const items = [
                      ...e.currentTarget.querySelectorAll('[role="menuitemradio"]'),
                    ];
                    const current = items.indexOf(document.activeElement);
                    const next =
                      e.key === "ArrowDown"
                        ? (current + 1) % items.length
                        : (current - 1 + items.length) % items.length;
                    items[next]?.focus();
                  }}
                  className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-black/[0.08] bg-white/95 p-1 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/95"
                >
                  <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Color vision
                  </div>
                  {VISION_MODES.map((mode) => {
                    const isActive = colorVision === mode.id;
                    return (
                      <button
                        key={mode.id}
                        role="menuitemradio"
                        aria-checked={isActive}
                        onClick={() => applyColorVision(mode.id)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-black/[0.05] dark:text-gray-200 dark:hover:bg-white/10"
                      >
                        {/* Done / New swatch preview — one circle, half each color */}
                        <span
                          className="h-4 w-4 shrink-0 rounded-full"
                          aria-hidden="true"
                          style={{
                            background: `linear-gradient(120deg, ${mode.done} 50%, ${mode.new} 50%)`,
                          }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {mode.name}
                          </span>
                          <span className="block truncate text-xs text-gray-400 dark:text-gray-500">
                            {mode.desc}
                          </span>
                        </span>
                        {isActive && (
                          <i aria-hidden="true" className="fa-solid fa-check shrink-0 text-xs text-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <a
            href="https://github.com/1998code/xcstrings-online"
            target="_blank"
            rel="noopener noreferrer"
            className={btnSecondary}
            aria-label="Open source on GitHub"
            title="Open source on GitHub"
          >
            <i aria-hidden="true" className="fa-brands fa-github" />
            <span className="hidden md:inline">Open Source</span>
          </a>
        </div>
      </header>

      {/* Analytics score cards — one grouped panel, no gaps */}
      <div
        className={`${card} grid w-full max-w-7xl grid-cols-2 divide-x divide-y divide-black/[0.06] overflow-hidden dark:divide-white/10 lg:grid-cols-4 lg:divide-y-0`}
      >
        <div className="px-5 py-3">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <i aria-hidden="true" className="fa-solid fa-key text-[11px]" />
            <span className="text-[13px] font-medium">Keys</span>
          </div>
          <div className="mt-1 text-2xl font-semibold leading-none tracking-tight tabular-nums text-gray-900 dark:text-white">
            {totalKeys}
          </div>
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <i aria-hidden="true" className="fa-solid fa-language text-[11px]" />
            <span className="text-[13px] font-medium">Languages</span>
          </div>
          <div className="mt-1 text-2xl font-semibold leading-none tracking-tight tabular-nums text-gray-900 dark:text-white">
            {localeCodes.length}
          </div>
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <i aria-hidden="true" className="fa-solid fa-circle-check text-[11px]" />
            <span className="truncate text-[13px] font-medium">
              Translated · {selectedLangName}
            </span>
          </div>
          <div className="mt-1 text-2xl font-semibold leading-none tracking-tight tabular-nums text-gray-900 dark:text-white">
            {translatedCount}
            <span className="text-base font-medium text-gray-400"> / {totalKeys}</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <i aria-hidden="true" className="fa-solid fa-chart-simple text-[11px]" />
              <span className="text-[13px] font-medium">Complete</span>
            </div>
            <div className="mt-1 text-2xl font-semibold leading-none tracking-tight tabular-nums text-gray-900 dark:text-white">
              {completion}
              <span className="text-base font-medium text-gray-400">%</span>
            </div>
          </div>
          <svg
            viewBox="0 0 44 44"
            className="h-10 w-10 -rotate-90 shrink-0"
            aria-hidden="true"
          >
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              strokeWidth="4"
              className="stroke-black/[0.08] dark:stroke-white/10"
            />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              className="progress-ring-done transition-all duration-700"
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={(2 * Math.PI * 18 * (100 - completion)) / 100}
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="flex w-full max-w-7xl flex-col items-start gap-2 lg:min-h-0 lg:flex-1 lg:flex-row lg:items-stretch lg:gap-0">
        {/* Languages List — hidden for single-language .strings documents */}
        {docFormat !== "strings" && (
        <aside
          style={isDesktop ? { width: sidebarWidth } : undefined}
          className={`${card} w-full shrink-0 p-3 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:rounded-r-none lg:border-r-0`}
        >
          <div className="flex items-center justify-between px-2 py-1.5">
            <h2 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
              Languages
            </h2>
            <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
              {localeCodes.length}
            </span>
          </div>

          {/* Single search — filters both the language list and the table */}
          <div className="relative mt-1">
            <i aria-hidden="true" className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
            <input
              type="text"
              value={langSearch}
              onChange={(e) => setLangSearch(e.target.value)}
              placeholder="Search languages & keys…"
              aria-label="Search languages and strings"
              className="w-full rounded-lg border border-black/[0.06] bg-white/60 py-1.5 pl-8 pr-8 text-sm text-gray-700 shadow-sm transition-colors focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:placeholder-gray-500"
            />
            {langSearch && (
              <button
                onClick={() => setLangSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <i aria-hidden="true" className="fa-solid fa-circle-xmark" />
              </button>
            )}
          </div>

          <ul className="mt-1.5 flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto lg:max-h-none lg:min-h-0 lg:flex-1">
            {filteredLocaleCodes.length === 0 && (
              <li className="px-2.5 py-3 text-center text-xs text-gray-400">
                No languages match “{langSearch}”.
              </li>
            )}
            {filteredLocaleCodes.map((lang) => {
              const isActive = selectedLanguage === lang;
              return (
                <li key={lang}>
                  <button
                    onClick={() => setSelectedLanguage(lang)}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`${langName(lang)} (${lang}), ${completionForLang(lang)}% translated`}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-black/[0.05] dark:text-gray-200 dark:hover:bg-white/10"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {langName(lang)}
                    </span>
                    <span
                      className={`shrink-0 text-xs ${
                        isActive ? "text-white/70" : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {lang}
                    </span>
                    <LangDonut pct={completionForLang(lang)} active={isActive} />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Add language — searchable autosuggest */}
          <div className="relative mt-2 border-t border-black/[0.06] pt-2 dark:border-white/10">
            <div className="relative">
              <i aria-hidden="true" className="fa-solid fa-plus pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
              <input
                type="text"
                value={addLangQuery}
                onChange={(e) => {
                  setAddLangQuery(e.target.value);
                  setAddLangOpen(true);
                }}
                onFocus={() => setAddLangOpen(true)}
                onBlur={() => setTimeout(() => setAddLangOpen(false), 120)}
                disabled={addableLanguages.length === 0}
                placeholder={
                  addableLanguages.length ? "Add language…" : "All languages added"
                }
                aria-label="Add a language"
                role="combobox"
                aria-expanded={addLangOpen}
                aria-controls="add-language-listbox"
                aria-autocomplete="list"
                className="w-full rounded-lg border border-black/[0.06] bg-white/60 py-2 pl-8 pr-3 text-sm text-gray-700 shadow-sm transition-colors focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:placeholder-gray-500"
              />
            </div>
            {addLangOpen && addableLanguages.length > 0 && (
              <ul
                id="add-language-listbox"
                role="listbox"
                aria-label="Languages to add"
                className="absolute bottom-full left-0 right-0 z-20 mb-1.5 max-h-60 overflow-y-auto rounded-xl border border-black/[0.08] bg-white/95 p-1 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/95"
              >
                {addLangMatches.length === 0 ? (
                  <li className="px-2.5 py-2 text-center text-xs text-gray-400">
                    No match
                  </li>
                ) : (
                  addLangMatches.map((l) => (
                    <li key={l.code} role="presentation">
                      <button
                        role="option"
                        aria-selected={false}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addLanguage(l.code);
                          setAddLangQuery("");
                          setAddLangOpen(false);
                        }}
                        className="flex w-full items-center justify-between gap-4 rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-black/[0.05] dark:text-gray-200 dark:hover:bg-white/10"
                      >
                        <span className="truncate font-medium">{l.name}</span>
                        <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                          {l.code}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </aside>
        )}

        {/* Resize handle between the Languages column and the table */}
        {docFormat !== "strings" && isDesktop && (
          <div
            onPointerDown={startResize}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize languages panel"
            title="Drag to resize"
            className="group z-10 -mx-1.5 hidden w-3 shrink-0 cursor-col-resize items-stretch justify-center self-stretch lg:flex"
          >
            <div className="w-px bg-black/10 transition-colors group-hover:w-0.5 group-hover:bg-blue-500/70 dark:bg-white/10 dark:group-hover:bg-blue-400/70" />
          </div>
        )}

        {/* Table with inline edit feature */}
        <section
          className={`${card} w-full overflow-hidden lg:flex lg:min-h-0 lg:min-w-0 lg:flex-1 lg:flex-col ${
            docFormat !== "strings" ? "lg:rounded-l-none lg:border-l-0" : ""
          }`}
        >
          {/* One horizontal scroller wraps the fixed header and the scrolling
              body so they stay aligned when columns are dragged wider. */}
          <div className="flex flex-col overflow-x-auto overflow-y-hidden lg:min-h-0 lg:flex-1">
            <div
              className="flex flex-col lg:h-full lg:min-h-0"
              style={{
                width:
                  colWidths.key +
                  colWidths.value +
                  colWidths.comment +
                  colWidths.state,
                minWidth: "100%",
              }}
            >
              {/* Fixed header — unaffected by vertical scrolling. Reserves the
                  scrollbar gutter so its columns line up with the body. */}
              <div className="shrink-0 overflow-y-scroll">
                <table
                  aria-label="Column headers and sorting"
                  className="w-full table-fixed border-collapse text-sm"
                >
                  <colgroup>
                    <col style={{ width: colWidths.key }} />
                    <col style={{ width: colWidths.value }} />
                    <col style={{ width: colWidths.comment }} />
                    <col style={{ width: colWidths.state }} />
                  </colgroup>
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {[
                        { col: "key", icon: "fa-key", label: "Key", name: "key" },
                        {
                          col: "value",
                          icon: "fa-language",
                          name: `${selectedLangName} translation`,
                          label: (
                            <>
                              {selectedLangName}
                              <span className="ml-1.5 font-normal normal-case text-gray-400">
                                {selectedLanguage}
                              </span>
                            </>
                          ),
                        },
                        {
                          col: "comment",
                          icon: "fa-comment-dots",
                          label: "Comment",
                          name: "comment",
                        },
                        {
                          col: "state",
                          icon: "fa-circle-check",
                          label: "State",
                          name: "state",
                        },
                      ].map(({ col, icon, label, name }, index, cols) => {
                        const active = sortConfig.column === col;
                        return (
                          <th
                            key={col}
                            aria-sort={
                              active
                                ? sortConfig.direction === "asc"
                                  ? "ascending"
                                  : "descending"
                                : undefined
                            }
                            className="relative border-b border-black/[0.07] dark:border-white/10 p-0"
                          >
                            <button
                              type="button"
                              onClick={() => requestSort(col)}
                              aria-label={`Sort by ${name}${
                                active
                                  ? `, currently ${
                                      sortConfig.direction === "asc"
                                        ? "ascending"
                                        : "descending"
                                    }`
                                  : ""
                              }`}
                              className="flex w-full items-center gap-2 overflow-hidden whitespace-nowrap px-4 py-3 text-left font-semibold transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              <i aria-hidden="true" className={`fa-solid ${icon} shrink-0 text-gray-400`} />
                              <span className="truncate">{label}</span>
                              <i
                                aria-hidden="true"
                                className={`fa-solid ml-auto shrink-0 text-[10px] ${
                                  active
                                    ? sortConfig.direction === "asc"
                                      ? "fa-sort-up"
                                      : "fa-sort-down"
                                    : "fa-sort"
                                } ${
                                  active
                                    ? "text-blue-500"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            </button>
                            {/* Column resize handle (not on the last column) */}
                            {index < cols.length - 1 && (
                              <span
                                onPointerDown={(e) => startColResize(e, col)}
                                onClick={(e) => e.stopPropagation()}
                                title="Drag to resize column"
                                aria-hidden="true"
                                className="group absolute right-0 top-0 z-10 flex h-full w-2 cursor-col-resize touch-none items-center justify-center"
                              >
                                <span className="h-1/2 w-px bg-black/10 transition-colors group-hover:bg-blue-500/70 dark:bg-white/15 dark:group-hover:bg-blue-400/70" />
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Scrolling body */}
              <div className="max-h-[60vh] overflow-y-scroll lg:max-h-none lg:min-h-0 lg:flex-1">
                <table
                  aria-label={`Localization strings, ${selectedLangName}`}
                  className="w-full table-fixed border-collapse text-sm"
                >
                  <colgroup>
                    <col style={{ width: colWidths.key }} />
                    <col style={{ width: colWidths.value }} />
                    <col style={{ width: colWidths.comment }} />
                    <col style={{ width: colWidths.state }} />
                  </colgroup>
                  <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                {visibleKeys.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-gray-400"
                    >
                      No strings match “{langSearch}”.
                    </td>
                  </tr>
                )}
                {visibleKeys.map((key) => {
                  const view = readLocalization(
                    data.strings[key]?.localizations?.[selectedLanguage]
                  );
                  const isDone = view.state === "translated";
                  return (
                    <tr
                      key={key}
                      className="transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                        <div className="truncate" title={key}>
                          {key}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          value={view.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            setData((prev) => {
                              const next = { ...prev, strings: { ...prev.strings } };
                              const entry = { ...next.strings[key] };
                              const localizations = {
                                ...(entry.localizations || {}),
                              };
                              localizations[selectedLanguage] = setLocalizationValue(
                                localizations[selectedLanguage],
                                value
                              );
                              entry.localizations = localizations;
                              next.strings[key] = entry;
                              return next;
                            });
                          }}
                          placeholder="Add translation…"
                          aria-label={`${selectedLangName} translation for “${key}”`}
                          className="w-full rounded-md bg-transparent px-1.5 py-1 text-gray-900 transition-colors focus:bg-black/[0.04] focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:text-white dark:placeholder-gray-600 dark:focus:bg-white/[0.06]"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <textarea
                          rows={1}
                          value={data.strings[key]?.comment || ""}
                          onChange={(e) => {
                            const comment = e.target.value;
                            setData((prev) => {
                              const next = { ...prev, strings: { ...prev.strings } };
                              next.strings[key] = {
                                ...next.strings[key],
                                comment,
                              };
                              return next;
                            });
                          }}
                          placeholder="Add comment…"
                          aria-label={`Comment for “${key}”`}
                          className="w-full resize-y rounded-md bg-transparent px-1.5 py-1 text-gray-600 transition-colors focus:bg-black/[0.04] focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:bg-white/[0.06]"
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        {isDone ? (
                          <span className="status-badge-done inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
                            <i aria-hidden="true" className="fa-solid fa-circle-check" />
                            Done
                          </span>
                        ) : (
                          <span className="status-badge-new inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
                            <i aria-hidden="true" className="fa-solid fa-circle-dot" />
                            New
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
