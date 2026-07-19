import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function chat(messages: { role: "system" | "user" | "assistant"; content: string }[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
  })
  return completion.choices[0]?.message?.content ?? ""
}

export async function chatJSON(messages: { role: "system" | "user" | "assistant"; content: string }[]) {
  const raw = await chat(messages)
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch {
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
