"use client";

import { useState } from "react";

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

  function importData() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xcstrings";
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setData(JSON.parse(e.target.result));
      };
      reader.readAsText(file);
    });
    fileInput.click();
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
    <main className="flex min-h-screen flex-col items-center justify-between gap-8 p-[3vh]">
      <div className="z-10 max-w-7xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex-1 flex w-full justify-between items-center gap-3 border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:bg-gray-200 dark:bg-transparent lg:p-4">
          {/* Reset Button */}
          <button
            className="bg-white border border-gray-300/25 rounded-lg p-2 shadow-md dark:bg-gray-900/50 dark:hover:bg-gray-900"
            onClick={() => { setData(sampleData); alert("Data has been reset.") }}
          >
            Reset
          </button>

          {/* Import Button */}
          <button
            className="bg-white border border-gray-300/25 rounded-lg p-2 shadow-md dark:bg-gray-900/50 dark:hover:bg-gray-900"
            onClick={importData}
          >
            Import
          </button>

          <span class="flex-1 text-center">
            <code className="font-mono font-bold">XCStrings</code> Online
          </span>

          {/* Export Button */}
          <button
            className="bg-white border border-gray-300/25 rounded-lg p-2 shadow-md dark:bg-gray-900/50 dark:hover:bg-gray-900"
            onClick={exportData}
          >
            Export
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

      <div className="relative flex gap-6 place-items-start before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[480px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
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
            <thead className="border-b border-gray-700">
              <tr className="whitespace-nowrap divide-x divide-gray-700">
                <th className="text-left p-2">Key</th>
                <th className="text-left p-2 min-w-[25vw]">
                  {languages.find((l) => l.code === selectedLanguage)?.name} <sup><small class="text-gray-500">{selectedLanguage}</small></sup>
                </th>
                <th className="text-left p-2 min-w-[20vw]">💬 Comment</th>
                <th className="text-left p-2">🤔 State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {Object.keys(data.strings).map((key) => (
                <tr key={key} className="whitespace-nowrap divide-x divide-gray-700">
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
                      className="w-full text-white bg-transparent cursor-auto focus:ring-0 focus:outline-none placeholder-gray-800 hover:placeholder-gray-700"
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
                      className="w-full text-gray-400 bg-transparent cursor-auto focus:ring-0 focus:outline-none placeholder-gray-800 hover:placeholder-gray-700"
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
