import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('badges')
export class Badge {
  @PrimaryColumn()
  key: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  iconUrl: string; // e.g. /badges/key.png
}
