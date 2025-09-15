
import {
    CreateMLCEngine,
    type MLCEngine,
    type ChatCompletionMessageParam,
} from '@mlc-ai/web-llm';
import { LLMBaseManager, type InferenceOpts, type InferenceResult } from './LLMBaseManager';

export class LLMWebLLMManager extends LLMBaseManager {
    private engine: MLCEngine | null = null;

    // Modelo por defecto se puede cambiar por otro listado en https://mlc.ai/models
    constructor(modelName = 'Llama-3-8B-Instruct-q4f32_1-MLC') {
        super(modelName);
    }

    async loadModel(onProgress?: (msg: string) => void) {
        if (this.engine) return;
        const initProgress = (pr: any) => onProgress?.(pr?.text ?? 'cargando...');
        this.engine = await CreateMLCEngine(this.modelName, {
            initProgressCallback: initProgress,
        });
        this.model = this.engine;
    }

    async unloadModel() {
        if (!this.engine) return;
        await this.engine.unload();
        this.engine = null;
        this.model = null;
    }

    async infer(prompt: string, opts?: InferenceOpts): Promise<InferenceResult> {
        this.ensureLoaded();
        const engine = this.engine!;
        const messages: ChatCompletionMessageParam[] = [
            { role: 'user', content: prompt },
        ];
        const resp = await engine.chat.completions.create({
            messages,
            temperature: opts?.temperature ?? 0.7,
            top_p: opts?.top_p ?? 0.9,
            max_tokens: opts?.max_tokens ?? 800,
        });
        const text = resp.choices?.[0]?.message?.content ?? '';
        return { text };
    }

    async *stream(prompt: string, opts?: InferenceOpts): AsyncIterable<string> {
        this.ensureLoaded();
        const engine = this.engine!;
        const messages: ChatCompletionMessageParam[] = [
            { role: 'user', content: prompt },
        ];
        const iter = await engine.chat.completions.create({
            messages,
            temperature: opts?.temperature ?? 0.7,
            top_p: opts?.top_p ?? 0.9,
            max_tokens: opts?.max_tokens ?? 800,
            stream: true,
        });
        for await (const chunk of iter) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) yield content;
        }
    }
}
