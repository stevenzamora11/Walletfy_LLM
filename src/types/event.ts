import { z } from "zod";
import dayjs from "dayjs";

// Esquema para el tipo enum ingreso o egreso
export const OptionSchema = z.enum(["ingreso", "egreso"]);
export type OptionType = z.infer<typeof OptionSchema>;

// Esquema para el evento
export const EventSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "El nombre es obligatorio").max(20,"Máximo 20 caracteres"),
    description: z.string().max(100, "Máximo 100 caracteres").optional(),
    amount: z.number().positive("Debe ser un valor positivo"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {message: "Fecha inválida"}),
    type: OptionSchema,
});

export type EventType = z.infer<typeof EventSchema>;

// Esquema para el formulario sin ID
export const EventFormSchema = EventSchema.omit({id: true});
export type EventFormType = z.infer<typeof EventFormSchema>;

// Funciones auxiliares
// Para saber si un evento es ingreso
export const isIncome = (event: EventType) => event.type === "ingreso";

// Para saber si un evento es egreso
export const isExpense = (event: EventType) => event.type === "egreso";

// Formatear la fecha en formato DD/MM/YYYY
export const formatEventDate = (date: string) => dayjs(date).format("DD/MM/YYYY");
