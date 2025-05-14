import { Hono } from "hono";
import { csrf } from "hono/csrf";
import { showRoutes } from "hono/dev";
import { secureHeaders } from "hono/secure-headers";
import { createApp } from "honox/server";

const base = new Hono();
base.use(csrf());
base.use(secureHeaders());

const app = createApp({ app: base });

showRoutes(app);

export default app;
