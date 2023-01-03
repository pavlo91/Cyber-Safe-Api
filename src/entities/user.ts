import {
  Entity,
  AfterInsert,
  AfterLoad,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable
} from "typeorm";
import bcrypt from "bcryptjs";

import { UUIDEntity } from "../helpers/model";
import Address from "./address";
import StoredFile from "./stored-file";
import { OrgLink } from "./org";
import PaymentInfo from "./payment-info";

export enum UserType {
  Generic = "GENERIC",
  Admin = "ADMIN"
}

export enum UserStatus {
  Active = "ACTIVE",
  Deleted = "DELETED"
}

export type UserSettings = {
  notifications: {
    phone: boolean;
    email: boolean;
  };
};

@Entity()
export default class User extends UUIDEntity {
  @Column({ type: "enum", enum: UserType, default: UserType.Generic })
  type!: UserType;

  @Column({ type: "citext" })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    type: "date",
    nullable: true
  })
  birthday?: Date;

  @Column()
  phone!: string;

  @OneToOne(() => Address, { eager: true })
  @JoinColumn()
  address!: Address;

  @Column({ type: "json" })
  settings!: UserSettings;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.Active })
  status!: UserStatus;

  @OneToMany(
    () => OrgLink,
    link => link.user
  )
  @JoinColumn()
  orgs!: OrgLink[];

  @ManyToMany(() => StoredFile)
  @JoinTable()
  documents!: StoredFile[];

  fullName!: string;

  @AfterInsert()
  @AfterLoad()
  onLoaded() {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }

  @OneToMany(
    () => PaymentInfo,
    paymentInfo => paymentInfo.user
  )
  paymentMethods!: PaymentInfo[];

  async setPassword(password: string) {
    this.password = await bcrypt.hash(password, 10);
  }

  async isPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
