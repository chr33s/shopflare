/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from "./admin.types.js";

export type ShopQueryVariables = AdminTypes.Exact<{ [key: string]: never }>;

export type ShopQuery = { shop: Pick<AdminTypes.Shop, "name"> };

interface GeneratedQueryTypes {
	"query Shop {\n  shop {\n    name\n  }\n}": { return: ShopQuery; variables: ShopQueryVariables };
}

interface GeneratedMutationTypes {}
declare module "@shopify/admin-api-client" {
	type InputMaybe<T> = AdminTypes.InputMaybe<T>;
	interface AdminQueries extends GeneratedQueryTypes {}
	interface AdminMutations extends GeneratedMutationTypes {}
}
