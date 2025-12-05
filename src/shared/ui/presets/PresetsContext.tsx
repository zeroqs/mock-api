'use client';

import type { ReactNode } from 'react';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface MockPreset {
  createdAt: Date;
  enabled: boolean;
  filterKeys: string[];
  id: string;
  mockEndpointId: string;
  name: string;
  responseData: unknown;
  statusCode: number;
  updatedAt: Date;
}

interface DraftPreset {
  enabled: boolean;
  filterKeys: string[];
  id?: string;
  name: string;
  responseData: unknown;
  statusCode: number;
}

interface PresetsContextType {
  draftPresets: DraftPreset[];
  error: string | null;
  loading: boolean;
  mockEndpointId: string | null;
  presets: MockPreset[];
  addDraftPreset: (preset: DraftPreset) => void;
  clearDraftPresets: () => void;
  fetchPresets: () => Promise<void>;
  loadPresets: (endpointId: string) => Promise<void>;
  removeDraftPreset: (index: number) => void;
  removeDraftPresetById: (id: string) => void;
  setActivePresetInDraft: (id: string) => void;
  setDraftPresets: (presets: DraftPreset[]) => void;
  setMockEndpointId: (id: string | null) => void;
}

const PresetsContext = createContext<PresetsContextType | undefined>(undefined);

export const PresetsProvider = ({ children }: { children: ReactNode }) => {
  const [presets, setPresets] = useState<MockPreset[]>([]);
  const [draftPresets, setDraftPresets] = useState<DraftPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockEndpointId, setMockEndpointId] = useState<string | null>(null);

  const fetchPresets = useCallback(async () => {
    if (!mockEndpointId) {
      setPresets([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/presets?mockEndpointId=${mockEndpointId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch presets');
      }

      const data = await response.json();
      setPresets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPresets([]);
    } finally {
      setLoading(false);
    }
  }, [mockEndpointId]);

  const addDraftPreset = (preset: DraftPreset) => {
    setDraftPresets((prev) => [...prev, preset]);
  };

  const removeDraftPreset = (index: number) => {
    setDraftPresets((prev) => prev.filter((_, i) => i !== index));
  };

  const clearDraftPresets = () => {
    setDraftPresets([]);
  };

  const removeDraftPresetById = (id: string) => {
    setDraftPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const setActivePresetInDraft = (id: string) => {
    setDraftPresets((prev) =>
      prev.map((preset) => ({
        ...preset,
        enabled: preset.id === id
      }))
    );
  };

  const loadPresets = useCallback(async (endpointId: string) => {
    setMockEndpointId(endpointId);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/presets?mockEndpointId=${endpointId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch presets');
      }

      const data = await response.json();
      setPresets(data);
      setDraftPresets(
        data.map((preset: MockPreset) => ({
          id: preset.id,
          name: preset.name,
          enabled: preset.enabled,
          statusCode: preset.statusCode,
          responseData: preset.responseData,
          filterKeys: preset.filterKeys
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPresets([]);
      setDraftPresets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  return (
    <PresetsContext.Provider
      value={{
        error,
        loading,
        mockEndpointId,
        addDraftPreset,
        draftPresets,
        clearDraftPresets,
        fetchPresets,
        loadPresets,
        presets,
        removeDraftPreset,
        removeDraftPresetById,
        setActivePresetInDraft,
        setDraftPresets,
        setMockEndpointId
      }}
    >
      {children}
    </PresetsContext.Provider>
  );
};

export const usePresets = () => {
  const context = useContext(PresetsContext);
  if (context === undefined) {
    throw new Error('usePresets must be used within a PresetsProvider');
  }
  return context;
};
