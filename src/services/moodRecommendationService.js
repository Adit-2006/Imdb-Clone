// moodRecommendationService.js
// Frontend -> LLM call (Gemini) with strong JSON prompting, validation, and mock fallback.

const MOCK_RECOMMENDATIONS = {
  mood: "Relaxed",
  recommendations: [
    {
      title: "The Secret Life of Walter Mitty",
      year: 2013,
      genre: "Adventure / Drama / Feel-Good",
      reason:
        "Its gentle pacing and uplifting tone feel like a warm exhale, making it easy to settle into.",
    },
    {
      title: "Chef",
      year: 2014,
      genre: "Comedy / Drama",
      reason:
        "Cozy, food-centered storytelling with heart and humor delivers a calm, comforting vibe.",
    },
    {
      title: "Little Miss Sunshine",
      year: 2006,
      genre: "Comedy / Drama",
      reason:
        "Low-stakes road-trip energy and heartfelt moments create a reassuring, light atmosphere.",
    },
    {
      title: "A Man Called Otto",
      year: 2022,
      genre: "Comedy / Drama",
      reason:
        "Thoughtful and soothing with a hopeful arc that matches a relaxed, reflective mood.",
    },
    {
      title: "The Intern",
      year: 2015,
      genre: "Comedy / Drama",
      reason:
        "Low-pressure workplace warmth and gentle humor make it an easy, comforting watch.",
    },
    {
      title: "Paddington 2",
      year: 2017,
      genre: "Family / Comedy",
      reason:
        "Cozy charm and wholesome humor with minimal tension make it ideal for winding down.",
    },
  ],
};

/**
 * Sample Gemini response (shape may vary slightly depending on model/config):
 * {
 *   "candidates": [
 *     {
 *       "content": {
 *         "parts": [
 *           { "text": "{ \"mood\": \"Relaxed\", \"recommendations\": [ ... ] }" }
 *         ]
 *       }
 *     }
 *   ]
 * }
 */

function slugify(input) {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractGeminiText(responseJson) {
  // Gemini REST usually returns candidates[0].content.parts[0].text
  const text =
    responseJson?.candidates?.[0]?.content?.parts?.[0]?.text ??
    responseJson?.contents?.[0]?.parts?.[0]?.text;

  return typeof text === "string" ? text : null;
}

function tryParseJson(rawText) {
  if (!rawText) return null;

  const repairJsonLikeString = (s) => {
    if (typeof s !== "string") return s;
    let out = s;

    // Remove trailing commas before } or ]
    out = out.replace(/,\s*([}\]])/g, "$1");

    // If Gemini used smart quotes (rare), convert to normal quotes.
    out = out.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

    return out;
  };

  // 1) Direct parse
  try {
    return JSON.parse(repairJsonLikeString(rawText));
  } catch {
    // continue
  }

  // 2) Strip common markdown fences
  const withoutFences = rawText
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();
  try {
    return JSON.parse(repairJsonLikeString(withoutFences));
  } catch {
    // continue
  }

  // 3) Extract first { ... last } block
  const firstBrace = withoutFences.indexOf("{");
  const lastBrace = withoutFences.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = withoutFences.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(repairJsonLikeString(candidate));
    } catch {
      return null;
    }
  }

  return null;
}

