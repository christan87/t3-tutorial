import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";
import Image from "next/image";
import {PostView} from '~/components/postview';

const ProfileFeed = (props: {userId: string}) => {
  const {data, isLoading} = api.posts.getPostsByUserId.useQuery({userId: props.userId});
  if(isLoading) return <LoadingPage />;
  //(data as any[]) differs from original code

  if(!data || data.length === 0) return <div>User has not posted</div>

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (<PostView {...fullPost} key={fullPost.post.id}/>))}
    </div>
  );
};

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
      
      <PageLayout>
        <div className="relative h-36 border-slate-400 bg-slate-600">
          <Image 
            src={data.profileImageUrl} 
            alt={`${data.username ?? " " }'s profile image`} 
            width={128}
            height={128}
            className="-mb-[64px] rounded-full border-2 border-black absolute bottom-0 left-0 ml-4"
          />
        </div>
        <div className="h-[64px]"/>{/* This is a spacer div creating space btwn profile pic and usernmae */}
        <div className="p-4 text-2xl font-bold">{`@${data.username}`}</div>
        <div className="w-full border-b border-slate-400" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
}
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '~/server/api/root';
import { prisma } from '~/server/db';
import superjson from "superjson";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";

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
