import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/api";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return { 
    id: user.id, 
    username: user.username,
    profileImageUrl: user.profileImageUrl
  }
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query( async ({ ctx }) => {
    const posts =  await ctx.prisma.post.findMany({
      take: 100, // limits number of posts returned to 100 
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);

    console.log('=============> users: ', users);
    
    return posts.map((post) => ({
      post,
      author: users.find((user) => user.id === post.authorId),
    }));
  }),
});
