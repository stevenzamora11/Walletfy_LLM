import { Outlet, createRootRoute } from '@tanstack/react-router';
import {Header} from '@/components/Header';
import { Container } from '@mantine/core';

export const Route = createRootRoute({
  component: RootLayout,
});

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:text-white transition-colors duration-300">
      <Header />
      <main className="px-4 sm:px-6 md:px-8 mt-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}

