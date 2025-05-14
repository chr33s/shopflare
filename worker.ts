import { DurableObject } from "cloudflare:workers";
import {
	type DrizzleSqliteDODatabase,
	drizzle,
} from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
import { createRequestHandler } from "react-router";

import type { WebhookQueueMessage } from "~/types/app";
import migrations from "./db/migrations/do/migrations";
import { users } from "./db/schema/do";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			ctx: ExecutionContext;
			env: Env;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	},

	async queue(batch, _env, _ctx): Promise<void> {
		console.log(`server.queue: ${JSON.stringify(batch.messages)}`);

		for (const message of batch.messages) {
			message.ack();
		}
	},
} satisfies ExportedHandler<Env, WebhookQueueMessage>;

export class ShopflareDurableObject extends DurableObject {
	storage: DurableObjectStorage;
	db: DrizzleSqliteDODatabase;
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.storage = ctx.storage;
		this.db = drizzle(this.storage, { logger: false });

		ctx.blockConcurrencyWhile(async () => {
			await this._migrate();
		});
	}

	async _migrate() {
		migrate(this.db, migrations);
	}

	async select() {
		return this.db.select().from(users);
	}
}
