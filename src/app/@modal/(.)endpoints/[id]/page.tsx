import { notFound } from 'next/navigation';

import { getEndpoint } from '@/shared/lib/endpoints';
import { EditEndpointModal } from '@/shared/ui/endpoints/EditEndpointModal';

export default async function EditEndpointModalPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const endpoint = await getEndpoint(id);

  if (!endpoint) {
    notFound();
  }

  return <EditEndpointModal endpoint={endpoint} />;
}

