import { useEffect } from 'react';
import { Box, Button, Select, Stack, TextInput, Tooltip } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useNavigate } from '@tanstack/react-router';
import { showNotification } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { ZodError } from 'zod';
import { EventFormSchema, OptionSchema, type EventFormType } from '@/types/event';

interface EventFormProps {
    title: string;
    submitLabel: string;
    onSubmit: (data: EventFormType) => void;
    initialValues?: EventFormType;
}

export function EventForm({
    title,
    submitLabel,
    onSubmit,
    initialValues,
    }: EventFormProps) {
    const form = useForm<EventFormType>({
        initialValues: {
        name: '',
        description: '',
        amount: 0,
        date: '',
        type: 'ingreso',
        },
        validate: (values) => {
            const parsedValues = {
                ...values,
                amount: Number(values.amount),
            };

            const result = EventFormSchema.safeParse(parsedValues);

            if (result.success) return {};

            if (!(result.error instanceof ZodError)) return {};

            const errors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0];
                if (typeof field === 'string') {
                    errors[field] = issue.message;
                }
            });

            return errors;
        },
    });

    const navigate = useNavigate();

    // Cargar datos al editar
    useEffect(() => {
        if (initialValues) {
            form.setValues({
                ...initialValues,
                date: dayjs(initialValues.date).format('YYYY-MM-DD'),
            });
        }
    }, [initialValues]);

    const handleSubmit = (values: EventFormType) => {
        const formatted = {
            ...values,
            amount: Number(values.amount),
            date: dayjs(values.date).toISOString(),
        };

        onSubmit(formatted);

        // Mostrar notificación
        showNotification({
            title: initialValues ? 'Evento actualizado' : 'Evento creado',
            message: initialValues
                ? 'El evento fue editado correctamente.'
                : 'El evento fue creado correctamente.',
            color: 'green',
            icon: <IconCheck size={18} />,
        });

        // Solo limpiar si es creación
        if (!initialValues) {
            form.reset();
        }

        navigate({ to: '/' });
    };

    return (
        <Box maw={500} mx="auto">
            <h2 className="text-xl mb-4">{title}</h2>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <Tooltip label="Ingrese un evento" withArrow>
                        <TextInput
                            label="Nombre"
                            placeholder="Nombre del evento"
                            {...form.getInputProps('name')}
                        />
                    </Tooltip>

                    <TextInput
                        label="Descripción"
                        placeholder="Descripción opcional"
                        {...form.getInputProps('description')}
                    />

                    <Tooltip label="Seleccione una fecha" withArrow>
                        <DateInput
                            label="Fecha"
                            placeholder="DD/MM/AAAA"
                            valueFormat="DD/MM/YYYY"
                            {...form.getInputProps('date')}
                        />
                    </Tooltip>

                    <Tooltip label="Solo valores positivos" withArrow>
                        <TextInput
                            label="Monto"
                            type="number"
                            {...form.getInputProps('amount')}
                        />
                    </Tooltip>

                    <Tooltip label="Seleccione si es un ingreso o egreso" withArrow>
                        <Select
                            label="Tipo"
                            data={OptionSchema.options.map((opt) => ({
                                value: opt,
                                label: opt.charAt(0).toUpperCase() + opt.slice(1),
                            }))}
                            {...form.getInputProps('type')}
                        />
                    </Tooltip>

                    <Button type="submit" color="grape">
                        {submitLabel}
                    </Button>
                </Stack>
            </form>
        </Box>
    );
}
