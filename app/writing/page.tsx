import type { Metadata } from "next";
import { getAllPosts } from "@/lib/writing";
import { Nav } from "@/components/portfolio/Nav";
import { WritingIndex } from "@/components/portfolio/WritingIndex";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Engineering notes on autonomous-driving simulation, robotics, and systems software.",
};

export default function WritingIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <Nav />
      <main className="relative w-full">
        <div className="relative mx-auto w-full max-w-(--breakpoint-2xl) px-6 pt-28 pb-24 md:px-10 md:pt-36 md:pb-32">
          <WritingIndex posts={posts} />
        </div>
      </main>
    </>
  );
}
