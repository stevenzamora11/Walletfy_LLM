import { create } from "zustand";
import { persist } from "zustand/middleware";
import type{ EventFormType, EventType } from "@/types/event";
import type { MonthType } from "@/types/month";
import { groupEventsByMonth } from "@/utils/months";
import { v4 as uuidv4 } from "uuid";

// Estructura del estado global 
interface WalletStore {
    balanceInitial: number;
    events: EventType[];

    setBalanceInitial: (value: number) => void;
    addEvent: (event: EventFormType) => void;
    updateEvent: (id: string, data: Partial<EventFormType>) => void;
    deleteEvent: (id: string) => void;
    getMonthlySummary: () => MonthType[];
};

// Store Zustand con persistencia en localStorage
export const useWalletStore = create<WalletStore>()(
    persist(
        (set, get) => ({
            balanceInitial: 0, // Monto inicial por defecto
            events: [], // Lista de eventos
            
            // Setter del balance inicial
            setBalanceInitial: (value) => set({balanceInitial: value}),

            // Agrega un nuevo evento con ID generado
            addEvent: (event) => set((state) => ({
                events: [...state.events, {...event, id: uuidv4()}],
            })),

            // Actualiza un evento por su ID
            updateEvent: (id, data) => set((state) => ({
                events: state.events.map((e) => e.id === id ? {...e, ...data} : e),
            })),

            // Elimina un evento por su ID
            deleteEvent: (id) => set((state) => ({
                events: state.events.filter((e) => e.id !== id),
            })),

            // Agrupa los eventos por mes y calcula su flujo
            getMonthlySummary: () => {
                const { events, balanceInitial } = get();

                return groupEventsByMonth(events, balanceInitial);
            },
        }),

        {
            name: "wallet-store",
            version: 1,
        }
    )
);
