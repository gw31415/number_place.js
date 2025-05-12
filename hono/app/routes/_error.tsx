import type { ErrorHandler } from "hono";

const handler: ErrorHandler = (e, c) => {
  if ("getResponse" in e) {
    return e.getResponse();
  }
  console.error(e.message);
  c.status(500);
  return c.render(
    <>
      <h1>500 Internal Server Error</h1>
      <code>{e.message}</code>
    </>,
    { title: "Internal Server Error" },
  );
};

export default handler;
