import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";

const ProfilePage: NextPage<{username: string}> = ({username}) => {
  const { data } = api.profile.getUserByUserName.useQuery({
    username,
  });

  if(!data) return <div>404</div>

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <main className="flex justify-center h-screen">
        <div>
          {data.username}
        </div>
      </main>
    </>
  );
}
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '~/server/api/root';
import { prisma } from '~/server/db';
import superjson from "superjson";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null} ,
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;
  if(typeof slug !== "string") throw new Error('no slug');

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUserName.prefetch({ username });
  const trpcState = ssg.dehydrate(); // has 
  
  return {
    props: {
      trpcState,
      username
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking"
  };
}
export default ProfilePage;
