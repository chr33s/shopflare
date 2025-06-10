import {
	WorkflowEntrypoint,
	type WorkflowEvent,
	type WorkflowStep,
} from 'cloudflare:workers';
import type {AppLoadContext} from 'react-router';

import type {QueueMessage as Params} from '~/queues/webhook';
import * as shopify from '~/shopify.server';

type Context = AppLoadContext;
type Event = WorkflowEvent<Params>;
type Step = WorkflowStep;

export class WebhookWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: Event, step: Step) {
		console.log('workflows/webhook#run', event.payload);

		const context = {
			cloudflare: {
				ctx: this.ctx,
				env: this.env,
			},
		} satisfies Context;

		const topic = event.payload.webhook.topic as keyof WebhookWorkflow;
		if (topic in this) {
			// guard against infinite recursion
			if (topic === 'run') return;
			await this[topic](context, event, step);
		}
	}

	async APP_SCOPES_UPDATE(context: Context, event: Event, step: Step) {
		console.log('workflows/webhook#APP_SCOPES_UPDATE', event.payload.webhook);

		const {session} = event.payload;
		if (!session) return;

		await shopify.session(context).set(session.id, null);

		await step.sleep('wait on report', '1 minute');
	}

	async APP_UNINSTALLED(context: Context, event: Event, step: Step) {
		console.log('workflows/webhook#APP_UNINSTALLED', event.payload.webhook);

		const {session, webhook} = event.payload;
		if (!session) return;

		await shopify.session(context).set(session.id, {
			...session,
			scope: (webhook.payload as {current: string[]}).current.toString(),
		});

		await step.sleep('wait on report', '1 minute');
	}
}
