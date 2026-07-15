import ZAI from "z-ai-web-dev-sdk"

let _zai: Awaited<ReturnType<typeof ZAI.create>> | null = null

export async function getAI() {
  if (!_zai) {
    _zai = await ZAI.create()
  }
  return _zai
}

export async function chat(messages: { role: "system" | "user" | "assistant"; content: string }[]) {
  const zai = await getAI()
  const completion = await zai.chat.completions.create({
    messages: messages.map((m) => ({ role: m.role === "system" ? "assistant" : m.role, content: m.content })),
    thinking: { type: "disabled" },
  })
  return completion.choices[0]?.message?.content ?? ""
}

/**
 * Chat that enforces a JSON object response.
 */
export async function chatJSON(messages: { role: "system" | "user" | "assistant"; content: string }[]) {
  const raw = await chat(messages)
  // strip code fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    // try to extract first {...} block
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        /* fall through */
      }
    }
    return null
  }
}
