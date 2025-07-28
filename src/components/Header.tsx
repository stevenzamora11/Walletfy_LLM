import { Title, ActionIcon, Container, rem } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { Link } from '@tanstack/react-router';

export function Header() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();

    const toggleColorScheme = () =>
        setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');

    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-md sticky top-0 z-50">
            <Container size="xl" className="py-4 px-4 sm:px-6 md:px-8 flex justify-between items-center">
                <Title order={2} className="text-gray-900 dark:text-white font-extrabold">
                    <Link to="/" className="no-underline hover:underline">
                        Wallet<span className="text-purple-500">fy</span> <span className="text-sm">2</span>
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
        </header>
    );
}
