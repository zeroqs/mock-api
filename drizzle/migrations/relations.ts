import { relations } from "drizzle-orm/relations";
import { mockEndpoint, mockPreset } from "./schema";

export const mockPresetRelations = relations(mockPreset, ({one}) => ({
	mockEndpoint: one(mockEndpoint, {
		fields: [mockPreset.mockEndpointId],
		references: [mockEndpoint.id]
	}),
}));

export const mockEndpointRelations = relations(mockEndpoint, ({many}) => ({
	mockPresets: many(mockPreset),
}));