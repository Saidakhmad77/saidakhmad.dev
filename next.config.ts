import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    // Turbopack requires plugin NAMES as strings (not function refs) — JS
    // functions can't be passed to the Rust pipeline. See the Turbopack note
    // in node_modules/next/dist/docs/01-app/02-guides/mdx.md.
    //   remark-frontmatter: recognizes the YAML `---` block as a frontmatter
    //     node so it is NOT rendered as body content (frontmatter values are
    //     read separately via gray-matter in lib/writing.ts). Must run first.
    //   remark-gfm: GitHub-flavored markdown — pipe tables, strikethrough.
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
