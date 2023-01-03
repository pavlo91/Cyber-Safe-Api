import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1603905938855 implements MigrationInterface {
  name = "initial1603905938855";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "address" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "addressLine1" character varying NOT NULL, "addressLine2" text, "addressLine3" text, "city" character varying NOT NULL, "state" text, "country" character varying NOT NULL, "zipcode" character varying NOT NULL, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "stored_file" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "originalName" character varying NOT NULL, "mimeType" character varying NOT NULL, "blobName" character varying NOT NULL, "url" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_e140967af84027b493a3ff04fbb" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE TYPE "payment_info_cardtype_enum" AS ENUM('AMEX', 'DINERS', 'DISCOVER', 'JCB', 'MASTERCARD', 'UNIONPAY', 'VISA', 'UNKNOWN')`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "payment_info" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "paymentMethodId" character varying NOT NULL, "last4" character varying NOT NULL, "cardType" "payment_info_cardtype_enum" NOT NULL DEFAULT 'UNKNOWN', "country" text, "expiryMonth" integer NOT NULL, "expiryYear" integer NOT NULL, "userId" integer, CONSTRAINT "UQ_f022f753e882e50e738a2ce3d6d" UNIQUE ("paymentMethodId"), CONSTRAINT "PK_b2ba4f3b3f40c6a37e54fb8b252" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(`CREATE TYPE "user_type_enum" AS ENUM('GENERIC', 'ADMIN')`, undefined);
    await queryRunner.query(`CREATE TYPE "user_status_enum" AS ENUM('ACTIVE', 'DELETED')`, undefined);
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "user_type_enum" NOT NULL DEFAULT 'GENERIC', "email" citext NOT NULL, "password" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "birthday" date, "phone" character varying NOT NULL, "settings" json NOT NULL, "status" "user_status_enum" NOT NULL DEFAULT 'ACTIVE', "addressId" integer, CONSTRAINT "REL_217ba147c5de6c107f2fa7fa27" UNIQUE ("addressId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "org_link" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "orgId" integer, "userId" integer, CONSTRAINT "PK_c1a76c980894bdda15480088b41" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "org" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "contact" json NOT NULL, "addressId" integer, CONSTRAINT "REL_4c343fab2745f45f468627ab1b" UNIQUE ("addressId"), CONSTRAINT "PK_703783130f152a752cadf7aa751" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "user_documents_stored_file" ("userId" integer NOT NULL, "storedFileId" integer NOT NULL, CONSTRAINT "PK_18c6e6da815c0014e8b55ec75bf" PRIMARY KEY ("userId", "storedFileId"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bdaf745f2a21f2cdb9493b9362" ON "user_documents_stored_file" ("userId") `,
      undefined
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_38076532700502491d6b5ceb4b" ON "user_documents_stored_file" ("storedFileId") `,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "stored_file" ADD CONSTRAINT "FK_f26ed7103e6e9b2109b6fc6e4a2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "payment_info" ADD CONSTRAINT "FK_57d70d864de558cc9ee853133a9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_217ba147c5de6c107f2fa7fa271" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "org_link" ADD CONSTRAINT "FK_dc10987fbed0d8a9be001f4029c" FOREIGN KEY ("orgId") REFERENCES "org"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "org_link" ADD CONSTRAINT "FK_9e859bc773c38bdafb435ba60e5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "org" ADD CONSTRAINT "FK_4c343fab2745f45f468627ab1bc" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "user_documents_stored_file" ADD CONSTRAINT "FK_bdaf745f2a21f2cdb9493b93622" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "user_documents_stored_file" ADD CONSTRAINT "FK_38076532700502491d6b5ceb4b6" FOREIGN KEY ("storedFileId") REFERENCES "stored_file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_documents_stored_file" DROP CONSTRAINT "FK_38076532700502491d6b5ceb4b6"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "user_documents_stored_file" DROP CONSTRAINT "FK_bdaf745f2a21f2cdb9493b93622"`,
      undefined
    );
    await queryRunner.query(`ALTER TABLE "org" DROP CONSTRAINT "FK_4c343fab2745f45f468627ab1bc"`, undefined);
    await queryRunner.query(`ALTER TABLE "org_link" DROP CONSTRAINT "FK_9e859bc773c38bdafb435ba60e5"`, undefined);
    await queryRunner.query(`ALTER TABLE "org_link" DROP CONSTRAINT "FK_dc10987fbed0d8a9be001f4029c"`, undefined);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_217ba147c5de6c107f2fa7fa271"`, undefined);
    await queryRunner.query(`ALTER TABLE "payment_info" DROP CONSTRAINT "FK_57d70d864de558cc9ee853133a9"`, undefined);
    await queryRunner.query(`ALTER TABLE "stored_file" DROP CONSTRAINT "FK_f26ed7103e6e9b2109b6fc6e4a2"`, undefined);
    await queryRunner.query(`DROP INDEX "IDX_38076532700502491d6b5ceb4b"`, undefined);
    await queryRunner.query(`DROP INDEX "IDX_bdaf745f2a21f2cdb9493b9362"`, undefined);
    await queryRunner.query(`DROP TABLE "user_documents_stored_file"`, undefined);
    await queryRunner.query(`DROP TABLE "org"`, undefined);
    await queryRunner.query(`DROP TABLE "org_link"`, undefined);
    await queryRunner.query(`DROP TABLE "user"`, undefined);
    await queryRunner.query(`DROP TYPE "user_status_enum"`, undefined);
    await queryRunner.query(`DROP TYPE "user_type_enum"`, undefined);
    await queryRunner.query(`DROP TABLE "payment_info"`, undefined);
    await queryRunner.query(`DROP TYPE "payment_info_cardtype_enum"`, undefined);
    await queryRunner.query(`DROP TABLE "stored_file"`, undefined);
    await queryRunner.query(`DROP TABLE "address"`, undefined);
  }
}
