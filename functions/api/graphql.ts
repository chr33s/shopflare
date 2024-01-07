import {
	constraintDirectiveTypeDefs,
	createEnvelopQueryValidationPlugin,
} from "graphql-constraint-directive";
import { createSchema, createYoga } from "graphql-yoga";

import type { Env } from "@/functions/types";
import { saveBillingPlan, shopify } from "@/lib/shopify";

const resolvers = {
	Mutation: {
		billingPlan: async (
			_parent: unknown,
			args: {
				input: {
					plan: string;
				};
			},
			context: any,
		) => {
			const confirmationUrl = await saveBillingPlan(context, args.input.plan);
			return { confirmationUrl };
		},
	},
	Query: {
		billingPlans: async (_parent: unknown, _args: any, context: any) => {
			const { billing } = shopify(context).config;
			const billingPlans = Object.entries(billing as any).map(
				([k, v]) => ({
					...(v as any),
					name: k,
				}),
				[],
			);
			return billingPlans;
		},
	},
};

const typeDefs = /* graphql */ `
	type BillingPlan {
		amount: Float
		currencyCode: String
		interval: String
		name: String
		replacementBehavior: String
		trialDays: Int
		usageTerms: String
	}

	input BillingPlanInput {
		plan: String! @constraint(minLength: 2, maxLength: 254)
	}

	type BillingPlanUrl {
		confirmationUrl: String
	}

	type Mutation {
		billingPlan(input: BillingPlanInput!): BillingPlanUrl
	}

	type Query {
		billingPlans: [BillingPlan]
	}
`;

const schema = createSchema({
	resolvers,
	typeDefs: [constraintDirectiveTypeDefs, typeDefs],
});

const yoga = createYoga<Env>({
	graphqlEndpoint: "/api/graphql",
	plugins: [createEnvelopQueryValidationPlugin()],
	schema,
});

export const onRequest = yoga;
