import { Entity, Column, ManyToOne, BeforeInsert } from "typeorm";
import { BaseEntity } from "../helpers/model";

import User from "./user";
import { getPaymentMethodDetails } from "../libs/payment";

enum CardType {
  Amex = "AMEX",
  Diners = "DINERS",
  Discover = "DISCOVER",
  JCB = "JCB",
  MasterCard = "MASTERCARD",
  UnionPay = "UNIONPAY",
  Visa = "VISA",
  Unknown = "UNKNOWN"
}

@Entity()
export default class PaymentInfo extends BaseEntity {
  @Column({ unique: true })
  paymentMethodId!: string;

  @Column()
  last4!: string;

  @Column({ type: "enum", enum: CardType, default: CardType.Unknown })
  cardType!: CardType;

  @Column({ type: "text", nullable: true })
  country!: string | null;

  @Column()
  expiryMonth!: number;

  @Column()
  expiryYear!: number;

  @ManyToOne(
    () => User,
    user => user.paymentMethods,
    { nullable: true }
  )
  user?: User;

  /*
    Uncomment for inverse-linking if needed. The relation can also be
    changedto OneToMany if users can share payment info.

  @OneToOne(
    type => Org,
    org => org.paymentInfo
  )
  org!: Org;
  */

  @BeforeInsert()
  async populateCardDetails(): Promise<void> {
    if (this.paymentMethodId) {
      const paymentMethod = await getPaymentMethodDetails(this.paymentMethodId);

      if (paymentMethod && paymentMethod.card) {
        this.last4 = paymentMethod.card.last4;
        this.cardType = paymentMethod.card.brand.toUpperCase() as CardType;
        this.country = paymentMethod.card.country;
        this.expiryMonth = paymentMethod.card.exp_month;
        this.expiryMonth = paymentMethod.card.exp_year;
      }
    }
  }
}
