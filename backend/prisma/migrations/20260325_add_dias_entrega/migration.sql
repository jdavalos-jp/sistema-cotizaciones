-- AddColumn diasEntrega to cotizaciones table
ALTER TABLE "cotizaciones" ADD COLUMN "dias_entrega" INT DEFAULT 5;
