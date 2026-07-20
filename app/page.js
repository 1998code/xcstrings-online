"use client";

import { useState, useEffect, useRef } from "react";
import pkg from "../package.json";

const STORAGE_KEY = "xcstrings-online-data";

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
  const [langSearch, setLangSearch] = useState("");
  const [addLangQuery, setAddLangQuery] = useState("");
  const [addLangOpen, setAddLangOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const hasLoadedFromStorageRef = useRef(false);

  const SIDEBAR_MIN = 180;
  const SIDEBAR_MAX = 480;

  // Sync the toggle with the theme the inline <head> script already applied.
  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
  }, []);

  // Track whether the two-column resizable layout is active (lg breakpoint).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Close the user-guide dialog on Escape.
  useEffect(() => {
    if (!guideOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setGuideOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [guideOpen]);

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

  // Load previously auto-saved data from local storage on mount.
  // Kept in useEffect (not useState initializer) to avoid SSR hydration mismatch.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setData(JSON.parse(saved));
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
      } catch (e) {
        console.error("Failed to auto-save data to local storage:", e);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [data]);

  async function translateText(sourceText, sourceLanguage) {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: sourceText,
        from: sourceLanguage,
        to: selectedLanguage,
      }),
    });

    if (!res.ok) {
      throw new Error(`Translation request failed with status ${res.status}`);
    }

    return res.json();
  }

  // Read a .xcstrings file and load it into the editor. Shared by the Import
  // button and drag-and-drop.
  function loadFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed || typeof parsed.strings !== "object" || parsed.strings === null) {
          throw new Error("Missing a 'strings' object");
        }
        setData(parsed);
        // Point the editor at a language that actually exists in the file so
        // the table doesn't render against an absent locale.
        const codes = getLocaleCodes(parsed);
        setSelectedLanguage(
          codes.includes(selectedLanguage)
            ? selectedLanguage
            : parsed.sourceLanguage || codes[0] || "en"
        );
      } catch (err) {
        console.error("Failed to parse .xcstrings file:", err);
        alert("Could not read that file. Make sure it is a valid .xcstrings catalog.");
      }
    };
    reader.readAsText(file);
  }

  function importData() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xcstrings";
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

    setIsTranslating(true);
    try {
      const keys = Object.keys(data.strings);
      const results = [];
      const batchSize = 10;

      for (let i = 0; i < keys.length; i += batchSize) {
        const batchKeys = keys.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batchKeys.map(async (key) => {
            const sourceText =
              data.strings[key].localizations[sourceLanguage]?.stringUnit?.value ||
              key;
            try {
              const json = await translateText(sourceText, sourceLanguage);
              return { key, value: json.output ?? null };
            } catch (e) {
              console.error(`Failed to translate "${key}":`, e);
              return { key, value: null };
            }
          })
        );
        results.push(...batchResults);
      }

      setData((prevData) => {
        const newData = { ...prevData, strings: { ...prevData.strings } };
        for (const { key, value } of results) {
          if (value == null || !newData.strings[key]) continue;
          const stringEntry = { ...newData.strings[key] };
          const localizations = { ...stringEntry.localizations };
          localizations[selectedLanguage] = {
            ...(localizations[selectedLanguage] || {}),
            stringUnit: {
              ...(localizations[selectedLanguage]?.stringUnit || {}),
              state: "translated",
              value,
            },
          };
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
    } catch (e) {
      console.error("Failed to clear saved data from local storage:", e);
    } finally {
      setData(sampleData);
      alert("Data has been reset.");
    }
  }

  function exportData() {
    // Save data JSON as .xcstrings file
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(data)], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "Localizable.xcstrings";
    document.body.appendChild(element);
    element.click();
  }

  const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60";
  const btnSecondary = `${btnBase} px-3.5 py-2 text-sm text-gray-700 dark:text-gray-100 bg-white/70 dark:bg-white/10 border border-black/[0.06] dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-white/20`;
  const btnPrimary = `${btnBase} px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25`;
  const iconBtn = `${btnBase} h-9 w-9 text-gray-700 dark:text-gray-100 bg-white/70 dark:bg-white/10 border border-black/[0.06] dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-white/20`;
  const card =
    "rounded-2xl border border-black/[0.06] dark:border-white/10 bg-white/70 dark:bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]";

  const selectedLangName =
    languages.find((l) => l.code === selectedLanguage)?.name || selectedLanguage;

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

  // Languages that could still be added (known list minus what's present).
  const addableLanguages = languages.filter((l) => !localeCodes.includes(l.code));

  // Sidebar search over the locales already in the catalog.
  const filteredLocaleCodes = localeCodes.filter((code) => {
    const q = langSearch.trim().toLowerCase();
    if (!q) return true;
    const name = (languages.find((l) => l.code === code)?.name || code).toLowerCase();
    return name.includes(q) || code.toLowerCase().includes(q);
  });

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

  // Filter the (sorted) rows by the table search — matches the key, the
  // selected-language value, or the comment.
  const visibleKeys = sortedKeys.filter((key) => {
    const q = tableSearch.trim().toLowerCase();
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
      className="relative flex min-h-screen flex-col items-center gap-4 px-4 pb-6 pt-2 sm:px-6 sm:pb-8 sm:pt-3"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
            <i className="fa-solid fa-cloud-arrow-up text-5xl" />
            <p className="mt-4 text-lg font-semibold tracking-tight">
              Drop your .xcstrings file
            </p>
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
            className={`${card} relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto p-6`}
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                <i className="fa-solid fa-circle-question text-blue-500" />
                User Guide
              </h2>
              <button
                onClick={() => setGuideOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/[0.05] hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <ul className="mt-4 flex flex-col gap-4">
              {[
                {
                  icon: "fa-file-arrow-up",
                  title: "Import a catalog",
                  body: "Click Upload or drag a .xcstrings file anywhere onto the page.",
                },
                {
                  icon: "fa-pen-to-square",
                  title: "Edit inline",
                  body: "Click any translation or comment cell and type. Changes autosave to your browser.",
                },
                {
                  icon: "fa-language",
                  title: "Languages",
                  body: "Switch languages in the sidebar, search them, or add a new one from the autosuggest box.",
                },
                {
                  icon: "fa-wand-magic-sparkles",
                  title: "Translate all",
                  body: "Machine-translate every key into the selected language with one click.",
                },
                {
                  icon: "fa-magnifying-glass",
                  title: "Search & sort",
                  body: "Search the table by key, translation or comment, and click any column header to sort.",
                },
                {
                  icon: "fa-download",
                  title: "Export",
                  body: "Download your edits back out as a Localizable.xcstrings file.",
                },
              ].map((step) => (
                <li key={step.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <i className={`fa-solid ${step.icon} text-sm`} />
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
          </div>
        </div>
      )}

      {/* Toolbar */}
      <header
        className={`${card} sticky top-2 z-30 flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-1">
          <i className="fa-brands fa-apple text-xl text-gray-900 dark:text-white" />
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
            className={btnPrimary}
            onClick={translateAll}
            disabled={isTranslating}
            title={`Translate all keys into ${selectedLangName}`}
          >
            {isTranslating ? (
              <i className="fa-solid fa-circle-notch fa-spin" />
            ) : (
              <i className="fa-solid fa-wand-magic-sparkles" />
            )}
            <span className="hidden sm:inline">
              {isTranslating ? "Translating…" : "Translate"}
            </span>
          </button>

          <button className={btnSecondary} onClick={importData} title="Upload a .xcstrings file">
            <i className="fa-solid fa-arrow-up-from-bracket" />
            <span className="hidden md:inline">Upload</span>
          </button>

          <button className={btnSecondary} onClick={exportData} title="Download .xcstrings file">
            <i className="fa-solid fa-download" />
            <span className="hidden md:inline">Download</span>
          </button>

          <button className={btnSecondary} onClick={resetData} title="Reset to sample data">
            <i className="fa-solid fa-arrow-rotate-left" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            className={btnSecondary}
            onClick={() => setGuideOpen(true)}
            title="User guide"
          >
            <i className="fa-solid fa-circle-question" />
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
            <i className="fa-solid fa-sun pointer-events-none absolute left-2.5 text-[11px] text-amber-500/80" />
            <i className="fa-solid fa-moon pointer-events-none absolute right-2.5 text-[11px] text-indigo-400/80" />
            <span
              className={`flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 dark:bg-gray-100 ${
                theme === "dark" ? "translate-x-8" : "translate-x-1"
              }`}
            >
              <i
                className={`fa-solid text-[11px] ${
                  theme === "dark"
                    ? "fa-moon text-indigo-500"
                    : "fa-sun text-amber-500"
                }`}
              />
            </span>
          </button>

          <a
            href="https://github.com/1998code/xcstrings-online"
            target="_blank"
            rel="noopener noreferrer"
            className={btnSecondary}
            aria-label="Open source on GitHub"
            title="Open source on GitHub"
          >
            <i className="fa-brands fa-github" />
            <span className="hidden md:inline">Open Source</span>
          </a>
        </div>
      </header>

      {/* Analytics score cards — one grouped panel, no gaps */}
      <div
        className={`${card} grid w-full max-w-7xl grid-cols-2 divide-x divide-y divide-black/[0.06] overflow-hidden dark:divide-white/10 lg:grid-cols-4 lg:divide-y-0`}
      >
        <div className="p-5">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <i className="fa-solid fa-key text-[11px]" />
            <span className="text-[13px] font-medium">Keys</span>
          </div>
          <div className="mt-2 text-[2rem] font-semibold leading-none tracking-tight tabular-nums text-gray-900 dark:text-white">
            {totalKeys}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <i className="fa-solid fa-language text-[11px]" />
            <span className="text-[13px] font-medium">Languages</span>
          </div>
          <div className="mt-2 text-[2rem] font-semibold leading-none tracking-tight tabular-nums text-gray-900 dark:text-white">
            {localeCodes.length}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <i className="fa-solid fa-circle-check text-[11px]" />
            <span className="truncate text-[13px] font-medium">
              Translated · {selectedLangName}
            </span>
          </div>
          <div className="mt-2 text-[2rem] font-semibold leading-none tracking-tight tabular-nums text-gray-900 dark:text-white">
            {translatedCount}
            <span className="text-lg font-medium text-gray-400"> / {totalKeys}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <i className="fa-solid fa-chart-simple text-[11px]" />
              <span className="text-[13px] font-medium">Complete</span>
            </div>
            <div className="mt-2 text-[2rem] font-semibold leading-none tracking-tight tabular-nums text-gray-900 dark:text-white">
              {completion}
              <span className="text-lg font-medium text-gray-400">%</span>
            </div>
          </div>
          <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90 shrink-0">
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
              className="stroke-emerald-500 transition-all duration-700"
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={(2 * Math.PI * 18 * (100 - completion)) / 100}
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="flex w-full max-w-7xl flex-col items-start gap-4 lg:flex-row lg:gap-1">
        {/* Collapsed: slim button to reveal the Languages panel */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            title="Show languages"
            aria-label="Show languages"
            className={`${card} flex w-full shrink-0 items-center justify-center gap-2 p-2.5 lg:sticky lg:top-24 lg:w-auto`}
          >
            <i className="fa-solid fa-angles-right text-gray-500 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 lg:hidden">
              Languages
            </span>
          </button>
        )}

        {/* Languages List */}
        {!sidebarCollapsed && (
        <aside
          style={isDesktop ? { width: sidebarWidth } : undefined}
          className={`${card} w-full shrink-0 p-3 lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-13rem)] lg:flex-col`}
        >
          <div className="flex items-center justify-between px-2 py-1.5">
            <h2 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
              Languages
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
                {localeCodes.length}
              </span>
              <button
                onClick={() => setSidebarCollapsed(true)}
                title="Collapse panel"
                aria-label="Collapse languages panel"
                className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-black/[0.05] hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
              >
                <i className="fa-solid fa-angles-left text-xs" />
              </button>
            </div>
          </div>

          {/* Search existing languages */}
          <div className="relative mt-1">
            <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
            <input
              type="text"
              value={langSearch}
              onChange={(e) => setLangSearch(e.target.value)}
              placeholder="Search languages…"
              aria-label="Search languages"
              className="w-full rounded-lg border border-black/[0.06] bg-white/60 py-1.5 pl-8 pr-8 text-sm text-gray-700 shadow-sm transition-colors focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:placeholder-gray-500"
            />
            {langSearch && (
              <button
                onClick={() => setLangSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <i className="fa-solid fa-circle-xmark" />
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
                    className={`flex w-full items-center justify-between gap-4 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-black/[0.05] dark:text-gray-200 dark:hover:bg-white/10"
                    }`}
                  >
                    <span className="truncate font-medium">
                      {languages.find((l) => l.code === lang)?.name || lang}
                    </span>
                    <span
                      className={`shrink-0 text-xs ${
                        isActive ? "text-white/70" : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {lang}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Add language — searchable autosuggest */}
          <div className="relative mt-2 border-t border-black/[0.06] pt-2 dark:border-white/10">
            <div className="relative">
              <i className="fa-solid fa-plus pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
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
                className="w-full rounded-lg border border-black/[0.06] bg-white/60 py-2 pl-8 pr-3 text-sm text-gray-700 shadow-sm transition-colors focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:placeholder-gray-500"
              />
            </div>
            {addLangOpen && addableLanguages.length > 0 && (
              <ul className="absolute bottom-full left-0 right-0 z-20 mb-1.5 max-h-60 overflow-y-auto rounded-xl border border-black/[0.08] bg-white/95 p-1 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/95">
                {addLangMatches.length === 0 ? (
                  <li className="px-2.5 py-2 text-center text-xs text-gray-400">
                    No match
                  </li>
                ) : (
                  addLangMatches.map((l) => (
                    <li key={l.code}>
                      <button
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
        {!sidebarCollapsed && isDesktop && (
          <div
            onPointerDown={startResize}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize languages panel"
            title="Drag to resize"
            className="group hidden shrink-0 cursor-col-resize items-center justify-center self-stretch px-1 lg:flex"
          >
            <div className="h-16 w-1 rounded-full bg-black/10 transition-colors group-hover:bg-blue-500/70 dark:bg-white/15 dark:group-hover:bg-blue-400/70" />
          </div>
        )}

        {/* Table with inline edit feature */}
        <section className={`${card} w-full overflow-hidden lg:min-w-0 lg:flex-1`}>
          {/* Search across keys, translations and comments */}
          <div className="flex items-center gap-3 border-b border-black/[0.06] px-3 py-2 dark:border-white/10">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search keys, translations, comments…"
                aria-label="Search strings"
                className="w-full rounded-lg border border-black/[0.06] bg-white/60 py-1.5 pl-8 pr-8 text-sm text-gray-700 shadow-sm transition-colors focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:placeholder-gray-500"
              />
              {tableSearch && (
                <button
                  onClick={() => setTableSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <i className="fa-solid fa-circle-xmark" />
                </button>
              )}
            </div>
            <span className="shrink-0 text-xs tabular-nums text-gray-400">
              {visibleKeys.length} / {totalKeys}
            </span>
          </div>
          <div className="max-h-[calc(100vh-14rem)] overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {[
                    { col: "key", icon: "fa-key", label: "Key", cls: "" },
                    {
                      col: "value",
                      icon: "fa-language",
                      label: (
                        <>
                          {selectedLangName}
                          <span className="font-normal normal-case text-gray-400">
                            {selectedLanguage}
                          </span>
                        </>
                      ),
                      cls: "min-w-[22vw]",
                    },
                    {
                      col: "comment",
                      icon: "fa-comment-dots",
                      label: "Comment",
                      cls: "min-w-[18vw]",
                    },
                    { col: "state", icon: "fa-circle-check", label: "State", cls: "" },
                  ].map(({ col, icon, label, cls }) => {
                    const active = sortConfig.column === col;
                    return (
                      <th
                        key={col}
                        className={`sticky top-0 z-20 border-b border-black/[0.07] bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-[#0e1116]/85 p-0 ${cls}`}
                      >
                        <button
                          type="button"
                          onClick={() => requestSort(col)}
                          className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-3 text-left font-semibold transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          <i className={`fa-solid ${icon} text-gray-400`} />
                          {label}
                          <i
                            className={`fa-solid ml-auto text-[10px] ${
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
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                {visibleKeys.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-gray-400"
                    >
                      No strings match “{tableSearch}”.
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
                        <div className="max-w-[240px] truncate" title={key}>
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
                          className="w-full resize-y rounded-md bg-transparent px-1.5 py-1 text-gray-600 transition-colors focus:bg-black/[0.04] focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:bg-white/[0.06]"
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <i className="fa-solid fa-circle-check" />
                            Done
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <i className="fa-solid fa-circle-dot" />
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
        </section>
      </div>
    </main>
  );
}
