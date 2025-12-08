import {
  type AppLoadContext,
  createContext,
  createRequestHandler,
  RouterContextProvider,
} from "react-router";

import { queueHandler, type QueueHandlerMessage } from "#app/queues";

const fetchHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    const appLoadContext = createContext<AppLoadContext>({
      cloudflare: { ctx, env },
    });
    const context = new RouterContextProvider();
    Object.assign(context, appLoadContext);
    return fetchHandler(request, context as any);
  },

  async queue(batch): Promise<void> {
    return queueHandler(batch);
  },
} satisfies ExportedHandler<Env, QueueHandlerMessage>;

export * from "#app/durable-objects";
