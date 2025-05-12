import {} from "hono";
import "@hono/react-renderer";

type Head = {
  /** ウェブサイトのタイトル */
  title?: string;
  /** ウェブサイトの説明 */
  description?: string;
};

declare module "@hono/react-renderer" {
  interface Props extends Head {}
}

declare module "hono" {
  interface Env {
    Variables: Record<never, never>;
    Bindings: Record<never, never>;
  }
  type ContextRenderer = (
    content: string | Promise<string>,
    head?: Head,
  ) => Response | Promise<Response>;
}
