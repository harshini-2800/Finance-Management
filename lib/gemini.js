const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Call Gemini 1.5 Flash via standard fetch with timeout and strict error boundaries.
 * If GEMINI_API_KEY is not set or request fails, falls back immediately to safe rule-based logic.
 */
export async function callGemini({ prompt, systemInstruction = "", responseSchema = null }) {
  if (!GEMINI_API_KEY) {
    return { success: false, reason: "NO_API_KEY", data: null };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1200,
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  if (responseSchema) {
    payload.generationConfig.responseMimeType = "application/json";
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.warn("Gemini API error status:", res.status, errText);
      return { success: false, reason: `HTTP_${res.status}`, data: null };
    }

    const json = await res.json();
    const textOutput = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) {
      return { success: false, reason: "EMPTY_OUTPUT", data: null };
    }

    if (responseSchema) {
      try {
        const parsed = JSON.parse(textOutput);
        return { success: true, data: parsed, raw: textOutput };
      } catch (parseErr) {
        // Strip markdown backticks if returned despite json mode
        const cleaned = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return { success: true, data: parsed, raw: textOutput };
      }
    }

    return { success: true, data: textOutput };
  } catch (err) {
    console.warn("Gemini fetch error, using rule-based fallback:", err.message);
    return { success: false, reason: err.message, data: null };
  }
}

/**
 * Fallback parser for "Talk-to-Add" smart transaction inputs
 */
export function ruleBasedTransactionParser(text) {
  const lower = text.toLowerCase();

  let type = "expense";
  if (lower.includes("salary") || lower.includes("earned") || lower.includes("received") || lower.includes("dividend") || lower.includes("sold") || lower.includes("income")) {
    type = "income";
  }

  // Extract amount with currency symbols or bare numbers
  const amountMatch = text.match(/(?:(?:rs\.?|inr|\$|€|£)\s*)?(\d+(?:,\d+)*(?:\.\d+)?)/i);
  let amount = 0;
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ""));
  }

  // Categories
  let category = "Miscellaneous";
  if (lower.includes("coffee") || lower.includes("starbucks") || lower.includes("dinner") || lower.includes("lunch") || lower.includes("food") || lower.includes("restaurant") || lower.includes("burger") || lower.includes("zomato") || lower.includes("swiggy")) {
    category = "Dining";
  } else if (lower.includes("grocery") || lower.includes("milk") || lower.includes("supermarket") || lower.includes("vegetables") || lower.includes("fruits")) {
    category = "Groceries";
  } else if (lower.includes("rent") || lower.includes("apartment") || lower.includes("flat") || lower.includes("housing")) {
    category = "Housing";
  } else if (lower.includes("uber") || lower.includes("ola") || lower.includes("metro") || lower.includes("fuel") || lower.includes("petrol") || lower.includes("cab") || lower.includes("flight") || lower.includes("train")) {
    category = "Transport";
  } else if (lower.includes("netflix") || lower.includes("spotify") || lower.includes("subscription") || lower.includes("cloud") || lower.includes("gym") || lower.includes("prime")) {
    category = "Subscriptions";
  } else if (lower.includes("shirt") || lower.includes("shoes") || lower.includes("amazon") || lower.includes("flipkart") || lower.includes("headphones") || lower.includes("laptop")) {
    category = "Shopping";
  } else if (lower.includes("salary") || lower.includes("bonus") || lower.includes("paycheck")) {
    category = "Salary";
  } else if (lower.includes("electricity") || lower.includes("wifi") || lower.includes("internet") || lower.includes("bill") || lower.includes("water")) {
    category = "Utilities";
  }

  // Clean description
  let description = text.trim();
  if (description.length > 50) {
    description = description.slice(0, 50);
  }

  return {
    type,
    amount: amount || 250,
    category,
    description: description || "Smart Add Entry",
    source: "ai",
    isRecurring: lower.includes("monthly") || lower.includes("recurring") || lower.includes("every month"),
  };
}

