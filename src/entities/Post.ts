import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

// Database Table for Post
@Entity()
export class Post {
  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  title!: string;
}
