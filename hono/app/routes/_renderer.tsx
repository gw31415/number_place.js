import { reactRenderer } from "@hono/react-renderer";
import { Link, Script } from "honox/server";

export default reactRenderer(({ children, title, description }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content={
            description ??
            "Instantly solve any Sudoku puzzle with our powerful online Sudoku solver. Enter your puzzle and get the solution in seconds—free, fast, and easy to use."
          }
        />
        <title>{title ?? "Solve Sudoku"}</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <Link rel="stylesheet" href="/app/style.css" />
        <Script src="/app/client.ts" async />
      </head>
      <body className="overflow-hidden">{children}</body>
    </html>
  );
});
