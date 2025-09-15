
import { LLMBaseManager, type InferenceOpts, type InferenceResult } from './LLMBaseManager'

export class LLMOpenAIHttpManager extends LLMBaseManager {
    private apiKey: string
    private baseURL: string

    constructor(modelName: string, apiKey: string, baseURL = 'https://api.openai.com/v1') {
        super(modelName)
        this.apiKey = apiKey
        this.baseURL = baseURL.replace(/\/+$/, '')
    }

    async loadModel() {
        if (!this.apiKey) throw new Error('Falta VITE_OPENAI_API_KEY')
        this.model = { ready: true }
    }
    async unloadModel() { this.model = null }

    async infer(prompt: string, opts?: InferenceOpts): Promise<InferenceResult> {
        if (!this.model) throw new Error('Cliente no inicializado')
        const res = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
            body: JSON.stringify({
                model: this.modelName,
                messages: [
                    { role: 'system', content: 'Eres un asistente experto en finanzas personales.' },
                    { role: 'user', content: prompt },
                ],
                temperature: opts?.temperature ?? 0.7,
                top_p: opts?.top_p ?? 0.9,
                max_tokens: opts?.max_tokens ?? 800,
            }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const text = json?.choices?.[0]?.message?.content ?? ''
        return { text }
    }

    async *stream(prompt: string, opts?: InferenceOpts): AsyncIterable<string> {
        if (!this.model) throw new Error('Cliente no inicializado')
        const res = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
            body: JSON.stringify({
                model: this.modelName,
                messages: [
                    { role: 'system', content: 'Eres un asistente experto en finanzas personales.' },
                    { role: 'user', content: prompt },
                ],
                temperature: opts?.temperature ?? 0.7,
                top_p: opts?.top_p ?? 0.9,
                max_tokens: opts?.max_tokens ?? 800,
                stream: true,
            }),
        })
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''
            for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed.startsWith('data:')) continue
                const data = trimmed.slice(5).trim()
                if (data === '[DONE]') return
                try {
                    const json = JSON.parse(data)
                    const delta = json?.choices?.[0]?.delta?.content
                    if (delta) yield delta
                } catch {}
            }
        }
    }
}
