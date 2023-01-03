import { BaseEntity } from "../helpers/model";
import { Entity, Column } from "typeorm";

@Entity()
export default class Address extends BaseEntity {
  @Column()
  addressLine1!: string;

  @Column({ type: "text", nullable: true })
  addressLine2!: string | null;

  @Column({ type: "text", nullable: true })
  addressLine3!: string | null;

  @Column()
  city!: string;

  @Column({ type: "text", nullable: true })
  state!: string | null;

  @Column()
  country!: string;

  @Column()
  zipcode!: string;
}