function normalizeAndValidateResponse({ selectedMood, parsed }) {
  const recs = parsed?.recommendations;
  if (!Array.isArray(recs)) {
    return { ok: false, error: "Model returned missing/invalid recommendations." };
  }

  const valid = [];

  for (const rec of recs) {
    const title = rec?.title;
    const year = rec?.year;
    const genre = rec?.genre;
    const reason = rec?.reason;

    if (!title || year == null || !genre || !reason) continue;

    valid.push({
      title: String(title).trim(),
      year: Number(year),
      genre: String(genre).trim(),
      reason: String(reason).trim(),
      rating: rec?.rating != null ? Number(rec.rating) : undefined,
    });
  }

  // Prefer deduping by (title + year), but if we can't reach 6, fill from the raw valid list.
  const seen = new Set();
  const deduped = [];
  for (const v of valid) {
    const key = `${v.title.toLowerCase().trim()}-${String(v.year)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(v);
  }

  const final = deduped.length >= 6 ? deduped.slice(0, 6) : valid.slice(0, 6);

  if (final.length !== 6) {
    return {
      ok: false,
      error: `Model returned ${final.length} valid recommendations, expected exactly 6.`,
    };
  }

  return {
    ok: true,
    data: {
      mood: String(selectedMood),
      recommendations: final.map((rec, idx) => ({
        id: `${slugify(rec.title)}-${rec.year}-${idx}`,
        ...rec,
      })),
    },
  };
}

function buildGeminiPrompt(selectedMood) {
  return `You are an expert movie recommendation assistant. The user has selected the mood: "${selectedMood}".

Recommend exactly 6 movies that best fit this mood. Base your suggestions on emotional tone, pacing, atmosphere, viewer intent, and thematic fit.

Important requirements:
- Return ONLY valid JSON. Do not include markdown, commentary, or any text outside the JSON.
- Ensure the 6 movies are meaningfully varied in genre/story when appropriate (avoid very similar picks).
- Recommendations must match the emotional tone of the selected mood (not just popular movies).

Return the JSON in this exact format:
{
  "mood": "${selectedMood}",
  "recommendations": [
    {
      "title": "Movie Title",
      "year": 2020,
      "genre": "Drama/Comedy",
      "reason": "Why this movie matches the selected mood"
    }
  ]
}

Each "reason" must be 2-3 sentences (or a concise explanation) describing why it fits the mood.`;
}

async function recommendMoviesByMoodGemini({ mood, signal }) {
  // IMPORTANT: Direct-from-frontend calls expose API keys to users.
  // For production, proxy this via your backend.
  // This implementation supports an env var for development/learning.
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY ?? "").trim();

  if (!apiKey) {
    // Mock fallback if Gemini is not configured.
    const rawEnv = import.meta.env.VITE_GEMINI_API_KEY;
    const envStatus =
      rawEnv == null
        ? "undefined"
        : typeof rawEnv === "string"
          ? `defined (length ${rawEnv.length})`
          : "defined (non-string)";

    return {
      source: "mock",
      mockReason:
        `Gemini API key is missing/blank in the browser bundle (${envStatus}). Set \`VITE_GEMINI_API_KEY\` in your \`.env\` and restart the dev server (env values are loaded at startup).`,
      mood,
      recommendations: MOCK_RECOMMENDATIONS.recommendations.map((rec, idx) => ({
        id: `mock-${mood}-${slugify(rec.title)}-${rec.year}-${idx}`,
        ...rec,
        rating: rec.rating != null ? Number(rec.rating) : undefined,
      })),
    };
  }

  const preferredApiVersion =
    import.meta.env.VITE_GEMINI_API_VERSION ?? "v1beta";
  // Use a "-latest" model by default because exact model availability varies.
  const preferredModel =
    import.meta.env.VITE_GEMINI_MODEL ?? "gemini-1.5-flash-latest";

  const versionCandidates =
    preferredApiVersion === "v1beta"
      ? ["v1beta", "v1"]
      : [preferredApiVersion, "v1beta"];

  const modelCandidates = Array.from(
    new Set([
      preferredModel,
      preferredModel.replace(/-latest$/i, ""),
      "gemini-1.5-pro-latest",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.0-pro",
    ])
  ).filter(Boolean);

  function buildEndpoint(apiVersion, model) {
    return `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;
  }

  const prompt = buildGeminiPrompt(mood);

  let lastError = null;

  for (const apiVersion of versionCandidates) {
    for (const model of modelCandidates) {
      const endpoint = buildEndpoint(apiVersion, model);

      let res;
      try {
        res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
          signal,
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
            },
          }),
        });
      } catch (err) {
        if (err?.name === "AbortError") {
          throw new Error(
            "Gemini request timed out. Try again (and ensure network access is allowed)."
          );
        }
        // Network/CORS errors should not be retried across models.
        throw new Error(
          `Network/Gemini fetch failed. This can be caused by CORS restrictions or connectivity issues. ${String(
            err?.message || err
          )}`
        );
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => "");

        // Best-effort extraction for common permission/activation issues.
        let activationUrl = null;
        try {
          const parsedMsg = JSON.parse(msg);
          activationUrl =
            parsedMsg?.error?.details?.find(
              (d) => d?.reason === "SERVICE_DISABLED"
            )?.metadata?.activationUrl ?? null;
        } catch {
          // ignore JSON parse failures
        }

        if (res.status === 403) {
          throw new Error(
            `Gemini request forbidden (403). The Generative Language API may be disabled for your Google Cloud project. Enable it and retry${
              activationUrl ? `: ${activationUrl}` : "."
            }`
          );
        }

        if (res.status === 404) {
          // Try next model/version.
          lastError = new Error(
            `Gemini model not found for endpoint ${apiVersion}/${model} (404). ${msg}`.trim()
          );
          continue;
        }

        throw new Error(
          `Gemini request failed (${res.status} ${res.statusText}). ${msg}`.trim()
        );
      }

      const json = await res.json();
      const rawText = extractGeminiText(json);
      if (!rawText) {
        throw new Error("Gemini response did not contain model text.");
      }

      const parsed = tryParseJson(rawText);
      if (!parsed) {
        throw new Error("Gemini response was not valid JSON.");
      }

      const validated = normalizeAndValidateResponse({
        selectedMood: mood,
        parsed,
      });
      if (!validated.ok) {
        throw new Error(validated.error);
      }

      return {
        source: "gemini",
        ...validated.data,
      };
    }
  }

  // If we get here, all model/version attempts failed with 404.
  throw lastError ?? new Error("Gemini request failed (model not available).");
}

/**
 * Public API:
 * - Returns normalized data: { mood, recommendations: [ { id,title,year,genre,reason,rating? } ] }
 */
export async function getMoodMovieRecommendations({
  mood,
  provider = "gemini",
  timeoutMs = 25000,
  signal,
}) {
  if (!mood || typeof mood !== "string") {
    throw new Error("Mood is required.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (signal) {
      if (signal.aborted) controller.abort();
      signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    if (provider === "gemini") {
      const result = await recommendMoviesByMoodGemini({
        mood,
        signal: controller.signal,
      });
      return result;
    }

    // Provider extension point.
    throw new Error(`Unsupported provider: ${provider}`);
  } finally {
    clearTimeout(timeoutId);
    // No cleanup needed for controller in this pattern.
  }
}

