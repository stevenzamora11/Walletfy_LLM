import { createFileRoute } from '@tanstack/react-router';
import { useWalletStore } from '@/stores/walletStore';
import { EventForm } from '@/components/EventForm';
import type { EventFormType } from '@/types/event';

// Ruta para creación
export const Route = createFileRoute('/event/form/form')({
    component: EventFormPage,
});

function EventFormPage() {
    const addEvent = useWalletStore((state) => state.addEvent);

    // Función para manejar el envío del formulario
    const handleCreate = (data: EventFormType) => {
        addEvent(data);
    };

    return (
        <EventForm
        title="Crear Evento"
        onSubmit={handleCreate}
        submitLabel="Guardar"
        />
    );
}
