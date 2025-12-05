'use client';

import { Flex, MultiSelect, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { METHODS } from '@/app/api/endpoints/schema';

export const Filters = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      search: searchParams.get('query') || '',
      methods: searchParams.get('methods')?.split(',').filter(Boolean) || ([] as string[])
    }
  });

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 500);

  const handleMethodsChange = (methods: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (methods.length > 0) {
      params.set('methods', methods.join(','));
    } else {
      params.delete('methods');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const query = searchParams.get('query') || '';
    const methods = searchParams.get('methods')?.split(',').filter(Boolean) || [];
    if (form.getValues().search !== query) {
      form.setFieldValue('search', query);
    }
    if (JSON.stringify(form.getValues().methods) !== JSON.stringify(methods)) {
      form.setFieldValue('methods', methods);
    }
  }, [searchParams]);

  return (
    <Flex align='baseline' gap='md' wrap='wrap'>
      <TextInput
        key={form.key('search')}
        flex='1 1 70%'
        label='Поиск'
        placeholder='/api'
        rightSection={<IconSearch />}
        rightSectionPointerEvents='none'
        {...form.getInputProps('search')}
        onChange={(e) => {
          form.setFieldValue('search', e.currentTarget.value);
          handleSearch(e.currentTarget.value);
        }}
      />
      <MultiSelect
        clearable
        key={form.key('methods')}
        data={METHODS}
        flex='0 1 20%'
        label='Тип запроса'
        maxDropdownHeight={200}
        placeholder='Выберите методы'
        {...form.getInputProps('methods')}
        onChange={(value) => {
          form.setFieldValue('methods', value);
          handleMethodsChange(value);
        }}
      />
    </Flex>
  );
};
