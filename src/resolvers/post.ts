import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { Updoot } from "../entities/Updoot";
import { TypeNameMetaFieldDef } from "graphql";

// Artificial delay - for testing
// function delay(ms: number) {
//   return new Promise( resolve => setTimeout(resolve, ms) );
// }

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  // Return only a snippet of text each time Post is queried
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { postId, userId } });

    // user has voted on the post before & they want to change their vote
    if (updoot && updoot.value !== realValue) {
      console.log("*USER has voted on the post before & they want to change their vote*")
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `update updoot
          set value = $1
          where "postId" = $2 and "userId" = $3
          `,
          [realValue, postId, userId]
        );

        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2;
          `,
          [2 * realValue, postId]
        );
      });
    }
    // has never voted before
    else if (!updoot) {
      console.log("*USER has never voted before*")
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
        insert into updoot ("userId", "postId", value)
    values ($1, $2, $3);
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2;
          `,
          [realValue, postId]
        );
      });
    }
    else {
      console.log("*USER has voted on the same DOOT before*")
    }

    // await Updoot.insert({
    //   userId,
    //   postId,
    //   value: realValue,
    // });

    // $1 = realValue, $2 = postId
    // await getConnection().query(`
    // START TRANSACTION;

    // COMMIT;
    // `);

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    @Ctx() {req}: MyContext
    ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if(req.session.userId) {
      replacements.push(req.session.userId);
    }

    let cursorIdx = 3;
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      cursorIdx = replacements.length;
    }

    const posts = await getConnection().query(
      `
      select p.*, 
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
        'updatedAt', u."updatedAt"
        ) creator,
      ${
        req.session.userId 
        ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"' 
        : 'null as "voteStatus"'
      }
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $${cursorIdx}` : ""}
      order by p."createdAt" DESC
      limit $1
      `,
      replacements
    );

    // conditionally query SQL
    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', "DESC")
    //   .take(realLimitPlusOne);
    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    // const posts = await qb.getMany();
    // console.log("posts: ", posts);

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }
  // GraphQL query:
  // {
  //   post(id: 3) {
  //     title
  //   }
  // }

  // Create Post
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }
  // GraphQL query:
  // mutation {
  //   createPost(title: "post from graphql") {
  //     id
  //     createdAt
  //     updatedAt
  //     title
  //   }
  // }

  // Update Post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    // 1 SQL query to fetch the Post
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      // 1 SQL query to update
      await Post.update({ id }, { title });
    }
    return post;
  }
  // GraphQL Query
  // mutation {
  //   updatePost(id: 99, title: "bob") {
  //     id
  //     createdAt
  //     updatedAt
  //     title
  //   }
  // }

  // Delete Post
  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
  // GraphQL Query
  // mutation {
  //   deletePost(id: 5)
  // }
}
