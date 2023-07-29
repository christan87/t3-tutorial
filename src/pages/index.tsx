import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { RouterOutputs, api } from "~/utils/api";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

// dayjs
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { LoadingPage } from "~/components/loading";
dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  if (!user) return null;
  return (
    <div className="flex w-full gap-3">
      <Image 
        className="w-14 h-14 rounded-full" 
        src={user.profileImageUrl} 
        alt="Profile Image"
        width={56}
        height={56}
      />
      <input className="bg-transparent grow outline-none" placeholder="Type some emojis..." />
    </div>
  );
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props; 
  return (
    <div className="flex gap-3 p-4 border-b border-slate-400" key={`${post.id}${Math.random()}`}>
      <Image 
        className="w-14 h-14 rounded-full" 
        src={author.profileImageUrl} 
        alt={`@${author.username}'s Profile Picture`}
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  )
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if(postsLoading) return <LoadingPage /> 
  if(!data) return <div>Something went wrong...</div>

  return (
    <div className="flex flex-col">
      {/* data?.map((post) */}
      {[...data, ...data]?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id}/>
      ))}
    </div>
  )
}

export default function Home() {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();

  // Start Fetching Data Asap
  api.posts.getAll.useQuery();

  //return empty div if user isn't loaded yet
  if(!userLoaded) return <div /> 

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className="w-full h-full border-x md:max-w-2xl border-slate-400">
          <div className="border-b border-slate-100 p-4 flex ">
            {!isSignedIn && ( 
                <div className="flex justify-center ">
                  <SignInButton mode="modal"/>
                </div>
            )}
            {isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
}
