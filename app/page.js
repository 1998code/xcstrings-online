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

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-between gap-8 p-[3vh]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag-and-drop overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
          <div className="rounded-2xl border-2 border-dashed border-white/70 bg-white/10 px-10 py-8 text-center text-white shadow-xl">
            <div className="text-4xl">📥</div>
            <p className="mt-2 text-lg font-semibold">Drop your .xcstrings file</p>
          </div>
        </div>
      )}
      <div className="z-10 max-w-7xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex-1 flex w-full justify-between items-center gap-3 border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:bg-gray-200 dark:bg-transparent lg:p-4">
          {/* Reset Button */}
          <button
            className="bg-white border border-gray-300/25 rounded-lg p-2 shadow-md dark:bg-gray-900/50 dark:hover:bg-gray-900"
            onClick={resetData}
          >
            Reset
          </button>

          {/* Upload Button */}
          <button
            className="bg-white border border-gray-300/25 rounded-lg p-2 shadow-md dark:bg-gray-900/50 dark:hover:bg-gray-900"
            onClick={importData}
          >
            Upload
          </button>

          {/* Translate All Button */}
          <button
            className="bg-white border border-gray-300/25 rounded-lg p-2 shadow-md dark:bg-gray-900/50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={translateAll}
            disabled={isTranslating}
            title={`Translate all keys into ${languages.find((l) => l.code === selectedLanguage)?.name || selectedLanguage}`}
          >
            {isTranslating ? "Translating…" : "✨ Translate"}
          </button>

          <span className="flex-1 text-center">
            <code className="font-mono font-bold">XCStrings</code> Online
          </span>

          {/* Download Button */}
          <button
            className="bg-white border border-gray-300/25 rounded-lg p-2 shadow-md dark:bg-gray-900/50 dark:hover:bg-gray-900"
            onClick={exportData}
          >
            Download
          </button>

          {/* Theme Toggle */}
          <button
            className="bg-white border border-gray-300/25 rounded-lg p-2 shadow-md dark:bg-gray-900/50 dark:hover:bg-gray-900"
            onClick={toggleTheme}
            aria-label="Toggle light/dark mode"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Github Link */}
          <a
            href="https://github.com/1998code/xcstrings-online"
            target="_blank"
            className="flex items-center gap-2 border border-gray-300/25 rounded-lg p-2 shadow-md dark:bg-gray-900/50 dark:hover:bg-gray-900"
          >
            GitHub Repo
          </a>
        </p>
      </div>

      <div className="relative flex gap-6 place-items-start">
        {/* Languages List */}
        <div className="sticky top-0 flex flex-col gap-2 p-4 bg-white rounded-xl shadow-md dark:bg-gray-900/50">
          <h2 className="text-lg font-bold">Languages</h2>
          <ul className="flex flex-col gap-2">
            {Object.keys(data.strings[Object.keys(data.strings)[0]].localizations).map((lang) => (
              <li key={lang}
                className={`flex justify-between gap-6 cursor-pointer whitespace-nowrap ${selectedLanguage === lang ? "opacity-100" : "opacity-50"} transition-all`}
                onClick={() => setSelectedLanguage(lang)}>
                <span>{languages.find((l) => l.code === lang)?.name}</span>
                <span className="text-gray-500">{lang}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Table with inline edit feature */}
        <div className="bg-white rounded-xl shadow-md dark:bg-gray-900/50 p-3 max-w-[80vw] overflow-auto">
          <table className="w-full">
            <thead className="border-b border-gray-300 dark:border-gray-700">
              <tr className="whitespace-nowrap divide-x divide-gray-300 dark:divide-gray-700">
                <th className="text-left p-2">Key</th>
                <th className="text-left p-2 min-w-[25vw]">
                  {languages.find((l) => l.code === selectedLanguage)?.name} <sup><small class="text-gray-500">{selectedLanguage}</small></sup>
                </th>
                <th className="text-left p-2 min-w-[20vw]">💬 Comment</th>
                <th className="text-left p-2">🤔 State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
              {Object.keys(data.strings).map((key) => (
                <tr key={key} className="whitespace-nowrap divide-x divide-gray-300 dark:divide-gray-700">
                  <td className="p-2">{key}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={data.strings[key].localizations[selectedLanguage]?.stringUnit.value}
                      onChange={(e) => {
                        const newData = { ...data };
                        newData.strings[key].localizations[selectedLanguage].stringUnit.value = e.target.value;
                        setData(newData);
                      }}
                      placeholder="Input here..."
                      className="w-full text-gray-900 dark:text-white bg-transparent cursor-auto focus:ring-0 focus:outline-none placeholder-gray-400 dark:placeholder-gray-700"
                    />
                  </td>
                  <td className="p-2">
                    <textarea
                      value={data.strings[key].comment}
                      onChange={(e) => {
                        const newData = { ...data };
                        newData.strings[key].comment = e.target.value;
                        setData(newData);
                      }}
                      placeholder="Input here..."
                      className="w-full text-gray-600 dark:text-gray-400 bg-transparent cursor-auto focus:ring-0 focus:outline-none placeholder-gray-400 dark:placeholder-gray-700"
                    />
                  </td>
                  <td className="p-2">
                    {data.strings[key].localizations[selectedLanguage]?.stringUnit.state === "translated" ? "✅ Done" : "👷 NEW"} 
                    {/* {data.strings[key].localizations[selectedLanguage]?.stringUnit.state.charAt(0).toUpperCase() + data.strings[key].localizations[selectedLanguage]?.stringUnit.state.slice(1)} */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer>

      </footer>
    </main>
  );
}
