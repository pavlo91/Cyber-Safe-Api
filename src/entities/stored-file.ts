import { Entity, Column, ManyToOne, BeforeRemove } from "typeorm";

import { UUIDEntity } from "../helpers/model";
import User from "./user";
import { deleteBlobFromContainer } from "../libs/storage";

export enum MimeType {
  JPG = "image/jpeg",
  PNG = "image/png",

  PDF = "document/pdf",
  TEXT = "text/plain",
  DOC = "application/msword",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

@Entity()
export default class StoredFile extends UUIDEntity {
  @Column()
  originalName!: string;

  @Column({ enum: MimeType })
  mimeType!: MimeType;

  @Column()
  blobName!: string;

  @Column()
  url!: string;

  @ManyToOne(() => User, { nullable: true })
  user!: User | null;

  @BeforeRemove()
  async onDelete() {
    try {
      await deleteBlobFromContainer(this.blobName);
    } catch (err) {
      console.error(err);
    }
  }
}
