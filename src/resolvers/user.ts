import { User } from "../entities/User";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Query,
  Resolver,
  Mutation,
  ObjectType,
} from "type-graphql";
import argon2 from "argon2";
import { DriverException } from "@mikro-orm/core";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}
// Using a question mark followed by a colon (?:) means a property is optional

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "username length must be greater than 2",
          },
        ],
      };
    }

    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "password length must be greater than 2",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      // duplicate username error
      if(err.code==='23505') {
        return {
          errors: [{
            field: 'username',
            message: "username already taken",
          }]
        }
      }
    }
    return { user };
  }
  // GraphQL query:
  // mutation {
  //   register(options: {username: "ben", password: "ben"}) {
  //     errors {
  //       field
  //       message
  //     }
  //     user {
  //       id
  //       username
  //     }
  //   }
  // }

  // *** Please study the syntax below, especially Promise<> ***
  @Mutation(() => UserResponse)
  async login(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "that username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }
    return {
      user,
    };
  }
  // GraphQL query:
  // mutation {
  //   login(options: {username: "ben", password: "ben"}) {
  //     errors {
  //       field
  //       message
  //     }
  //     user {
  //       id
  //       username
  //     }
  //   }
  // }
}
