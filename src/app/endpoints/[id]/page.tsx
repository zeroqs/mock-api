import { Container, Title } from '@mantine/core';
import { notFound } from 'next/navigation';

import { getEndpoint } from '@/shared/lib/endpoints';
import { EndpointForm } from '@/shared/ui/endpoints/EndpointForm';

export default async function EditEndpointPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const endpoint = await getEndpoint(id);

  if (!endpoint) {
    notFound();
  }

  return (
    <Container py='xl' size={1400}>
      <Title mb='xl' order={2}>
        Редактировать эндпоинт
      </Title>
      <EndpointForm endpoint={endpoint} />
    </Container>
  );
}
