'use client';

import { Modal } from '@mantine/core';
import { useRouter } from 'next/navigation';

import type { MockEndpointWithPresets } from '@/shared/lib/endpoints';

import { usePresets } from '@/shared/ui';

import { EndpointForm } from './EndpointForm';

interface EditEndpointModalProps {
  endpoint: MockEndpointWithPresets;
}

export const EditEndpointModal = ({ endpoint }: EditEndpointModalProps) => {
  const router = useRouter();
  const { clearDraftPresets } = usePresets();

  const handleClose = () => {
    clearDraftPresets();
    router.back();
  };

  return (
    <Modal size='xl' title='Редактировать эндпоинт' onClose={handleClose} opened={true}>
      <EndpointForm endpoint={endpoint} />
    </Modal>
  );
};
