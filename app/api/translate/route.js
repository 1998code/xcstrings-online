// POST: /api/translate { "text": "Hello", "from": "en", "to": "zh" }

/**
 * Direct Google Translate API implementation
 * Uses translate.googleapis.com/translate_a/single endpoint
 * This is the same endpoint used by translate.google.com web interface
 */
export const runtime = "edge";

// Map Xcode String Catalog language codes to Google Translate format
const langMap = {
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-TW",
  "zh-HK": "zh-TW",
  "pt-BR": "pt",
  he: "iw",
  no: "no",
};

function toGoogleLang(code) {
  if (!code) return "auto";
  if (langMap[code]) return langMap[code];
  // Strip any region suffix Google doesn't recognise (e.g. "en-GB" -> "en")
  return code.split("-")[0];
}

function badRequest(message) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleTranslation({ text, from, to }) {
  if (!text) {
    return badRequest("Text parameter is required");
  }

  try {
    const sourceLang = from === "auto" ? "auto" : toGoogleLang(from);
    const targetLang = toGoogleLang(to);

    // Call Google Translate API directly
    const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&hl=${targetLang}&dt=t&dt=bd&dj=1&source=icon&q=${encodeURIComponent(
      text
    )}`;

    const response = await fetch(translateUrl);

    if (!response.ok) {
      throw new Error(`Translation API returned ${response.status}`);
    }

    const data = await response.json();

    // Extract translated text from response
    let translatedText = "";
    if (data.sentences && data.sentences.length > 0) {
      translatedText = data.sentences.map((s) => s.trans).join("");
    } else if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      translatedText = data[0].map((item) => item[0]).join("");
    }

    return new Response(
      JSON.stringify({
        input: text,
        output: translatedText || text,
        from: data.src || from,
        to
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({
        error: "Translation failed",
        message: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(req) {
  const url = new URL(req.url);
  return handleTranslation({
    text: url.searchParams.get("text"),
    from: url.searchParams.get("from") || "auto",
    to: url.searchParams.get("to") || "en",
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    return handleTranslation({
      text: body?.text,
      from: body?.from || "auto",
      to: body?.to || "en",
    });
  } catch (error) {
    return badRequest("Invalid JSON body");
  }
}
