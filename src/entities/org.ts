import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";

import { UUIDEntity, BaseEntity } from "../helpers/model";
import User from "./user";
import Address from "./address";
import PaymentInfo from "./payment-info";

type OrgContact = {
  name: string;
  title: string;
  email: string;
  phone: string;
};

/*
  An OrgLink acts as a connection between a user and an organization. The relation
  has been seperated out as it's own entity to allow for future information to be
  attached to the entity (perhaps a user's role-level inside an organization).
*/
@Entity()
export class OrgLink extends BaseEntity {
  @ManyToOne(
    () => Org,
    org => org.users
  )
  org!: Org;

  @ManyToOne(
    () => User,
    user => user.orgs
  )
  user!: User;

  // Something like this (but with an enum) can be added in the future to track role:
  // @Column()
  // userType!: "ADMIN" | "EMPLOYEE";
}

@Entity()
export default class Org extends UUIDEntity {
  @Column()
  name!: string;

  @Column({ type: "json" })
  contact!: OrgContact;

  @OneToOne(() => Address)
  @JoinColumn()
  address?: Address;

  @OneToOne(() => PaymentInfo)
  paymentInfo?: PaymentInfo;

  @OneToMany(
    () => OrgLink,
    link => link.org
  )
  users!: OrgLink[];
}
