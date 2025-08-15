-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "suggestedPeople" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "businessDays" TEXT NOT NULL,
    "notSuitableForSummer" BOOLEAN NOT NULL DEFAULT false,
    "notSuitableForWinter" BOOLEAN NOT NULL DEFAULT false,
    "notSuitableForRainy" BOOLEAN NOT NULL DEFAULT false,
    "distance" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "peopleCount" INTEGER NOT NULL,
    "weather" TEXT NOT NULL,
    "isRaining" BOOLEAN NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "History_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "historyId" TEXT NOT NULL,
    "payerName" TEXT,
    "amount" REAL,
    "receiptImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "History" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_historyId_key" ON "Payment"("historyId");
