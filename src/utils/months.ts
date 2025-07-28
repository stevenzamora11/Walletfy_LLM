import type { EventType } from "@/types/event";
import type { MonthType } from "@/types/month";
import dayjs from "dayjs";

export function groupEventsByMonth (events: EventType[], balanceInitial: number): MonthType[] {
    // Agrupar eventos por mes y año
    const grouped: Record<string, EventType[]> = {};

    events.forEach(event => {
        const key = dayjs(event.date).format("YYYY-MM");
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(event); // Agrupa los eventos en el mes correspondiente
    });

    // Convertir la agrupación a un arreglo de MonthType
    const result: MonthType[] = [];
    let previousGlobal = balanceInitial;

    for (const key of Object.keys(grouped).sort((a, b) => b.localeCompare(a))) {
        const [year, monthStr] = key.split("-");
        const month = parseInt(monthStr, 10);
        const yearNum = parseInt(year, 10);
        const events = grouped[key]; // Obtiene los eventos de ese mes

        // Ordenar eventos dentro del mes (más recientes primero)
        events.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

        //Calcular los flujos financieros del mes
        const income = events.filter(e => e.type === "ingreso").reduce((sum, e) => sum + e.amount, 0);
        const expense = events.filter(e => e.type === "egreso").reduce((sum, e) => sum + e.amount, 0);
        const monthly = income - expense;
        const global = previousGlobal + monthly;

        // Construir el objeto MonthType
        result.push({
            name: dayjs(`${year}-${monthStr}-01`).format("MMMM"),
            month,
            year: yearNum,
            events,
            flow: { income, expense, monthly, global },
        });

        previousGlobal = global; // Actualiza el acumulado para el siguiente mes
    };

    return result;
};
