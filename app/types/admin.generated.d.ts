/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type ShopQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type ShopQuery = { shop: Pick<AdminTypes.Shop, 'name'> };

export type BillingCheckQueryVariables = AdminTypes.Exact<{
  cursor?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type BillingCheckQuery = { currentAppInstallation: { activeSubscriptions: Array<Pick<AdminTypes.AppSubscription, 'id' | 'name' | 'test' | 'status'>>, oneTimePurchases: { nodes: Array<Pick<AdminTypes.AppPurchaseOneTime, 'id' | 'name' | 'test' | 'status'>>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'> } } };

export type BulkOperationCancelMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type BulkOperationCancelMutation = { bulkOperationCancel?: AdminTypes.Maybe<{ bulkOperation?: AdminTypes.Maybe<Pick<AdminTypes.BulkOperation, 'errorCode' | 'id' | 'status' | 'type'>>, userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>> }> };

export type CurrentBulkOperationQueryVariables = AdminTypes.Exact<{
  type: AdminTypes.BulkOperationType;
}>;


export type CurrentBulkOperationQuery = { currentBulkOperation?: AdminTypes.Maybe<Pick<AdminTypes.BulkOperation, 'errorCode' | 'id' | 'type' | 'status' | 'url'>> };

export type BulkOperationRunMutationMutationVariables = AdminTypes.Exact<{
  clientIdentifier?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  groupObjects: AdminTypes.Scalars['Boolean']['input'];
  mutation: AdminTypes.Scalars['String']['input'];
  stagedUploadPath: AdminTypes.Scalars['String']['input'];
}>;


export type BulkOperationRunMutationMutation = { bulkOperationRunMutation?: AdminTypes.Maybe<{ bulkOperation?: AdminTypes.Maybe<Pick<AdminTypes.BulkOperation, 'errorCode' | 'id' | 'partialDataUrl' | 'status' | 'type' | 'url'>>, userErrors: Array<Pick<AdminTypes.BulkMutationUserError, 'field' | 'message'>> }> };

export type BulkOperationRunQueryMutationVariables = AdminTypes.Exact<{
  groupObjects: AdminTypes.Scalars['Boolean']['input'];
  query: AdminTypes.Scalars['String']['input'];
}>;


export type BulkOperationRunQueryMutation = { bulkOperationRunQuery?: AdminTypes.Maybe<{ bulkOperation?: AdminTypes.Maybe<Pick<AdminTypes.BulkOperation, 'errorCode' | 'id' | 'partialDataUrl' | 'status' | 'type' | 'url'>>, userErrors: Array<Pick<AdminTypes.BulkOperationUserError, 'field' | 'message'>> }> };

export type MetafieldDefinitionQueryVariables = AdminTypes.Exact<{
  identifier: AdminTypes.MetafieldDefinitionIdentifierInput;
}>;


export type MetafieldDefinitionQuery = { metafieldDefinition?: AdminTypes.Maybe<Pick<AdminTypes.MetafieldDefinition, 'id'>> };

export type MetafieldDefinitionCreateMutationVariables = AdminTypes.Exact<{
  definition: AdminTypes.MetafieldDefinitionInput;
}>;


export type MetafieldDefinitionCreateMutation = { metafieldDefinitionCreate?: AdminTypes.Maybe<{ createdDefinition?: AdminTypes.Maybe<Pick<AdminTypes.MetafieldDefinition, 'id' | 'name'>>, userErrors: Array<Pick<AdminTypes.MetafieldDefinitionCreateUserError, 'code' | 'field' | 'message'>> }> };

export type MetafieldDefinitionUpdateMutationVariables = AdminTypes.Exact<{
  definition: AdminTypes.MetafieldDefinitionUpdateInput;
}>;


export type MetafieldDefinitionUpdateMutation = { metafieldDefinitionUpdate?: AdminTypes.Maybe<{ updatedDefinition?: AdminTypes.Maybe<Pick<AdminTypes.MetafieldDefinition, 'id' | 'name'>>, userErrors: Array<Pick<AdminTypes.MetafieldDefinitionUpdateUserError, 'code' | 'field' | 'message'>> }> };

export type MetafieldDefinitionDeleteMutationVariables = AdminTypes.Exact<{
  identifier: AdminTypes.MetafieldDefinitionIdentifierInput;
  deleteAllAssociatedMetafields: AdminTypes.Scalars['Boolean']['input'];
}>;


export type MetafieldDefinitionDeleteMutation = { metafieldDefinitionDelete?: AdminTypes.Maybe<(
    Pick<AdminTypes.MetafieldDefinitionDeletePayload, 'deletedDefinitionId'>
    & { userErrors: Array<Pick<AdminTypes.MetafieldDefinitionDeleteUserError, 'code' | 'field' | 'message'>> }
  )> };

export type MetafieldsSetMutationVariables = AdminTypes.Exact<{
  metafields: Array<AdminTypes.MetafieldsSetInput> | AdminTypes.MetafieldsSetInput;
}>;


export type MetafieldsSetMutation = { metafieldsSet?: AdminTypes.Maybe<{ metafields?: AdminTypes.Maybe<Array<Pick<AdminTypes.Metafield, 'key' | 'namespace' | 'value' | 'createdAt' | 'updatedAt'>>>, userErrors: Array<Pick<AdminTypes.MetafieldsSetUserError, 'code' | 'field' | 'message'>> }> };

export type MetafieldDeleteMutationVariables = AdminTypes.Exact<{
  metafields: Array<AdminTypes.MetafieldIdentifierInput> | AdminTypes.MetafieldIdentifierInput;
}>;


export type MetafieldDeleteMutation = { metafieldsDelete?: AdminTypes.Maybe<{ deletedMetafields?: AdminTypes.Maybe<Array<AdminTypes.Maybe<Pick<AdminTypes.MetafieldIdentifier, 'key' | 'namespace' | 'ownerId'>>>>, userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>> }> };

type MetafieldNodesFragment_P0QbxsDvoI0bGQdfOyaK9cAg67CJcsmqfjzzTcAjA_Fragment = { metafields: { nodes: Array<Pick<AdminTypes.Metafield, 'id' | 'key' | 'namespace' | 'value'>> } };

type MetafieldNodesFragment_MFHkAy5MopcoZ1HpzEQjuQx8dmnryuwc3YkeGoBwi_Fragment = { metafields: { nodes: Array<Pick<AdminTypes.Metafield, 'id' | 'key' | 'namespace' | 'value'>> } };

export type MetafieldNodesFragmentFragment = MetafieldNodesFragment_P0QbxsDvoI0bGQdfOyaK9cAg67CJcsmqfjzzTcAjA_Fragment | MetafieldNodesFragment_MFHkAy5MopcoZ1HpzEQjuQx8dmnryuwc3YkeGoBwi_Fragment;

export type MetafieldsQueryVariables = AdminTypes.Exact<{
  cursor?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  first?: AdminTypes.InputMaybe<AdminTypes.Scalars['Int']['input']>;
  keys?: AdminTypes.InputMaybe<Array<AdminTypes.Scalars['String']['input']> | AdminTypes.Scalars['String']['input']>;
  namespace?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  ownerId: AdminTypes.Scalars['ID']['input'];
}>;


export type MetafieldsQuery = { node?: AdminTypes.Maybe<{ metafields: { nodes: Array<Pick<AdminTypes.Metafield, 'id' | 'key' | 'namespace' | 'value'>> } }> };

type MetafieldNodeFragment_P0QbxsDvoI0bGQdfOyaK9cAg67CJcsmqfjzzTcAjA_Fragment = { metafield?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'key' | 'namespace' | 'value'>> };

type MetafieldNodeFragment_MFHkAy5MopcoZ1HpzEQjuQx8dmnryuwc3YkeGoBwi_Fragment = { metafield?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'key' | 'namespace' | 'value'>> };

export type MetafieldNodeFragmentFragment = MetafieldNodeFragment_P0QbxsDvoI0bGQdfOyaK9cAg67CJcsmqfjzzTcAjA_Fragment | MetafieldNodeFragment_MFHkAy5MopcoZ1HpzEQjuQx8dmnryuwc3YkeGoBwi_Fragment;

export type MetafieldQueryVariables = AdminTypes.Exact<{
  key: AdminTypes.Scalars['String']['input'];
  namespace?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  ownerId: AdminTypes.Scalars['ID']['input'];
}>;


export type MetafieldQuery = { node?: AdminTypes.Maybe<{ metafield?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'key' | 'namespace' | 'value'>> }> };

export type MetaobjectDefinitionQueryVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type MetaobjectDefinitionQuery = { metaobjectDefinition?: AdminTypes.Maybe<Pick<AdminTypes.MetaobjectDefinition, 'id'>> };

export type MetaobjectDefinitionCreateMutationVariables = AdminTypes.Exact<{
  definition: AdminTypes.MetaobjectDefinitionCreateInput;
}>;


export type MetaobjectDefinitionCreateMutation = { metaobjectDefinitionCreate?: AdminTypes.Maybe<{ metaobjectDefinition?: AdminTypes.Maybe<(
      Pick<AdminTypes.MetaobjectDefinition, 'name' | 'type'>
      & { fieldDefinitions: Array<Pick<AdminTypes.MetaobjectFieldDefinition, 'name' | 'key'>> }
    )>, userErrors: Array<Pick<AdminTypes.MetaobjectUserError, 'code' | 'field' | 'message'>> }> };

export type MetaobjectDefinitionUpdateMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
  definition: AdminTypes.MetaobjectDefinitionUpdateInput;
}>;


export type MetaobjectDefinitionUpdateMutation = { metaobjectDefinitionUpdate?: AdminTypes.Maybe<{ metaobjectDefinition?: AdminTypes.Maybe<(
      Pick<AdminTypes.MetaobjectDefinition, 'id' | 'name' | 'displayNameKey'>
      & { fieldDefinitions: Array<(
        Pick<AdminTypes.MetaobjectFieldDefinition, 'name' | 'key'>
        & { type: Pick<AdminTypes.MetafieldDefinitionType, 'name'> }
      )> }
    )>, userErrors: Array<Pick<AdminTypes.MetaobjectUserError, 'code' | 'field' | 'message'>> }> };

export type MetaobjectDefinitionDeleteMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type MetaobjectDefinitionDeleteMutation = { metaobjectDefinitionDelete?: AdminTypes.Maybe<(
    Pick<AdminTypes.MetaobjectDefinitionDeletePayload, 'deletedId'>
    & { userErrors: Array<Pick<AdminTypes.MetaobjectUserError, 'code' | 'field' | 'message'>> }
  )> };

export type MetaobjectUpsertMutationVariables = AdminTypes.Exact<{
  handle: AdminTypes.MetaobjectHandleInput;
  metaobject: AdminTypes.MetaobjectUpsertInput;
}>;


export type MetaobjectUpsertMutation = { metaobjectUpsert?: AdminTypes.Maybe<{ metaobject?: AdminTypes.Maybe<(
      Pick<AdminTypes.Metaobject, 'displayName' | 'handle' | 'id'>
      & { fields: Array<Pick<AdminTypes.MetaobjectField, 'key' | 'type' | 'value'>> }
    )>, userErrors: Array<Pick<AdminTypes.MetaobjectUserError, 'code' | 'field' | 'message'>> }> };

export type MetaobjectDeleteMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type MetaobjectDeleteMutation = { metaobjectDelete?: AdminTypes.Maybe<(
    Pick<AdminTypes.MetaobjectDeletePayload, 'deletedId'>
    & { userErrors: Array<Pick<AdminTypes.MetaobjectUserError, 'code' | 'field' | 'message'>> }
  )> };

export type MetaobjectQueryVariables = AdminTypes.Exact<{
  handle: AdminTypes.MetaobjectHandleInput;
}>;


export type MetaobjectQuery = { metaobjectByHandle?: AdminTypes.Maybe<Pick<AdminTypes.Metaobject, 'id'>> };

export type MetaobjectsQueryVariables = AdminTypes.Exact<{
  cursor?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  first?: AdminTypes.InputMaybe<AdminTypes.Scalars['Int']['input']>;
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  type: AdminTypes.Scalars['String']['input'];
}>;


export type MetaobjectsQuery = { metaobjects: { nodes: Array<Pick<AdminTypes.Metaobject, 'id'>> } };

export type StagedUploadsCreateMutationVariables = AdminTypes.Exact<{
  input: Array<AdminTypes.StagedUploadInput> | AdminTypes.StagedUploadInput;
}>;


export type StagedUploadsCreateMutation = { stagedUploadsCreate?: AdminTypes.Maybe<{ stagedTargets?: AdminTypes.Maybe<Array<(
      Pick<AdminTypes.StagedMediaUploadTarget, 'url' | 'resourceUrl'>
      & { parameters: Array<Pick<AdminTypes.StagedUploadParameter, 'name' | 'value'>> }
    )>>, userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>> }> };

export type FileCreateMutationVariables = AdminTypes.Exact<{
  files: Array<AdminTypes.FileCreateInput> | AdminTypes.FileCreateInput;
}>;


export type FileCreateMutation = { fileCreate?: AdminTypes.Maybe<{ files?: AdminTypes.Maybe<Array<(
      Pick<AdminTypes.ExternalVideo, 'id'>
      & { fileErrors: Array<Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>> }
    ) | (
      Pick<AdminTypes.GenericFile, 'id'>
      & { fileErrors: Array<Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>> }
    ) | (
      Pick<AdminTypes.MediaImage, 'id'>
      & { fileErrors: Array<Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>> }
    ) | (
      Pick<AdminTypes.Model3d, 'id'>
      & { fileErrors: Array<Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>> }
    ) | (
      Pick<AdminTypes.Video, 'id'>
      & { fileErrors: Array<Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>> }
    )>>, userErrors: Array<Pick<AdminTypes.FilesUserError, 'code' | 'field' | 'message'>> }> };

export type FileQueryVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type FileQuery = { node?: AdminTypes.Maybe<(
    { __typename: 'GenericFile' }
    & Pick<AdminTypes.GenericFile, 'fileStatus' | 'id' | 'url'>
    & { fileErrors: Array<Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>> }
  ) | (
    { __typename: 'MediaImage' }
    & Pick<AdminTypes.MediaImage, 'fileStatus' | 'id'>
    & { fileErrors: Array<Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>>, image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }
  ) | (
    { __typename: 'Model3d' }
    & Pick<AdminTypes.Model3d, 'fileStatus' | 'id'>
    & { fileErrors: Array<Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>>, originalSource?: AdminTypes.Maybe<Pick<AdminTypes.Model3dSource, 'url'>> }
  ) | (
    { __typename: 'Video' }
    & Pick<AdminTypes.Video, 'fileStatus' | 'id'>
    & { fileErrors: Array<Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>>, originalSource?: AdminTypes.Maybe<Pick<AdminTypes.VideoSource, 'url'>> }
  )> };

interface GeneratedQueryTypes {
  "\n\t\t\t#graphql\n\t\t\tquery Shop {\n\t\t\t\tshop {\n\t\t\t\t\tname\n\t\t\t\t}\n\t\t\t}\n\t\t": {return: ShopQuery, variables: ShopQueryVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tquery Shop {\n\t\t\t\t\t\tshop {\n\t\t\t\t\t\t\tname\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: ShopQuery, variables: ShopQueryVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tquery BillingCheck($cursor: String) {\n\t\t\t\t\t\tcurrentAppInstallation {\n\t\t\t\t\t\t\tactiveSubscriptions {\n\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\ttest\n\t\t\t\t\t\t\t\tstatus\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\toneTimePurchases(\n\t\t\t\t\t\t\t\tfirst: 250\n\t\t\t\t\t\t\t\tsortKey: CREATED_AT\n\t\t\t\t\t\t\t\tafter: $cursor\n\t\t\t\t\t\t\t) {\n\t\t\t\t\t\t\t\tnodes {\n\t\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\t\ttest\n\t\t\t\t\t\t\t\t\tstatus\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tpageInfo {\n\t\t\t\t\t\t\t\t\thasNextPage\n\t\t\t\t\t\t\t\t\tendCursor\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: BillingCheckQuery, variables: BillingCheckQueryVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tquery CurrentBulkOperation($type: BulkOperationType!) {\n\t\t\t\t\t\tcurrentBulkOperation(type: $type) {\n\t\t\t\t\t\t\terrorCode\n\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\ttype\n\t\t\t\t\t\t\tstatus\n\t\t\t\t\t\t\turl\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: CurrentBulkOperationQuery, variables: CurrentBulkOperationQueryVariables},
  "\n\t\t\t\t\t\t#graphql\n\t\t\t\t\t\tquery MetafieldDefinition(\n\t\t\t\t\t\t\t$identifier: MetafieldDefinitionIdentifierInput!\n\t\t\t\t\t\t) {\n\t\t\t\t\t\t\tmetafieldDefinition(identifier: $identifier) {\n\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t": {return: MetafieldDefinitionQuery, variables: MetafieldDefinitionQueryVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tfragment MetafieldNodesFragment on HasMetafields {\n\t\t\t\t\t\tmetafields(\n\t\t\t\t\t\t\tafter: $cursor\n\t\t\t\t\t\t\tfirst: $first\n\t\t\t\t\t\t\tkeys: $keys\n\t\t\t\t\t\t\tnamespace: $namespace\n\t\t\t\t\t\t) {\n\t\t\t\t\t\t\tnodes {\n\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t\tkey\n\t\t\t\t\t\t\t\tnamespace\n\t\t\t\t\t\t\t\tvalue\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\n\t\t\t\t\tquery Metafields(\n\t\t\t\t\t\t$cursor: String\n\t\t\t\t\t\t$first: Int = 10\n\t\t\t\t\t\t$keys: [String!]\n\t\t\t\t\t\t$namespace: String\n\t\t\t\t\t\t$ownerId: ID!\n\t\t\t\t\t) {\n\t\t\t\t\t\tnode(id: $ownerId) {\n\t\t\t\t\t\t\t... on AppInstallation {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Article {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Blog {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Collection {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Company {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on CompanyLocation {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Customer {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on DeliveryCustomization {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on DiscountAutomaticNode {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on DiscountCodeNode {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on DiscountNode {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on DraftOrder {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Location {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Market {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Order {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Page {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on PaymentCustomization {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Product {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on ProductVariant {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Shop {\n\t\t\t\t\t\t\t\t...MetafieldNodesFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: MetafieldsQuery, variables: MetafieldsQueryVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tfragment MetafieldNodeFragment on HasMetafields {\n\t\t\t\t\t\tmetafield(key: $key, namespace: $namespace) {\n\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\tkey\n\t\t\t\t\t\t\tnamespace\n\t\t\t\t\t\t\tvalue\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\n\t\t\t\t\tquery Metafield($key: String!, $namespace: String, $ownerId: ID!) {\n\t\t\t\t\t\tnode(id: $ownerId) {\n\t\t\t\t\t\t\t... on AppInstallation {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Article {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Blog {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Collection {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Company {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on CompanyLocation {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Customer {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on DeliveryCustomization {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on DiscountAutomaticNode {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on DiscountCodeNode {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on DiscountNode {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on DraftOrder {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Location {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Market {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Order {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Page {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on PaymentCustomization {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Product {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on ProductVariant {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t... on Shop {\n\t\t\t\t\t\t\t\t...MetafieldNodeFragment\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: MetafieldQuery, variables: MetafieldQueryVariables},
  "\n\t\t\t\t\t\t#graphql\n\t\t\t\t\t\tquery MetaobjectDefinition($id: ID!) {\n\t\t\t\t\t\t\tmetaobjectDefinition(id: $id) {\n\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t": {return: MetaobjectDefinitionQuery, variables: MetaobjectDefinitionQueryVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tquery Metaobject($handle: MetaobjectHandleInput!) {\n\t\t\t\t\t\tmetaobjectByHandle(handle: $handle) {\n\t\t\t\t\t\t\tid\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: MetaobjectQuery, variables: MetaobjectQueryVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tquery Metaobjects(\n\t\t\t\t\t\t$cursor: String\n\t\t\t\t\t\t$first: Int = 10\n\t\t\t\t\t\t$query: String\n\t\t\t\t\t\t$type: String!\n\t\t\t\t\t) {\n\t\t\t\t\t\tmetaobjects(\n\t\t\t\t\t\t\tafter: $cursor\n\t\t\t\t\t\t\tfirst: $first\n\t\t\t\t\t\t\tquery: $query\n\t\t\t\t\t\t\ttype: $type\n\t\t\t\t\t\t) {\n\t\t\t\t\t\t\tnodes {\n\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: MetaobjectsQuery, variables: MetaobjectsQueryVariables},
  "\n\t\t\t\t\t\t#graphql\n\t\t\t\t\t\tquery File($id: ID!) {\n\t\t\t\t\t\t\tnode(id: $id) {\n\t\t\t\t\t\t\t\t... on GenericFile {\n\t\t\t\t\t\t\t\t\t__typename\n\t\t\t\t\t\t\t\t\tfileErrors {\n\t\t\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\t\t\tdetails\n\t\t\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\tfileStatus\n\t\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t\t\turl\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t... on MediaImage {\n\t\t\t\t\t\t\t\t\t__typename\n\t\t\t\t\t\t\t\t\tfileErrors {\n\t\t\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\t\t\tdetails\n\t\t\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\tfileStatus\n\t\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t\t\timage {\n\t\t\t\t\t\t\t\t\t\turl\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t... on Model3d {\n\t\t\t\t\t\t\t\t\t__typename\n\t\t\t\t\t\t\t\t\tfileErrors {\n\t\t\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\t\t\tdetails\n\t\t\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\tfileStatus\n\t\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t\t\toriginalSource {\n\t\t\t\t\t\t\t\t\t\turl\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t... on Video {\n\t\t\t\t\t\t\t\t\t__typename\n\t\t\t\t\t\t\t\t\tfileErrors {\n\t\t\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\t\t\tdetails\n\t\t\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\tfileStatus\n\t\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t\t\toriginalSource {\n\t\t\t\t\t\t\t\t\t\turl\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t": {return: FileQuery, variables: FileQueryVariables},
}

interface GeneratedMutationTypes {
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tmutation BulkOperationCancel($id: ID!) {\n\t\t\t\t\t\tbulkOperationCancel(id: $id) {\n\t\t\t\t\t\t\tbulkOperation {\n\t\t\t\t\t\t\t\terrorCode\n\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t\tstatus\n\t\t\t\t\t\t\t\ttype\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: BulkOperationCancelMutation, variables: BulkOperationCancelMutationVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tmutation BulkOperationRunMutation(\n\t\t\t\t\t\t$clientIdentifier: String\n\t\t\t\t\t\t$groupObjects: Boolean!\n\t\t\t\t\t\t$mutation: String!\n\t\t\t\t\t\t$stagedUploadPath: String!\n\t\t\t\t\t) {\n\t\t\t\t\t\tbulkOperationRunMutation(\n\t\t\t\t\t\t\tclientIdentifier: $clientIdentifier\n\t\t\t\t\t\t\tgroupObjects: $groupObjects\n\t\t\t\t\t\t\tmutation: $mutation\n\t\t\t\t\t\t\tstagedUploadPath: $stagedUploadPath\n\t\t\t\t\t\t) {\n\t\t\t\t\t\t\tbulkOperation {\n\t\t\t\t\t\t\t\terrorCode\n\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t\tpartialDataUrl\n\t\t\t\t\t\t\t\tstatus\n\t\t\t\t\t\t\t\ttype\n\t\t\t\t\t\t\t\turl\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: BulkOperationRunMutationMutation, variables: BulkOperationRunMutationMutationVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tmutation BulkOperationRunQuery(\n\t\t\t\t\t\t$groupObjects: Boolean!\n\t\t\t\t\t\t$query: String!\n\t\t\t\t\t) {\n\t\t\t\t\t\tbulkOperationRunQuery(groupObjects: $groupObjects, query: $query) {\n\t\t\t\t\t\t\tbulkOperation {\n\t\t\t\t\t\t\t\terrorCode\n\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t\tpartialDataUrl\n\t\t\t\t\t\t\t\tstatus\n\t\t\t\t\t\t\t\ttype\n\t\t\t\t\t\t\t\turl\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: BulkOperationRunQueryMutation, variables: BulkOperationRunQueryMutationVariables},
  "\n\t\t\t\t\t\t#graphql\n\t\t\t\t\t\tmutation MetafieldDefinitionCreate(\n\t\t\t\t\t\t\t$definition: MetafieldDefinitionInput!\n\t\t\t\t\t\t) {\n\t\t\t\t\t\t\tmetafieldDefinitionCreate(definition: $definition) {\n\t\t\t\t\t\t\t\tcreatedDefinition {\n\t\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t": {return: MetafieldDefinitionCreateMutation, variables: MetafieldDefinitionCreateMutationVariables},
  "\n\t\t\t\t\t\t#graphql\n\t\t\t\t\t\tmutation MetafieldDefinitionUpdate(\n\t\t\t\t\t\t\t$definition: MetafieldDefinitionUpdateInput!\n\t\t\t\t\t\t) {\n\t\t\t\t\t\t\tmetafieldDefinitionUpdate(definition: $definition) {\n\t\t\t\t\t\t\t\tupdatedDefinition {\n\t\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t": {return: MetafieldDefinitionUpdateMutation, variables: MetafieldDefinitionUpdateMutationVariables},
  "\n\t\t\t\t\t\t#graphql\n\t\t\t\t\t\tmutation MetafieldDefinitionDelete(\n\t\t\t\t\t\t\t$identifier: MetafieldDefinitionIdentifierInput!\n\t\t\t\t\t\t\t$deleteAllAssociatedMetafields: Boolean!\n\t\t\t\t\t\t) {\n\t\t\t\t\t\t\tmetafieldDefinitionDelete(\n\t\t\t\t\t\t\t\tidentifier: $identifier\n\t\t\t\t\t\t\t\tdeleteAllAssociatedMetafields: $deleteAllAssociatedMetafields\n\t\t\t\t\t\t\t) {\n\t\t\t\t\t\t\t\tdeletedDefinitionId\n\t\t\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t": {return: MetafieldDefinitionDeleteMutation, variables: MetafieldDefinitionDeleteMutationVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tmutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {\n\t\t\t\t\t\tmetafieldsSet(metafields: $metafields) {\n\t\t\t\t\t\t\tmetafields {\n\t\t\t\t\t\t\t\tkey\n\t\t\t\t\t\t\t\tnamespace\n\t\t\t\t\t\t\t\tvalue\n\t\t\t\t\t\t\t\tcreatedAt\n\t\t\t\t\t\t\t\tupdatedAt\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: MetafieldsSetMutation, variables: MetafieldsSetMutationVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tmutation MetafieldDelete($metafields: [MetafieldIdentifierInput!]!) {\n\t\t\t\t\t\tmetafieldsDelete(metafields: $metafields) {\n\t\t\t\t\t\t\tdeletedMetafields {\n\t\t\t\t\t\t\t\tkey\n\t\t\t\t\t\t\t\tnamespace\n\t\t\t\t\t\t\t\townerId\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: MetafieldDeleteMutation, variables: MetafieldDeleteMutationVariables},
  "\n\t\t\t\t\t\t#graphql\n\t\t\t\t\t\tmutation MetaobjectDefinitionCreate(\n\t\t\t\t\t\t\t$definition: MetaobjectDefinitionCreateInput!\n\t\t\t\t\t\t) {\n\t\t\t\t\t\t\tmetaobjectDefinitionCreate(definition: $definition) {\n\t\t\t\t\t\t\t\tmetaobjectDefinition {\n\t\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\t\ttype\n\t\t\t\t\t\t\t\t\tfieldDefinitions {\n\t\t\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\t\t\tkey\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t": {return: MetaobjectDefinitionCreateMutation, variables: MetaobjectDefinitionCreateMutationVariables},
  "\n\t\t\t\t\t\t#graphql\n\t\t\t\t\t\tmutation MetaobjectDefinitionUpdate(\n\t\t\t\t\t\t\t$id: ID!\n\t\t\t\t\t\t\t$definition: MetaobjectDefinitionUpdateInput!\n\t\t\t\t\t\t) {\n\t\t\t\t\t\t\tmetaobjectDefinitionUpdate(id: $id, definition: $definition) {\n\t\t\t\t\t\t\t\tmetaobjectDefinition {\n\t\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\t\tdisplayNameKey\n\t\t\t\t\t\t\t\t\tfieldDefinitions {\n\t\t\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\t\t\tkey\n\t\t\t\t\t\t\t\t\t\ttype {\n\t\t\t\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t": {return: MetaobjectDefinitionUpdateMutation, variables: MetaobjectDefinitionUpdateMutationVariables},
  "\n\t\t\t\t\t\t#graphql\n\t\t\t\t\t\tmutation MetaobjectDefinitionDelete($id: ID!) {\n\t\t\t\t\t\t\tmetaobjectDefinitionDelete(id: $id) {\n\t\t\t\t\t\t\t\tdeletedId\n\t\t\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t": {return: MetaobjectDefinitionDeleteMutation, variables: MetaobjectDefinitionDeleteMutationVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tmutation MetaobjectUpsert(\n\t\t\t\t\t\t$handle: MetaobjectHandleInput!\n\t\t\t\t\t\t$metaobject: MetaobjectUpsertInput!\n\t\t\t\t\t) {\n\t\t\t\t\t\tmetaobjectUpsert(handle: $handle, metaobject: $metaobject) {\n\t\t\t\t\t\t\tmetaobject {\n\t\t\t\t\t\t\t\tdisplayName\n\t\t\t\t\t\t\t\tfields {\n\t\t\t\t\t\t\t\t\tkey\n\t\t\t\t\t\t\t\t\ttype\n\t\t\t\t\t\t\t\t\tvalue\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\thandle\n\t\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: MetaobjectUpsertMutation, variables: MetaobjectUpsertMutationVariables},
  "\n\t\t\t\t\t#graphql\n\t\t\t\t\tmutation MetaobjectDelete($id: ID!) {\n\t\t\t\t\t\tmetaobjectDelete(id: $id) {\n\t\t\t\t\t\t\tdeletedId\n\t\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t": {return: MetaobjectDeleteMutation, variables: MetaobjectDeleteMutationVariables},
  "\n\t\t\t\t#graphql\n\t\t\t\tmutation StagedUploadsCreate($input: [StagedUploadInput!]!) {\n\t\t\t\t\tstagedUploadsCreate(input: $input) {\n\t\t\t\t\t\tstagedTargets {\n\t\t\t\t\t\t\turl\n\t\t\t\t\t\t\tresourceUrl\n\t\t\t\t\t\t\tparameters {\n\t\t\t\t\t\t\t\tname\n\t\t\t\t\t\t\t\tvalue\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t": {return: StagedUploadsCreateMutation, variables: StagedUploadsCreateMutationVariables},
  "\n\t\t\t\t#graphql\n\t\t\t\tmutation FileCreate($files: [FileCreateInput!]!) {\n\t\t\t\t\tfileCreate(files: $files) {\n\t\t\t\t\t\tfiles {\n\t\t\t\t\t\t\tfileErrors {\n\t\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\t\tdetails\n\t\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tid\n\t\t\t\t\t\t}\n\t\t\t\t\t\tuserErrors {\n\t\t\t\t\t\t\tcode\n\t\t\t\t\t\t\tfield\n\t\t\t\t\t\t\tmessage\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t": {return: FileCreateMutation, variables: FileCreateMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
