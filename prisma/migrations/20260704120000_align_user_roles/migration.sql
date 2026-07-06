-- Align UserRole enum to ADMIN, CONTRIBUTOR, USER

CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'CONTRIBUTOR', 'USER');

ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING (
  CASE "role"::text
    WHEN 'SUPER_ADMIN' THEN 'ADMIN'::"UserRole_new"
    WHEN 'EDITOR' THEN 'ADMIN'::"UserRole_new"
    WHEN 'CONTRIBUTOR' THEN 'CONTRIBUTOR'::"UserRole_new"
    ELSE 'USER'::"UserRole_new"
  END
);

DROP TYPE "UserRole";

ALTER TYPE "UserRole_new" RENAME TO "UserRole";

ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER'::"UserRole";
