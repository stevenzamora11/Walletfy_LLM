import { Outlet, createRootRoute } from '@tanstack/react-router';
import {Header} from '@/components/Header';
import { Container } from '@mantine/core';

export const Route = createRootRoute({
  component: RootLayout,
});

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 py-10 px-4">
        <Container fluid h={100} mt={30} mx={30} size="lg" className="py-10 mx-auto">
          <Outlet />
        </Container>
      </main>
    </div>
  );
}
