
// src/routes/assistant.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {Button, Group, Paper, Select, Stack, Text, Textarea, Slider, ActionIcon, Tooltip, Switch } from '@mantine/core'
import { IconPlayerPlay, IconBolt, IconBoltOff, IconTrash, IconSend } from '@tabler/icons-react'
import { LLMWebLLMManager } from '@/managers/LLMWebLLMManager'
import { LLMBaseManager } from '@/managers/LLMBaseManager'
import { useWalletSnapshot } from '@/assistant/context-snapshot'

type Msg = { role: 'user' | 'assistant' | 'system'; content: string }

export const Route = createFileRoute('/assistant')({
    component: AssistantPage,
})

function AssistantPage() {
    // Estado del chat
    const [messages, setMessages] = useState<Msg[]>([
        {
        role: 'system',
        content:
            'Eres un asistente de finanzas personales para Walletfy. Usa únicamente el contexto provisto para responder preguntas sobre el balance, ingresos/egresos y eventos.',
        },
    ])
    const [input, setInput] = useState('')
    const [isLoadingModel, setIsLoadingModel] = useState(false)
    const [isModelReady, setIsModelReady] = useState(false)
    const [isStreaming, setIsStreaming] = useState(false)
    const [progress, setProgress] = useState<string>('')

    // Parámetros de generación
    const [temperature, setTemperature] = useState(0.7)
    const [topP, setTopP] = useState(0.9)
    const [useStreaming, setUseStreaming] = useState(true)

    // Disponibilidad y proveedor
    const webgpuAvailable = typeof navigator !== 'undefined' && 'gpu' in navigator
    const hasKey = !!import.meta.env.VITE_OPENAI_API_KEY
    const [provider, setProvider] = useState<'web' | 'api'>(!webgpuAvailable && hasKey ? 'api' : 'web')

    // Snapshot de Walletfy
    const snapshot = useWalletSnapshot()
    const contextJson = useMemo(() => JSON.stringify(snapshot), [snapshot])

    // Manager (modelo), tipo base
    const managerRef = useRef<LLMBaseManager | null>(null)

    // Cargar modelo automáticamente al entrar / al cambiar proveedor
    useEffect(() => {
        let cancelled = false
        ;(async () => {
            setIsLoadingModel(true)
            try {
                // Fallback temprano si usuario eligió 'web' pero no hay WebGPU
                if (provider === 'web' && !webgpuAvailable) {
                    if (hasKey) {
                        alert('WebGPU no está disponible. Cambiando a modo API.')
                        setProvider('api')
                    } else {
                        alert(
                        'WebGPU no está disponible y no hay VITE_OPENAI_API_KEY. Activa WebGPU en tu navegador o configura la API.'
                        )
                    }
                    setIsLoadingModel(false)
                    return
                }

                if (provider === 'web') {
                    const mgr = new LLMWebLLMManager()
                    managerRef.current = mgr
                    await mgr.loadModel((msg: any) => {
                        if (!cancelled) setProgress(String(msg ?? ''))
                    })
                } else {
                    const { LLMOpenAIHttpManager } = await import('@/managers/LLMOpenAIHttpManager')
                    const apiKey = (import.meta.env.VITE_OPENAI_API_KEY as string) || ''
                    const baseURL = (import.meta.env.VITE_OPENAI_BASE_URL as string) || 'https://api.openai.com/v1'
                    const model = (import.meta.env.VITE_REMOTE_MODEL_NAME as string) || 'gpt-4o-mini'

                    if (!apiKey) {
                        alert('Falta VITE_OPENAI_API_KEY; vuelve a WebLLM o añade la clave.')
                        setProvider('web')
                        setIsLoadingModel(false)
                        return
                    }
                    const mgr = new LLMOpenAIHttpManager(model, apiKey, baseURL)
                    managerRef.current = mgr
                    await mgr.loadModel()
                }

                if (!cancelled) setIsModelReady(true)
            } catch (err: any) {
                console.error(err)
                alert('Error cargando modelo: ' + (err?.message ?? String(err)))
            } finally {
                if (!cancelled) setIsLoadingModel(false)
            }
        })()
        return () => {
            cancelled = true
            managerRef.current?.unloadModel().catch(() => {})
            managerRef.current = null
        }
    }, [provider, webgpuAvailable, hasKey])

    // Helpers UI
    const append = (m: Msg) => setMessages((prev) => [...prev, m])
    const clear = () => setMessages((prev) => prev.filter((m) => m.role === 'system'))

    // Prompt constructor: sistema + contexto + historial corto + mensaje del usuario
    function buildPrompt(userText: string) {
        const guidance = `Actúa como asesor financiero de Walletfy.
    Siempre basa tus respuestas en el CONTEXTO. Si el usuario pregunta algo fuera del contexto, dilo explícitamente y sugiere registrar eventos o revisar meses disponibles.
    Responde en español, de forma breve, clara y con números formateados (USD).`

        const shortHistory = messages.slice(-6).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')

        return [
            `SISTEMA:\n${guidance}`,
            `CONTEXTO:\n${contextJson}`,
            `HISTORIAL:\n${shortHistory}`,
            `USUARIO:\n${userText}`,
            `AYUDANTE:`,
        ].join('\n\n')
    }

    async function handleSend(full = true) {
        if (!managerRef.current || !isModelReady) return
        const text = input.trim()
        if (!text) return

        append({ role: 'user', content: text })
        setInput('')

        const prompt = buildPrompt(text)

        try {
            if (full) {
                const { text } = await managerRef.current.infer(prompt, {
                    temperature,
                    top_p: topP,
                    max_tokens: 800,
                })
                append({ role: 'assistant', content: text })
            } else {
                setIsStreaming(true)
                let acc = ''
                for await (const chunk of managerRef.current.stream(prompt, { temperature, top_p: topP, max_tokens: 800 })) {
                    acc += chunk
                    setMessages((prev) => {
                        const copy = [...prev]
                        if (copy[copy.length - 1]?.role === 'assistant') {
                            copy[copy.length - 1] = { role: 'assistant', content: acc }
                        } else {
                            copy.push({ role: 'assistant', content: acc })
                        }
                        return copy
                    })
                }
            }
        } catch (err: any) {
            console.error(err)
            append({ role: 'assistant', content: 'Ocurrió un error procesando tu solicitud.' })
        } finally {
            setIsStreaming(false)
        }
    }

    return (
        <Stack gap="lg">
            {/* Barra superior */}
            <Paper withBorder p="md" radius="md">
                <Stack gap="xs">
                    <Group justify="space-between" wrap="wrap">
                        <Group>
                            <Text fw={600}>Proveedor:</Text>
                            <Select
                                value={provider}
                                onChange={(v) => setProvider((v as 'web' | 'api') ?? 'web')}
                                data={[
                                    ...(webgpuAvailable ? [{ value: 'web', label: 'WebLLM (en navegador)' }] : []),
                                    ...(hasKey ? [{ value: 'api', label: 'API compatible (OpenAI/LM Studio/Ollama)' }] : []),
                                ]}
                                allowDeselect={false}
                                w={320}
                            />
                        </Group>

                        <Group>
                            <Tooltip label="Cargar modelo">
                                <Button
                                    onClick={async () => {
                                        if (!managerRef.current) return
                                        setIsLoadingModel(true)
                                        try {
                                            await managerRef.current.loadModel((msg: any) => setProgress(String(msg ?? '')))
                                            setIsModelReady(true)
                                        } finally {
                                            setIsLoadingModel(false)
                                        }
                                    }}
                                    leftSection={<IconBolt size={16} />}
                                    disabled={isLoadingModel || isModelReady}
                                >
                                    {isLoadingModel ? 'Cargando…' : 'Cargar modelo'}
                                </Button>
                            </Tooltip>

                            <Tooltip label="Liberar modelo">
                                <Button
                                    color="red"
                                    onClick={async () => {
                                        if (!managerRef.current) return
                                        await managerRef.current.unloadModel()
                                        setIsModelReady(false)
                                    }}
                                    leftSection={<IconBoltOff size={16} />}
                                    disabled={!isModelReady || isLoadingModel}
                                >
                                    Liberar
                                </Button>
                            </Tooltip>

                            <Tooltip label="Limpiar chat (mantiene el mensaje de sistema)">
                                <ActionIcon variant="light" color="gray" onClick={clear} aria-label="Limpiar chat">
                                    <IconTrash size={18} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>

                    {(!webgpuAvailable && !hasKey) && (
                        <Text size="sm" c="red">
                            No hay WebGPU y no hay VITE_OPENAI_API_KEY. Activa WebGPU en tu navegador o configura una API key.
                        </Text>
                    )}

                    {isLoadingModel && <Text size="sm" c="dimmed">Progreso: {progress || 'preparando...'}</Text>}

                    <Group grow>
                        <Stack gap={4}>
                            <Text size="sm" c="dimmed">temperature: {temperature.toFixed(2)}</Text>
                            <Slider min={0} max={1} step={0.01} value={temperature} onChange={setTemperature} />
                        </Stack>
                        <Stack gap={4}>
                            <Text size="sm" c="dimmed">top_p: {topP.toFixed(2)}</Text>
                            <Slider min={0} max={1} step={0.01} value={topP} onChange={setTopP} />
                        </Stack>
                        <Stack gap={4} align="center">
                            <Text size="sm" c="dimmed">Streaming</Text>
                            <Switch checked={useStreaming} onChange={(e) => setUseStreaming(e.currentTarget.checked)} />
                        </Stack>
                    </Group>
                </Stack>
            </Paper>

            {/* Chat */}
            <Paper withBorder p="md" radius="md" className="min-h-[50vh]">
                <Stack gap="sm">
                    {messages.map((m, i) => (
                        <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                            <Text size="xs" c="dimmed">{m.role.toUpperCase()}</Text>
                            <Paper p="sm" radius="md" className={m.role === 'user' ? 'bg-violet-50 dark:bg-violet-900/30' : 'bg-gray-50 dark:bg-gray-800'}>
                                <Text>{m.content}</Text>
                            </Paper>
                        </div>
                    ))}
                    {(!isModelReady || isLoadingModel) && (
                        <Text size="sm" c="red">Modelo no listo aún. Cárgalo para poder enviar mensajes.</Text>
                    )}
                </Stack>
            </Paper>

            {/* Input */}
            <Group align="flex-end">
                <Textarea
                    placeholder="Escribe tu pregunta…"
                    value={input}
                    onChange={(e) => setInput(e.currentTarget.value)}
                    autosize
                    minRows={2}
                    className="flex-1"
                    disabled={!isModelReady || isLoadingModel || isStreaming}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            handleSend(false) // stream
                            e.preventDefault()
                        } else if (e.key === 'Enter' && !e.shiftKey) {
                            handleSend(true) // respuesta completa
                            e.preventDefault()
                        }
                    }}
                />
                <Group>
                    <Tooltip label="Stream (Ctrl/Cmd + Enter)">
                        <Button
                            variant="light"
                            onClick={() => handleSend(false)}
                            disabled={!isModelReady || isLoadingModel || !useStreaming || !input.trim()}
                            leftSection={<IconPlayerPlay size={16} />}
                        >
                            Stream
                        </Button>
                    </Tooltip>
                    <Tooltip label="Enviar (Enter)">
                        <Button
                            onClick={() => handleSend(true)}
                            disabled={!isModelReady || isLoadingModel || !input.trim()}
                            leftSection={<IconSend size={16} />}
                        >
                            Enviar
                        </Button>
                    </Tooltip>
                </Group>
            </Group>
        </Stack>
    )
}

export default AssistantPage
