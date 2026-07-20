"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "xcstrings-online-data";

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
  const hasLoadedFromStorageRef = useRef(false);

  // Sync the toggle with the theme the inline <head> script already applied.
  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
  }, []);

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
        setData(JSON.parse(e.target.result));
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
  const localeCodes = Object.keys(
    data.strings[Object.keys(data.strings)[0]].localizations
  );

  return (
    <main
      className="relative flex min-h-screen flex-col items-center gap-6 px-4 py-6 sm:px-6 sm:py-8"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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

      {/* Toolbar */}
      <header
        className={`${card} sticky top-4 z-30 flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-1">
          <i className="fa-brands fa-apple text-xl text-gray-900 dark:text-white" />
          <span className="text-[15px] tracking-tight">
            <span className="font-semibold">XCStrings</span>{" "}
            <span className="text-gray-500 dark:text-gray-400">Online</span>
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
            <i className="fa-solid fa-arrow-down-to-bracket" />
            <span className="hidden md:inline">Download</span>
          </button>

          <button className={btnSecondary} onClick={resetData} title="Reset to sample data">
            <i className="fa-solid fa-arrow-rotate-left" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <div className="mx-0.5 h-6 w-px bg-black/10 dark:bg-white/10" />

          <button
            className={iconBtn}
            onClick={toggleTheme}
            aria-label="Toggle light/dark mode"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`} />
          </button>

          <a
            href="https://github.com/1998code/xcstrings-online"
            target="_blank"
            rel="noopener noreferrer"
            className={iconBtn}
            aria-label="GitHub repository"
            title="GitHub repository"
          >
            <i className="fa-brands fa-github" />
          </a>
        </div>
      </header>

      {/* Content */}
      <div className="flex w-full max-w-7xl flex-col items-start gap-6 lg:flex-row">
        {/* Languages List */}
        <aside className={`${card} w-full shrink-0 p-3 lg:sticky lg:top-24 lg:w-64`}>
          <div className="flex items-center justify-between px-2 py-1.5">
            <h2 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
              Languages
            </h2>
            <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
              {localeCodes.length}
            </span>
          </div>
          <ul className="mt-1 flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto lg:max-h-none">
            {localeCodes.map((lang) => {
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
        </aside>

        {/* Table with inline edit feature */}
        <section className={`${card} w-full overflow-hidden lg:flex-1`}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/[0.07] text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-gray-400">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    <i className="fa-solid fa-key mr-2 text-gray-400" />
                    Key
                  </th>
                  <th className="min-w-[22vw] whitespace-nowrap px-4 py-3 font-semibold">
                    <i className="fa-solid fa-language mr-2 text-gray-400" />
                    {selectedLangName}
                    <span className="ml-1.5 font-normal normal-case text-gray-400">
                      {selectedLanguage}
                    </span>
                  </th>
                  <th className="min-w-[18vw] whitespace-nowrap px-4 py-3 font-semibold">
                    <i className="fa-solid fa-comment-dots mr-2 text-gray-400" />
                    Comment
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    <i className="fa-solid fa-circle-check mr-2 text-gray-400" />
                    State
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                {Object.keys(data.strings).map((key) => {
                  const isDone =
                    data.strings[key].localizations[selectedLanguage]?.stringUnit
                      .state === "translated";
                  return (
                    <tr
                      key={key}
                      className="transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                        {key}
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          value={
                            data.strings[key].localizations[selectedLanguage]
                              ?.stringUnit.value
                          }
                          onChange={(e) => {
                            const newData = { ...data };
                            newData.strings[key].localizations[
                              selectedLanguage
                            ].stringUnit.value = e.target.value;
                            setData(newData);
                          }}
                          placeholder="Add translation…"
                          className="w-full rounded-md bg-transparent px-1.5 py-1 text-gray-900 transition-colors focus:bg-black/[0.04] focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:text-white dark:placeholder-gray-600 dark:focus:bg-white/[0.06]"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <textarea
                          rows={1}
                          value={data.strings[key].comment || ""}
                          onChange={(e) => {
                            const newData = { ...data };
                            newData.strings[key].comment = e.target.value;
                            setData(newData);
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
