import type { Route } from "./+types/home";
import { slugsToMetadata } from "~/posts/metadata.const";
import { BlogLink } from "~/components/post_link";
import { Link } from "react-router";

export default function Home() {
  const posts = Object.values(slugsToMetadata).map(
    ({ frontmatter }) => frontmatter
  );
  return (
    <div className="w-full md:w-[700px] lg:w-[900px] flex flex-col p-4">
      <div className="flex flex-col gap-2 mb-6">
        <span className="text-6xl" style={{fontFamily: "'Instrument Serif', serif", fontStyle: "italic"}}>aniketh's blog</span>
        <p className="text-neutral-300 text-lg">
          Technical deep dives, mostly. The occasional RE rabbit hole :)
        </p>
        <p className="text-neutral-500 text-sm max-w-[800px]">
          {/* TODO: fill in your about me */}
          Hey! I'm Aniketh, founding engineer at Crustdata (YC F24). 
          <br />
          I like taking things apart to see how they work; mostly software (and my PS5). 
          <br />
          I build in the crawling and search infrastructure space, and the data engineering that ties it together.
          <br />
          Beyond software, you can find me playing Arc Raiders and ice skating.
        </p>
        <div className="flex gap-3">
        </div>
        <p className="text-neutral-500 text-sm">
          find me on{" "}
          <a target="_blank" href="https://www.linkedin.com/in/aniketh-reddimi" className="text-neutral-400 hover:text-white hover:underline" rel="noreferrer">linkedin</a>
          {" / "}
          <a target="_blank" href="https://x.com/thekingofxor" className="text-neutral-400 hover:text-white hover:underline" rel="noreferrer">twitter</a>
          {" / "}
          <a target="_blank" href="https://github.com/p4r4xor" className="text-neutral-400 hover:text-white hover:underline" rel="noreferrer">github</a>
        </p>
        <p className="text-neutral-600 text-xs">
          feel free to reach out at{" "}
          <a href="mailto:hi@paraxor.dev" className="text-neutral-400 hover:text-white hover:underline">
            hi@paraxor.dev
          </a>
        </p>
      </div>

      <div className="flex flex-col w-full md:border-[1px] md:border-transparent border-solid p-4 transition-all border-gradient-animated">
        <main className="space-y-4">
          <ul className="space-y-1 list-disc list-inside">
            {posts
              .filter((post: any) => !post?.hidden)
              .sort((p, p2) => Date.parse(p2.date) - Date.parse(p.date))
              .map((post, postIndex) => (
                <BlogLink
                  tabIndex={postIndex}
                  key={post.slug}
                  date={post.date}
                  author={post.author}
                  href={`/${post.slug}`}
                >
                  {post.name}
                </BlogLink>
              ))}
          </ul>
        </main>
        <footer className="mt-4 space-y-1">
          <span>
            <span className="text-neutral-500">
              Content on this site is licensed
            </span>{" "}
            <Link to="https://creativecommons.org/licenses/by-nc-sa/4.0/">
              CC BY-NC-SA 4.0
            </Link>
          </span>
          <div>
            <span className="text-neutral-600 text-xs">
              Built on{" "}
              <a href="https://github.com/nullpt-rs/blog" className="text-neutral-500 hover:text-white hover:underline" target="_blank" rel="noreferrer">
                nullpt.rs
              </a>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
