/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type ShopQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type ShopQuery = { shop: Pick<AdminTypes.Shop, 'name'> };

interface GeneratedQueryTypes {
  "\n\t\t\t#graphql\n\t\t\tquery Shop {\n\t\t\t\tshop {\n\t\t\t\t\tname\n\t\t\t\t}\n\t\t\t}\n\t\t": {return: ShopQuery, variables: ShopQueryVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tquery Shop {\n\t\t\t\t\t\tshop {\n\t\t\t\t\t\t\tname\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: ShopQuery, variables: ShopQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
