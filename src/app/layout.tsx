import type { Metadata } from 'next';

import { ColorSchemeScript, Container, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

import { Header, PresetsProvider } from '@/shared/ui';
import { CreateEndpointModal, CreatePresetModal, EndpointModal } from '@/shared/ui/modals';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

export const metadata: Metadata = {
  title: 'QA Admin - Mock API Management',
  description: 'Centralized mock API management system'
};

export default function RootLayout({
  children,
  modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <Notifications />
          <PresetsProvider>
            <ModalsProvider
              modals={{
                createEndpoint: CreateEndpointModal,
                createPreset: CreatePresetModal,
                endpoint: EndpointModal
              }}
            >
              <Header />
              <Container size={1400}>{children}</Container>
              {modal}
            </ModalsProvider>
          </PresetsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
