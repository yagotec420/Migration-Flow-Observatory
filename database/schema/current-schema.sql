
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE "FlowType" AS ENUM ('EXIT', 'RETURN', 'TRANSIT');
CREATE TYPE "LocationType" AS ENUM ('CITY', 'COUNTRY', 'REGION');
CREATE TYPE "SourceType" AS ENUM ('API', 'MANUAL', 'MOCK');

CREATE TABLE "country" (
    "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name"       TEXT NOT NULL,
    "iso_code"   VARCHAR(3) NOT NULL,
    "continent"  TEXT NOT NULL,
    "latitude"   DOUBLE PRECISION NOT NULL,
    "longitude"  DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3)
);

CREATE UNIQUE INDEX "country_iso_code_key" ON "country"("iso_code");
CREATE INDEX "country_continent_idx" ON "country"("continent");
CREATE INDEX "country_iso_code_idx" ON "country"("iso_code");

CREATE TABLE "location" (
    "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "country_id" UUID NOT NULL,
    "name"       TEXT NOT NULL,
    "type"       "LocationType" NOT NULL DEFAULT 'CITY',
    "latitude"   DOUBLE PRECISION NOT NULL,
    "longitude"  DOUBLE PRECISION NOT NULL,
    "geometry"   geometry(Point, 4326),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "location_country_id_fkey" FOREIGN KEY ("country_id")
        REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "location_country_id_idx" ON "location"("country_id");
CREATE INDEX "location_type_idx" ON "location"("type");

CREATE INDEX "location_geometry_gist_idx" ON "location" USING GIST ("geometry");

CREATE TABLE "migration_route" (
    "id"                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "origin_location_id"      UUID NOT NULL,
    "destination_location_id" UUID NOT NULL,
    "name"                    TEXT NOT NULL,
    "description"             TEXT,
    "status"                  TEXT NOT NULL DEFAULT 'active',
    "created_at"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"              TIMESTAMP(3) NOT NULL,
    "deleted_at"               TIMESTAMP(3),

    CONSTRAINT "migration_route_origin_location_id_fkey" FOREIGN KEY ("origin_location_id")
        REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "migration_route_destination_location_id_fkey" FOREIGN KEY ("destination_location_id")
        REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "migration_route_origin_location_id_idx" ON "migration_route"("origin_location_id");
CREATE INDEX "migration_route_destination_location_id_idx" ON "migration_route"("destination_location_id");
CREATE INDEX "migration_route_status_idx" ON "migration_route"("status");

CREATE TABLE "data_source" (
    "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name"        TEXT NOT NULL,
    "url"         TEXT,
    "description" TEXT,
    "type"        "SourceType" NOT NULL DEFAULT 'MOCK',
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "data_source_name_key" ON "data_source"("name");

CREATE TABLE "migration_flow" (
    "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "route_id"         UUID NOT NULL,
    "year"             INTEGER NOT NULL,
    "month"            INTEGER NOT NULL,
    "day"              INTEGER,
    "amount"           INTEGER NOT NULL,
    "flow_type"        "FlowType" NOT NULL,
    "confidence_level" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "source_id"        UUID NOT NULL,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "migration_flow_route_id_fkey" FOREIGN KEY ("route_id")
        REFERENCES "migration_route"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "migration_flow_source_id_fkey" FOREIGN KEY ("source_id")
        REFERENCES "data_source"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "migration_flow_amount_check" CHECK ("amount" >= 0),
    CONSTRAINT "migration_flow_month_check" CHECK ("month" BETWEEN 1 AND 12),
    CONSTRAINT "migration_flow_confidence_check" CHECK ("confidence_level" BETWEEN 0.0 AND 1.0)
);

CREATE INDEX "migration_flow_route_id_idx" ON "migration_flow"("route_id");
CREATE INDEX "migration_flow_year_month_idx" ON "migration_flow"("year", "month");
CREATE INDEX "migration_flow_flow_type_idx" ON "migration_flow"("flow_type");
CREATE INDEX "migration_flow_source_id_idx" ON "migration_flow"("source_id");

CREATE TABLE "migration_event" (
    "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "date"        TIMESTAMP(3) NOT NULL,
    "location_id" UUID,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "migration_event_location_id_fkey" FOREIGN KEY ("location_id")
        REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "migration_event_location_id_idx" ON "migration_event"("location_id");
CREATE INDEX "migration_event_date_idx" ON "migration_event"("date");

CREATE TABLE "statistics" (
    "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "metric"     TEXT NOT NULL,
    "value"      DOUBLE PRECISION NOT NULL,
    "period"     TEXT NOT NULL,
    "country_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statistics_country_id_fkey" FOREIGN KEY ("country_id")
        REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "statistics_country_id_idx" ON "statistics"("country_id");
CREATE INDEX "statistics_period_idx" ON "statistics"("period");
CREATE INDEX "statistics_metric_idx" ON "statistics"("metric");

CREATE TABLE "app_user" (
    "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name"       TEXT NOT NULL,
    "email"      TEXT NOT NULL,
    "role"       TEXT NOT NULL DEFAULT 'viewer',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3)
);

CREATE UNIQUE INDEX "app_user_email_key" ON "app_user"("email");
