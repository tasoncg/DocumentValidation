-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'officer',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "contentHtml" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DocumentTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataType" TEXT NOT NULL DEFAULT 'nvarchar',
    "originalText" TEXT NOT NULL,
    "placeholderKey" TEXT NOT NULL,
    "appearanceCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DocumentVariable_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ViolationCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "officerId" TEXT NOT NULL,
    "caseNumber" TEXT,
    "finalContentHtml" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "printedAt" DATETIME,
    CONSTRAINT "ViolationCase_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ViolationCase_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ViolationCaseValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "variableId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "ViolationCaseValue_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ViolationCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ViolationCaseValue_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "DocumentVariable" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplate_orderNumber_key" ON "DocumentTemplate"("orderNumber");

-- CreateIndex
CREATE INDEX "DocumentTemplate_createdById_idx" ON "DocumentTemplate"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVariable_placeholderKey_key" ON "DocumentVariable"("placeholderKey");

-- CreateIndex
CREATE INDEX "DocumentVariable_templateId_idx" ON "DocumentVariable"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVariable_templateId_name_key" ON "DocumentVariable"("templateId", "name");

-- CreateIndex
CREATE INDEX "ViolationCase_templateId_idx" ON "ViolationCase"("templateId");

-- CreateIndex
CREATE INDEX "ViolationCase_officerId_idx" ON "ViolationCase"("officerId");

-- CreateIndex
CREATE INDEX "ViolationCaseValue_caseId_idx" ON "ViolationCaseValue"("caseId");

-- CreateIndex
CREATE INDEX "ViolationCaseValue_variableId_idx" ON "ViolationCaseValue"("variableId");

-- CreateIndex
CREATE UNIQUE INDEX "ViolationCaseValue_caseId_variableId_key" ON "ViolationCaseValue"("caseId", "variableId");
