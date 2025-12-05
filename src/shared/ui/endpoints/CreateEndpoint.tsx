'use client';

import { Button, Flex } from '@mantine/core';
import { modals } from '@mantine/modals';

export const CreateEndpoint = () => {
  return (
    <Flex justify='space-between'>
      <div />
      <Button
        color='green'
        onClick={() =>
          modals.openContextModal({
            modal: 'createEndpoint',
            title: 'Создать endpoint',
            size: 'xl',
            innerProps: {},
            onClose: () => {
              window.localStorage.removeItem('endpoint-form');
            }
          })
        }
      >
        Создать
      </Button>
    </Flex>
  );
};
