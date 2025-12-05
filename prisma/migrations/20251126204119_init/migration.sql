-- CreateTable
CREATE TABLE "MockEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MockPreset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "statusCode" INTEGER NOT NULL DEFAULT 200,
    "responseData" JSONB NOT NULL,
    "filterKeys" JSONB DEFAULT [],
    "mockEndpointId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MockPreset_mockEndpointId_fkey" FOREIGN KEY ("mockEndpointId") REFERENCES "MockEndpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MockEndpoint_method_path_idx" ON "MockEndpoint"("method", "path");

-- CreateIndex
CREATE UNIQUE INDEX "MockEndpoint_method_path_key" ON "MockEndpoint"("method", "path");

-- CreateIndex
CREATE INDEX "MockPreset_mockEndpointId_idx" ON "MockPreset"("mockEndpointId");

-- CreateIndex
CREATE INDEX "MockPreset_mockEndpointId_enabled_idx" ON "MockPreset"("mockEndpointId", "enabled");
