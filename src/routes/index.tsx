import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useWalletStore } from '@/stores/walletStore';
import { groupEventsByMonth } from '@/utils/months';
import { useState } from 'react';
import {Tooltip, Button, TextInput, Stack, Paper, Text, Group, ActionIcon, Divider} from '@mantine/core';
import { IconEdit, IconTrash, IconRobot } from '@tabler/icons-react';
import dayjs from 'dayjs';

export const Route = createFileRoute('/')({
  component: BalancePage,
});

function BalancePage() {
  const [inputValue, setInputValue] = useState('0');
  const navigate = useNavigate();

  const goToAddEvent = () => {
    navigate({ to: '/event/form/form' });
  };

  const goToEditEvent = (id: string) => {
    navigate({ to: `/event/form/${id}` });
  };

  const goToAssistant = () => {
    navigate({ to: '/assistant' });
  };

  const { events, balanceInitial, setBalanceInitial, deleteEvent } = useWalletStore();
  const summary = groupEventsByMonth(events, balanceInitial);

  const totalEvents = events.length;
  const totalMonths = summary.length;

  const handleCalcular = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      setBalanceInitial(parsed);
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="end">
        <Group align="end">
          <TextInput
            label="Dinero inicial"
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
          />
          <Button color="grape" onClick={handleCalcular}>
            Calcular
          </Button>
        </Group>

        <Group>
          <Button
            variant="light"
            leftSection={<IconRobot size={20} />}
            onClick={goToAssistant}
          >
            Asistente
          </Button>

          <Button color="grape" onClick={goToAddEvent}>
            Añadir Evento
          </Button>
        </Group>

      </Group>

      <Text>
        Tienes <strong>{totalEvents}</strong> eventos en <strong>{totalMonths}</strong> meses
      </Text>

      <Group wrap="wrap" gap="md">
        {summary.map((month) => (
          <Paper
            key={`${month.month}-${month.year}`}
            shadow="md"
            radius="md"
            p="md"
            withBorder
            className="bg-white dark:bg-gray-800 hover:shadow-lg transition"
            style={{ width: '300px' }}
          >
            {/* Título del mes y año */}
            <Text fw={700} mb="xs">
              {month.name} {month.year}
            </Text>
            <Divider mb="sm" />

            {month.events.map((event, index) => (
              <div key={event.id} className="mb-3">
                <Group justify="space-between" align="center">
                  <Tooltip
                    label={event.description || 'Sin descripción'}
                    withArrow
                    position="top"
                    color="dark"
                  >
                    <div>
                      <Text fw={600}>{event.name}</Text>
                      <Text size="xs" c="dimmed">
                        {dayjs(event.date).format('DD/MM/YYYY')}
                      </Text>
                    </div>
                  </Tooltip>

                  <Group align="center" gap="xs">
                    <Text c={event.type === 'ingreso' ? 'green' : 'red'}>
                      ${event.amount}
                    </Text>

                    <Tooltip label="Editar evento" withArrow>
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => goToEditEvent(event.id)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Eliminar evento" withArrow>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => {
                          if (confirm(`¿Seguro que deseas eliminar "${event.name}"?`)) {
                            deleteEvent(event.id);
                          }
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>

                  </Group>
                </Group>

                {/* Línea divisoria entre eventos */}
                {index !== month.events.length - 1 && <Divider my="xs" />}
              </div>
            ))}

            {/* Línea divisoria antes del resumen */}
            <Divider my="sm" />

            {/* Resumen de flujo */}
            <div className="text-sm text-gray-800 dark:text-gray-200">
              <div className="flex justify-between mb-1">
                <span className="font-bold">Ingreso</span>
                <span>${month.flow.income}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-bold">Egreso</span>
                <span>${month.flow.expense}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-bold">Mensual</span>
                <span>${month.flow.monthly}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Global</span>
                <span>${month.flow.global}</span>
              </div>
            </div>
          </Paper>
        ))}
      </Group>
    </Stack>
  );
}
