import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ValueTransformer } from "typeorm/decorator/options/ValueTransformer";

export class BaseEntity {
  constructor(obj?: any) {
    for (let key in obj) {
      // @ts-ignore
      this[key] = obj[key];
    }
  }

  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export class UUIDEntity extends BaseEntity {
  @Column({ generated: "uuid" })
  uuid!: number;
}

export class GeographyTransformer implements ValueTransformer {
  to(coordinates: [number, number] | null) {
    if (coordinates) {
      return {
        type: "Point",
        coordinates
      };
    }

    return null;
  }

  from(wkb: any) {
    return wkb?.coordinates;
  }
}
