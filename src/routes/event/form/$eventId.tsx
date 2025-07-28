import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import { useWalletStore } from '@/stores/walletStore';
import { EventForm } from '@/components/EventForm';
import type { EventFormType } from '@/types/event';

import dayjs from 'dayjs';

// Ruta para edición
export const Route = createFileRoute('/event/form/$eventId')({
    component: EditEventPage,
});

function EditEventPage() {
    const navigate = useNavigate();
    const { eventId } = useParams({ from: Route.id });

    const { events, updateEvent } = useWalletStore();

    // Buscar evento a editar
    const event = events.find((e) => e.id === eventId);

    // Si no se encuentra muestra un mensaje simple
    if (!event) {
        return <div>Evento no encontrado</div>;
    }

    // Adaptar el evento a formato EventFormType
    const initialValues: EventFormType = {
        name: event.name,
        description: event.description,
        amount: event.amount,
        date: event.date, // sigue siendo string
        type: event.type,
    };

    // Función para actualizar
    const handleUpdate = (data: EventFormType) => {
        const formatted = {
            ...data,
            date: dayjs(data.date).toISOString(), // convertir a ISO string
        };

        updateEvent(eventId, formatted);
        navigate({ to: '/' });
    };

    return (
        <EventForm
            title="Editar Evento"
            onSubmit={handleUpdate}
            submitLabel="Actualizar"
            initialValues={initialValues}
        />
    );
}
