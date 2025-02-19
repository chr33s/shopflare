/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type ShopQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type ShopQuery = { shop: Pick<AdminTypes.Shop, 'name'> };

export type ShopifyAppShopNameQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type ShopifyAppShopNameQuery = { shop: Pick<AdminTypes.Shop, 'name'> };

interface GeneratedQueryTypes {
  "\n      #graphql\n      query Shop {\n        shop {\n          name\n        }\n      }\n    ": {return: ShopQuery, variables: ShopQueryVariables},
  "#graphql\n\t\t\t\t\t\t\tquery ShopifyAppShopName {\n\t\t\t\t\t\t\t\tshop {\n\t\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t": {return: ShopifyAppShopNameQuery, variables: ShopifyAppShopNameQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
