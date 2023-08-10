import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { RouterOutputs, api } from "~/utils/api";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

// dayjs
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      //this is a promise and void avoids an error by indicating we dont
      //care about the outcome of the promise
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if(errorMessage && errorMessage[0]){
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.")
      }
    } 
  });

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
      <input 
        className="bg-transparent grow outline-none" 
        placeholder="Type some emojis..." 
        type="text"
        value={input}
        onChange={(e)=> setInput(e.target.value)}
        onKeyDown={(e) => {
          if(e.key === "Enter"){
            e.preventDefault();
            if(input !== ""){
              mutate({content: input});
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting &&(
        <button
          onClick={()=> mutate({content: input})}
          disabled={isPosting}
        >
          Post
        </button>
      )}
      {isPosting && ( 
        <div className="flex justify-center items-center">
          <LoadingSpinner size={20}/>
        </div>
      )}
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
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
          <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
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
      {data?.map((fullPost) => (
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
