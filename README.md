# paraxor.dev

Personal blog and website. Technical deep dives, mostly. The occasional RE rabbit hole :)

Built on [nullpt.rs](https://github.com/nullpt-rs/blog) blog template (CC BY-NC-SA 4.0).

### Running locally

```bash
pnpm install
pnpm dev
```

### Deploying

```bash
pnpm build
wrangler deploy --config build/server/wrangler.json
```

### Creating a new post

Create an MDX file at `app/posts/<year>/<month>/<post-name>.mdx`:

```md
---
slug: slug-for-the-post
date: Apr 2 2026
author: aniketh
name: Your Post Title
excerpt: A summary of the blog post
keywords: comma,separated,keywords
---
```
