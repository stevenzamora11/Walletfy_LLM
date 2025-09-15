
export interface InferenceOpts {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
}

export interface InferenceResult {
    text: string;
}

export abstract class LLMBaseManager {
    protected modelName: string;
    protected model: unknown | null = null;

    constructor(modelName: string) {
        this.modelName = modelName;
    }

    abstract loadModel(onProgress?: (msg: string) => void): Promise<void>;
    abstract unloadModel(): Promise<void>;
    abstract infer(prompt: string, opts?: InferenceOpts): Promise<InferenceResult>;
    abstract stream(prompt: string, opts?: InferenceOpts): AsyncIterable<string>;

    protected ensureLoaded() {
        if (!this.model) throw new Error('Modelo no cargado aún');
    }
}
