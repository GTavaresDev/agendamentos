-- CreateIndex
CREATE INDEX "Appointments_date_idx" ON "Appointments"("date");

-- CreateIndex
CREATE INDEX "Appointments_status_idx" ON "Appointments"("status");

-- CreateIndex
CREATE INDEX "Appointments_userId_idx" ON "Appointments"("userId");

-- CreateIndex
CREATE INDEX "Appointments_clientId_idx" ON "Appointments"("clientId");

-- CreateIndex
CREATE INDEX "Appointments_serviceId_idx" ON "Appointments"("serviceId");
