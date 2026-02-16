/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as CustomerTypes from "./customer.types.d.ts";

export type ShopQueryVariables = CustomerTypes.Exact<{ [key: string]: never }>;

export type ShopQuery = { shop: Pick<CustomerTypes.Shop, "name"> };

interface GeneratedQueryTypes {
	"query Shop {\n  shop {\n    name\n  }\n}": { return: ShopQuery; variables: ShopQueryVariables };
}

interface GeneratedMutationTypes {}
declare module "@shopify/customer-api-client" {
	type InputMaybe<T> = CustomerTypes.InputMaybe<T>;
	interface CustomerQueries extends GeneratedQueryTypes {}
	interface CustomerMutations extends GeneratedMutationTypes {}
}
