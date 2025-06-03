import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Asset } from "../../asset/entities/asset.entity";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Asset, { eager: true })
  asset: Asset;

  @ManyToOne(() => User, { eager: true })
  owner: User;

  @Column()
  issuer: string;

  @Column()
  issuanceDate: Date;

  @Column({ nullable: true })
  expirationDate: Date;

  @Column({ default: "valid" })
  status: "valid" | "revoked" | "expired";

  @Column({ nullable: true })
  revocationReason: string;

  @Column({ nullable: true })
  revocationDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
