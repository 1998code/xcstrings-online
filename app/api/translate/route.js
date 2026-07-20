// POST: /api/translate { "texts": ["Hello", "World"], "from": "en", "to": "zh-Hans" }
// Also accepts a single string: { "text": "Hello", "from": "en", "to": "zh-Hans" }

/**
 * Direct Google Translate API implementation
 * Uses translate.googleapis.com/translate_a/t endpoint, which accepts
 * multiple q parameters so a whole batch translates in one request.
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

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleTranslation({ texts, from, to }) {
  if (!texts.length || texts.some((t) => typeof t !== "string")) {
    return json({ error: "Text parameter is required" }, 400);
  }

  try {
    const sourceLang = from === "auto" ? "auto" : toGoogleLang(from);
    const targetLang = toGoogleLang(to);

    // Empty strings have nothing to translate and Google rejects empty q
    // params, so send only the non-empty items and echo the rest back.
    const nonEmptyIndices = texts
      .map((t, i) => (t ? i : -1))
      .filter((i) => i !== -1);

    let translated = [];
    if (nonEmptyIndices.length) {
      // One request per batch: repeated q params in a form-encoded POST body,
      // so large catalogs don't hit URL length limits.
      const body = new URLSearchParams();
      for (const i of nonEmptyIndices) {
        body.append("q", texts[i]);
      }

      const response = await fetch(
        `https://translate.googleapis.com/translate_a/t?client=gtx&sl=${sourceLang}&tl=${targetLang}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        }
      );

      if (!response.ok) {
        throw new Error(`Translation API returned ${response.status}`);
      }

      const data = await response.json();
      translated = Array.isArray(data) ? data : [];
      if (translated.length !== nonEmptyIndices.length) {
        throw new Error("Translation API returned an unexpected response");
      }
    }

    // With sl=auto each item is [translation, detectedLang]; with an explicit
    // source language each item is a plain string.
    const outputs = texts.slice();
    nonEmptyIndices.forEach((textIndex, i) => {
      const item = translated[i];
      const value = Array.isArray(item) ? item[0] : item;
      if (typeof value === "string" && value) outputs[textIndex] = value;
    });

    return json({
      inputs: texts,
      outputs,
      // Backward-compatible single-text fields
      input: texts[0],
      output: outputs[0],
      from,
      to,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return json({ error: "Translation failed", message: error.message }, 500);
  }
}

export async function GET(req) {
  const url = new URL(req.url);
  const text = url.searchParams.get("text");
  return handleTranslation({
    texts: text ? [text] : [],
    from: url.searchParams.get("from") || "auto",
    to: url.searchParams.get("to") || "en",
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const texts = Array.isArray(body?.texts)
      ? body.texts
      : body?.text
        ? [body.text]
        : [];
    return handleTranslation({
      texts,
      from: body?.from || "auto",
      to: body?.to || "en",
    });
  } catch (error) {
    return json({ error: "Invalid JSON body" }, 400);
  }
}
