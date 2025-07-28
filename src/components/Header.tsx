import { Title, ActionIcon, Container, rem, Paper } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { Link } from '@tanstack/react-router';

export function Header() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();

    const toggleColorScheme = () =>
        setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');

    return (
        <header>
            <Paper
                shadow="md"
                radius="md"
                p="md"
                withBorder
                className="bg-white dark:bg-gray-800 hover:shadow-lg dark:shadow-md transition"
            >
                <Container fluid h={50} className="px-6 flex justify-between items-center">
                    <Title order={2} className="font-extrabold">
                        <Link to="/" className="no-underline hover:underline text-black dark:text-white ">
                            Wallet<span>fy</span> 2
                        </Link>
                    </Title>

                    <ActionIcon
                        onClick={toggleColorScheme}
                        variant="default"
                        size="lg"
                        aria-label="Toggle color scheme"
                    >
                        {colorScheme === 'dark' ? (
                            <IconSun size={rem(20)} />
                        ) : (
                            <IconMoon size={rem(20)} />
                        )}
                    </ActionIcon>
                </Container>
            </Paper>
        </header>
    );
}
