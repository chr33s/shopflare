/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types.d.ts';

type MetafieldNodeFragment_P0QbxsDvoI0bGQdfOyaK9cAg67CJcsmqfjzzTcAjA_Fragment =
	{
		metafield?: AdminTypes.Maybe<
			Pick<AdminTypes.Metafield, 'id' | 'key' | 'namespace' | 'value'>
		>;
	};

type MetafieldNodeFragment_MFHkAy5MopcoZ1HpzEQjuQx8dmnryuwc3YkeGoBwi_Fragment =
	{
		metafield?: AdminTypes.Maybe<
			Pick<AdminTypes.Metafield, 'id' | 'key' | 'namespace' | 'value'>
		>;
	};

export type MetafieldNodeFragmentFragment =
	| MetafieldNodeFragment_P0QbxsDvoI0bGQdfOyaK9cAg67CJcsmqfjzzTcAjA_Fragment
	| MetafieldNodeFragment_MFHkAy5MopcoZ1HpzEQjuQx8dmnryuwc3YkeGoBwi_Fragment;

type MetafieldNodesFragment_P0QbxsDvoI0bGQdfOyaK9cAg67CJcsmqfjzzTcAjA_Fragment =
	{
		metafields: {
			nodes: Array<
				Pick<AdminTypes.Metafield, 'id' | 'key' | 'namespace' | 'value'>
			>;
		};
	};

type MetafieldNodesFragment_MFHkAy5MopcoZ1HpzEQjuQx8dmnryuwc3YkeGoBwi_Fragment =
	{
		metafields: {
			nodes: Array<
				Pick<AdminTypes.Metafield, 'id' | 'key' | 'namespace' | 'value'>
			>;
		};
	};

export type MetafieldNodesFragmentFragment =
	| MetafieldNodesFragment_P0QbxsDvoI0bGQdfOyaK9cAg67CJcsmqfjzzTcAjA_Fragment
	| MetafieldNodesFragment_MFHkAy5MopcoZ1HpzEQjuQx8dmnryuwc3YkeGoBwi_Fragment;

export type BulkOperationCancelMutationVariables = AdminTypes.Exact<{
	id: AdminTypes.Scalars['ID']['input'];
}>;

export type BulkOperationCancelMutation = {
	bulkOperationCancel?: AdminTypes.Maybe<{
		bulkOperation?: AdminTypes.Maybe<
			Pick<AdminTypes.BulkOperation, 'errorCode' | 'id' | 'status' | 'type'>
		>;
		userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>>;
	}>;
};

export type BulkOperationRunMutationMutationVariables = AdminTypes.Exact<{
	clientIdentifier?: AdminTypes.InputMaybe<
		AdminTypes.Scalars['String']['input']
	>;
	mutation: AdminTypes.Scalars['String']['input'];
	stagedUploadPath: AdminTypes.Scalars['String']['input'];
}>;

export type BulkOperationRunMutationMutation = {
	bulkOperationRunMutation?: AdminTypes.Maybe<{
		bulkOperation?: AdminTypes.Maybe<
			Pick<
				AdminTypes.BulkOperation,
				'errorCode' | 'id' | 'partialDataUrl' | 'status' | 'type' | 'url'
			>
		>;
		userErrors: Array<
			Pick<AdminTypes.BulkMutationUserError, 'field' | 'message'>
		>;
	}>;
};

export type BulkOperationRunQueryMutationVariables = AdminTypes.Exact<{
	query: AdminTypes.Scalars['String']['input'];
}>;

export type BulkOperationRunQueryMutation = {
	bulkOperationRunQuery?: AdminTypes.Maybe<{
		bulkOperation?: AdminTypes.Maybe<
			Pick<
				AdminTypes.BulkOperation,
				'errorCode' | 'id' | 'partialDataUrl' | 'status' | 'type' | 'url'
			>
		>;
		userErrors: Array<
			Pick<AdminTypes.BulkOperationUserError, 'field' | 'message'>
		>;
	}>;
};

export type FileCreateMutationVariables = AdminTypes.Exact<{
	files: Array<AdminTypes.FileCreateInput> | AdminTypes.FileCreateInput;
}>;

export type FileCreateMutation = {
	fileCreate?: AdminTypes.Maybe<{
		files?: AdminTypes.Maybe<
			Array<
				| (Pick<AdminTypes.ExternalVideo, 'id'> & {
						fileErrors: Array<
							Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>
						>;
				  })
				| (Pick<AdminTypes.GenericFile, 'id'> & {
						fileErrors: Array<
							Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>
						>;
				  })
				| (Pick<AdminTypes.MediaImage, 'id'> & {
						fileErrors: Array<
							Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>
						>;
				  })
				| (Pick<AdminTypes.Model3d, 'id'> & {
						fileErrors: Array<
							Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>
						>;
				  })
				| (Pick<AdminTypes.Video, 'id'> & {
						fileErrors: Array<
							Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>
						>;
				  })
			>
		>;
		userErrors: Array<
			Pick<AdminTypes.FilesUserError, 'code' | 'field' | 'message'>
		>;
	}>;
};

export type MetafieldDefinitionCreateMutationVariables = AdminTypes.Exact<{
	definition: AdminTypes.MetafieldDefinitionInput;
}>;

export type MetafieldDefinitionCreateMutation = {
	metafieldDefinitionCreate?: AdminTypes.Maybe<{
		createdDefinition?: AdminTypes.Maybe<
			Pick<AdminTypes.MetafieldDefinition, 'id' | 'name'>
		>;
		userErrors: Array<
			Pick<
				AdminTypes.MetafieldDefinitionCreateUserError,
				'code' | 'field' | 'message'
			>
		>;
	}>;
};

export type MetafieldDefinitionDeleteMutationVariables = AdminTypes.Exact<{
	identifier: AdminTypes.MetafieldDefinitionIdentifierInput;
	deleteAllAssociatedMetafields: AdminTypes.Scalars['Boolean']['input'];
}>;

export type MetafieldDefinitionDeleteMutation = {
	metafieldDefinitionDelete?: AdminTypes.Maybe<
		Pick<AdminTypes.MetafieldDefinitionDeletePayload, 'deletedDefinitionId'> & {
			userErrors: Array<
				Pick<
					AdminTypes.MetafieldDefinitionDeleteUserError,
					'code' | 'field' | 'message'
				>
			>;
		}
	>;
};

export type MetafieldDefinitionUpdateMutationVariables = AdminTypes.Exact<{
	definition: AdminTypes.MetafieldDefinitionUpdateInput;
}>;

export type MetafieldDefinitionUpdateMutation = {
	metafieldDefinitionUpdate?: AdminTypes.Maybe<{
		updatedDefinition?: AdminTypes.Maybe<
			Pick<AdminTypes.MetafieldDefinition, 'id' | 'name'>
		>;
		userErrors: Array<
			Pick<
				AdminTypes.MetafieldDefinitionUpdateUserError,
				'code' | 'field' | 'message'
			>
		>;
	}>;
};

export type MetafieldDeleteMutationVariables = AdminTypes.Exact<{
	metafields:
		| Array<AdminTypes.MetafieldIdentifierInput>
		| AdminTypes.MetafieldIdentifierInput;
}>;

export type MetafieldDeleteMutation = {
	metafieldsDelete?: AdminTypes.Maybe<{
		deletedMetafields?: AdminTypes.Maybe<
			Array<
				AdminTypes.Maybe<
					Pick<AdminTypes.MetafieldIdentifier, 'key' | 'namespace' | 'ownerId'>
				>
			>
		>;
		userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>>;
	}>;
};

export type MetafieldsSetMutationVariables = AdminTypes.Exact<{
	metafields:
		| Array<AdminTypes.MetafieldsSetInput>
		| AdminTypes.MetafieldsSetInput;
}>;

export type MetafieldsSetMutation = {
	metafieldsSet?: AdminTypes.Maybe<{
		metafields?: AdminTypes.Maybe<
			Array<
				Pick<
					AdminTypes.Metafield,
					'key' | 'namespace' | 'value' | 'createdAt' | 'updatedAt'
				>
			>
		>;
		userErrors: Array<
			Pick<AdminTypes.MetafieldsSetUserError, 'code' | 'field' | 'message'>
		>;
	}>;
};

export type MetaobjectDefinitionCreateMutationVariables = AdminTypes.Exact<{
	definition: AdminTypes.MetaobjectDefinitionCreateInput;
}>;

export type MetaobjectDefinitionCreateMutation = {
	metaobjectDefinitionCreate?: AdminTypes.Maybe<{
		metaobjectDefinition?: AdminTypes.Maybe<
			Pick<AdminTypes.MetaobjectDefinition, 'name' | 'type'> & {
				fieldDefinitions: Array<
					Pick<AdminTypes.MetaobjectFieldDefinition, 'name' | 'key'>
				>;
			}
		>;
		userErrors: Array<
			Pick<AdminTypes.MetaobjectUserError, 'code' | 'field' | 'message'>
		>;
	}>;
};

export type MetaobjectDefinitionDeleteMutationVariables = AdminTypes.Exact<{
	id: AdminTypes.Scalars['ID']['input'];
}>;

export type MetaobjectDefinitionDeleteMutation = {
	metaobjectDefinitionDelete?: AdminTypes.Maybe<
		Pick<AdminTypes.MetaobjectDefinitionDeletePayload, 'deletedId'> & {
			userErrors: Array<
				Pick<AdminTypes.MetaobjectUserError, 'code' | 'field' | 'message'>
			>;
		}
	>;
};

export type MetaobjectDefinitionUpdateMutationVariables = AdminTypes.Exact<{
	id: AdminTypes.Scalars['ID']['input'];
	definition: AdminTypes.MetaobjectDefinitionUpdateInput;
}>;

export type MetaobjectDefinitionUpdateMutation = {
	metaobjectDefinitionUpdate?: AdminTypes.Maybe<{
		metaobjectDefinition?: AdminTypes.Maybe<
			Pick<
				AdminTypes.MetaobjectDefinition,
				'id' | 'name' | 'displayNameKey'
			> & {
				fieldDefinitions: Array<
					Pick<AdminTypes.MetaobjectFieldDefinition, 'name' | 'key'> & {
						type: Pick<AdminTypes.MetafieldDefinitionType, 'name'>;
					}
				>;
			}
		>;
		userErrors: Array<
			Pick<AdminTypes.MetaobjectUserError, 'code' | 'field' | 'message'>
		>;
	}>;
};

export type MetaobjectDeleteMutationVariables = AdminTypes.Exact<{
	id: AdminTypes.Scalars['ID']['input'];
}>;

export type MetaobjectDeleteMutation = {
	metaobjectDelete?: AdminTypes.Maybe<
		Pick<AdminTypes.MetaobjectDeletePayload, 'deletedId'> & {
			userErrors: Array<
				Pick<AdminTypes.MetaobjectUserError, 'code' | 'field' | 'message'>
			>;
		}
	>;
};

export type MetaobjectUpsertMutationVariables = AdminTypes.Exact<{
	handle: AdminTypes.MetaobjectHandleInput;
	metaobject: AdminTypes.MetaobjectUpsertInput;
}>;

export type MetaobjectUpsertMutation = {
	metaobjectUpsert?: AdminTypes.Maybe<{
		metaobject?: AdminTypes.Maybe<
			Pick<AdminTypes.Metaobject, 'displayName' | 'handle' | 'id'> & {
				fields: Array<
					Pick<AdminTypes.MetaobjectField, 'key' | 'type' | 'value'>
				>;
			}
		>;
		userErrors: Array<
			Pick<AdminTypes.MetaobjectUserError, 'code' | 'field' | 'message'>
		>;
	}>;
};

export type StagedUploadsCreateMutationVariables = AdminTypes.Exact<{
	input: Array<AdminTypes.StagedUploadInput> | AdminTypes.StagedUploadInput;
}>;

export type StagedUploadsCreateMutation = {
	stagedUploadsCreate?: AdminTypes.Maybe<{
		stagedTargets?: AdminTypes.Maybe<
			Array<
				Pick<AdminTypes.StagedMediaUploadTarget, 'url' | 'resourceUrl'> & {
					parameters: Array<
						Pick<AdminTypes.StagedUploadParameter, 'name' | 'value'>
					>;
				}
			>
		>;
		userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>>;
	}>;
};

export type BillingCheckQueryVariables = AdminTypes.Exact<{
	cursor?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;

export type BillingCheckQuery = {
	currentAppInstallation: {
		activeSubscriptions: Array<
			Pick<AdminTypes.AppSubscription, 'id' | 'name' | 'test' | 'status'>
		>;
		oneTimePurchases: {
			nodes: Array<
				Pick<AdminTypes.AppPurchaseOneTime, 'id' | 'name' | 'test' | 'status'>
			>;
			pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'>;
		};
	};
};

export type CurrentBulkOperationQueryVariables = AdminTypes.Exact<{
	type: AdminTypes.BulkOperationType;
}>;

export type CurrentBulkOperationQuery = {
	currentBulkOperation?: AdminTypes.Maybe<
		Pick<
			AdminTypes.BulkOperation,
			'errorCode' | 'id' | 'type' | 'status' | 'url'
		>
	>;
};

export type FileQueryVariables = AdminTypes.Exact<{
	id: AdminTypes.Scalars['ID']['input'];
}>;

export type FileQuery = {
	node?: AdminTypes.Maybe<
		| ({__typename: 'GenericFile'} & Pick<
				AdminTypes.GenericFile,
				'fileStatus' | 'id' | 'url'
		  > & {
					fileErrors: Array<
						Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>
					>;
				})
		| ({__typename: 'MediaImage'} & Pick<
				AdminTypes.MediaImage,
				'fileStatus' | 'id'
		  > & {
					fileErrors: Array<
						Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>
					>;
					image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>>;
				})
		| ({__typename: 'Model3d'} & Pick<
				AdminTypes.Model3d,
				'fileStatus' | 'id'
		  > & {
					fileErrors: Array<
						Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>
					>;
					originalSource?: AdminTypes.Maybe<
						Pick<AdminTypes.Model3dSource, 'url'>
					>;
				})
		| ({__typename: 'Video'} & Pick<AdminTypes.Video, 'fileStatus' | 'id'> & {
					fileErrors: Array<
						Pick<AdminTypes.FileError, 'code' | 'details' | 'message'>
					>;
					originalSource?: AdminTypes.Maybe<
						Pick<AdminTypes.VideoSource, 'url'>
					>;
				})
	>;
};

export type MetafieldDefinitionQueryVariables = AdminTypes.Exact<{
	identifier: AdminTypes.MetafieldDefinitionIdentifierInput;
}>;

export type MetafieldDefinitionQuery = {
	metafieldDefinition?: AdminTypes.Maybe<
		Pick<AdminTypes.MetafieldDefinition, 'id'>
	>;
};

export type MetafieldQueryVariables = AdminTypes.Exact<{
	key: AdminTypes.Scalars['String']['input'];
	namespace?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
	ownerId: AdminTypes.Scalars['ID']['input'];
}>;

export type MetafieldQuery = {
	node?: AdminTypes.Maybe<{
		metafield?: AdminTypes.Maybe<
			Pick<AdminTypes.Metafield, 'id' | 'key' | 'namespace' | 'value'>
		>;
	}>;
};

export type MetafieldsQueryVariables = AdminTypes.Exact<{
	cursor?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
	first?: AdminTypes.InputMaybe<AdminTypes.Scalars['Int']['input']>;
	keys?: AdminTypes.InputMaybe<
		| Array<AdminTypes.Scalars['String']['input']>
		| AdminTypes.Scalars['String']['input']
	>;
	namespace?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
	ownerId: AdminTypes.Scalars['ID']['input'];
}>;

export type MetafieldsQuery = {
	node?: AdminTypes.Maybe<{
		metafields: {
			nodes: Array<
				Pick<AdminTypes.Metafield, 'id' | 'key' | 'namespace' | 'value'>
			>;
		};
	}>;
};

export type MetaobjectDefinitionQueryVariables = AdminTypes.Exact<{
	id: AdminTypes.Scalars['ID']['input'];
}>;

export type MetaobjectDefinitionQuery = {
	metaobjectDefinition?: AdminTypes.Maybe<
		Pick<AdminTypes.MetaobjectDefinition, 'id'>
	>;
};

export type MetaobjectQueryVariables = AdminTypes.Exact<{
	handle: AdminTypes.MetaobjectHandleInput;
}>;

export type MetaobjectQuery = {
	metaobjectByHandle?: AdminTypes.Maybe<Pick<AdminTypes.Metaobject, 'id'>>;
};

export type MetaobjectsQueryVariables = AdminTypes.Exact<{
	cursor?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
	first?: AdminTypes.InputMaybe<AdminTypes.Scalars['Int']['input']>;
	query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
	type: AdminTypes.Scalars['String']['input'];
}>;

export type MetaobjectsQuery = {
	metaobjects: {nodes: Array<Pick<AdminTypes.Metaobject, 'id'>>};
};

export type ShopQueryVariables = AdminTypes.Exact<{[key: string]: never}>;

export type ShopQuery = {shop: Pick<AdminTypes.Shop, 'name'>};

interface GeneratedQueryTypes {
	'query BillingCheck($cursor: String) {\n  currentAppInstallation {\n    activeSubscriptions {\n      id\n      name\n      test\n      status\n    }\n    oneTimePurchases(first: 250, sortKey: CREATED_AT, after: $cursor) {\n      nodes {\n        id\n        name\n        test\n        status\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n}': {
		return: BillingCheckQuery;
		variables: BillingCheckQueryVariables;
	};
	'query CurrentBulkOperation($type: BulkOperationType!) {\n  currentBulkOperation(type: $type) {\n    errorCode\n    id\n    type\n    status\n    url\n  }\n}': {
		return: CurrentBulkOperationQuery;
		variables: CurrentBulkOperationQueryVariables;
	};
	'query File($id: ID!) {\n  node(id: $id) {\n    ... on GenericFile {\n      __typename\n      fileErrors {\n        code\n        details\n        message\n      }\n      fileStatus\n      id\n      url\n    }\n    ... on MediaImage {\n      __typename\n      fileErrors {\n        code\n        details\n        message\n      }\n      fileStatus\n      id\n      image {\n        url\n      }\n    }\n    ... on Model3d {\n      __typename\n      fileErrors {\n        code\n        details\n        message\n      }\n      fileStatus\n      id\n      originalSource {\n        url\n      }\n    }\n    ... on Video {\n      __typename\n      fileErrors {\n        code\n        details\n        message\n      }\n      fileStatus\n      id\n      originalSource {\n        url\n      }\n    }\n  }\n}': {
		return: FileQuery;
		variables: FileQueryVariables;
	};
	'query MetafieldDefinition($identifier: MetafieldDefinitionIdentifierInput!) {\n  metafieldDefinition(identifier: $identifier) {\n    id\n  }\n}': {
		return: MetafieldDefinitionQuery;
		variables: MetafieldDefinitionQueryVariables;
	};
	'query Metafield($key: String!, $namespace: String, $ownerId: ID!) {\n  node(id: $ownerId) {\n    ... on AppInstallation {\n      ...MetafieldNodeFragment\n    }\n    ... on Article {\n      ...MetafieldNodeFragment\n    }\n    ... on Blog {\n      ...MetafieldNodeFragment\n    }\n    ... on Collection {\n      ...MetafieldNodeFragment\n    }\n    ... on Company {\n      ...MetafieldNodeFragment\n    }\n    ... on CompanyLocation {\n      ...MetafieldNodeFragment\n    }\n    ... on Customer {\n      ...MetafieldNodeFragment\n    }\n    ... on DeliveryCustomization {\n      ...MetafieldNodeFragment\n    }\n    ... on DiscountAutomaticNode {\n      ...MetafieldNodeFragment\n    }\n    ... on DiscountCodeNode {\n      ...MetafieldNodeFragment\n    }\n    ... on DiscountNode {\n      ...MetafieldNodeFragment\n    }\n    ... on DraftOrder {\n      ...MetafieldNodeFragment\n    }\n    ... on Location {\n      ...MetafieldNodeFragment\n    }\n    ... on Market {\n      ...MetafieldNodeFragment\n    }\n    ... on Order {\n      ...MetafieldNodeFragment\n    }\n    ... on Page {\n      ...MetafieldNodeFragment\n    }\n    ... on PaymentCustomization {\n      ...MetafieldNodeFragment\n    }\n    ... on Product {\n      ...MetafieldNodeFragment\n    }\n    ... on ProductVariant {\n      ...MetafieldNodeFragment\n    }\n    ... on Shop {\n      ...MetafieldNodeFragment\n    }\n  }\n}': {
		return: MetafieldQuery;
		variables: MetafieldQueryVariables;
	};
	'query Metafields($cursor: String, $first: Int = 10, $keys: [String!], $namespace: String, $ownerId: ID!) {\n  node(id: $ownerId) {\n    ... on AppInstallation {\n      ...MetafieldNodesFragment\n    }\n    ... on Article {\n      ...MetafieldNodesFragment\n    }\n    ... on Blog {\n      ...MetafieldNodesFragment\n    }\n    ... on Collection {\n      ...MetafieldNodesFragment\n    }\n    ... on Company {\n      ...MetafieldNodesFragment\n    }\n    ... on CompanyLocation {\n      ...MetafieldNodesFragment\n    }\n    ... on Customer {\n      ...MetafieldNodesFragment\n    }\n    ... on DeliveryCustomization {\n      ...MetafieldNodesFragment\n    }\n    ... on DiscountAutomaticNode {\n      ...MetafieldNodesFragment\n    }\n    ... on DiscountCodeNode {\n      ...MetafieldNodesFragment\n    }\n    ... on DiscountNode {\n      ...MetafieldNodesFragment\n    }\n    ... on DraftOrder {\n      ...MetafieldNodesFragment\n    }\n    ... on Location {\n      ...MetafieldNodesFragment\n    }\n    ... on Market {\n      ...MetafieldNodesFragment\n    }\n    ... on Order {\n      ...MetafieldNodesFragment\n    }\n    ... on Page {\n      ...MetafieldNodesFragment\n    }\n    ... on PaymentCustomization {\n      ...MetafieldNodesFragment\n    }\n    ... on Product {\n      ...MetafieldNodesFragment\n    }\n    ... on ProductVariant {\n      ...MetafieldNodesFragment\n    }\n    ... on Shop {\n      ...MetafieldNodesFragment\n    }\n  }\n}': {
		return: MetafieldsQuery;
		variables: MetafieldsQueryVariables;
	};
	'query MetaobjectDefinition($id: ID!) {\n  metaobjectDefinition(id: $id) {\n    id\n  }\n}': {
		return: MetaobjectDefinitionQuery;
		variables: MetaobjectDefinitionQueryVariables;
	};
	'query Metaobject($handle: MetaobjectHandleInput!) {\n  metaobjectByHandle(handle: $handle) {\n    id\n  }\n}': {
		return: MetaobjectQuery;
		variables: MetaobjectQueryVariables;
	};
	'query Metaobjects($cursor: String, $first: Int = 10, $query: String, $type: String!) {\n  metaobjects(after: $cursor, first: $first, query: $query, type: $type) {\n    nodes {\n      id\n    }\n  }\n}': {
		return: MetaobjectsQuery;
		variables: MetaobjectsQueryVariables;
	};
	'query Shop {\n  shop {\n    name\n  }\n}': {
		return: ShopQuery;
		variables: ShopQueryVariables;
	};
}

interface GeneratedMutationTypes {
	'mutation BulkOperationCancel($id: ID!) {\n  bulkOperationCancel(id: $id) {\n    bulkOperation {\n      errorCode\n      id\n      status\n      type\n    }\n    userErrors {\n      field\n      message\n    }\n  }\n}': {
		return: BulkOperationCancelMutation;
		variables: BulkOperationCancelMutationVariables;
	};
	'mutation BulkOperationRunMutation($clientIdentifier: String, $mutation: String!, $stagedUploadPath: String!) {\n  bulkOperationRunMutation(\n    clientIdentifier: $clientIdentifier\n    mutation: $mutation\n    stagedUploadPath: $stagedUploadPath\n  ) {\n    bulkOperation {\n      errorCode\n      id\n      partialDataUrl\n      status\n      type\n      url\n    }\n    userErrors {\n      field\n      message\n    }\n  }\n}': {
		return: BulkOperationRunMutationMutation;
		variables: BulkOperationRunMutationMutationVariables;
	};
	'mutation BulkOperationRunQuery($query: String!) {\n  bulkOperationRunQuery(query: $query) {\n    bulkOperation {\n      errorCode\n      id\n      partialDataUrl\n      status\n      type\n      url\n    }\n    userErrors {\n      field\n      message\n    }\n  }\n}': {
		return: BulkOperationRunQueryMutation;
		variables: BulkOperationRunQueryMutationVariables;
	};
	'mutation FileCreate($files: [FileCreateInput!]!) {\n  fileCreate(files: $files) {\n    files {\n      fileErrors {\n        code\n        details\n        message\n      }\n      id\n    }\n    userErrors {\n      code\n      field\n      message\n    }\n  }\n}': {
		return: FileCreateMutation;
		variables: FileCreateMutationVariables;
	};
	'mutation MetafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {\n  metafieldDefinitionCreate(definition: $definition) {\n    createdDefinition {\n      id\n      name\n    }\n    userErrors {\n      code\n      field\n      message\n    }\n  }\n}': {
		return: MetafieldDefinitionCreateMutation;
		variables: MetafieldDefinitionCreateMutationVariables;
	};
	'mutation MetafieldDefinitionDelete($identifier: MetafieldDefinitionIdentifierInput!, $deleteAllAssociatedMetafields: Boolean!) {\n  metafieldDefinitionDelete(\n    identifier: $identifier\n    deleteAllAssociatedMetafields: $deleteAllAssociatedMetafields\n  ) {\n    deletedDefinitionId\n    userErrors {\n      code\n      field\n      message\n    }\n  }\n}': {
		return: MetafieldDefinitionDeleteMutation;
		variables: MetafieldDefinitionDeleteMutationVariables;
	};
	'mutation MetafieldDefinitionUpdate($definition: MetafieldDefinitionUpdateInput!) {\n  metafieldDefinitionUpdate(definition: $definition) {\n    updatedDefinition {\n      id\n      name\n    }\n    userErrors {\n      code\n      field\n      message\n    }\n  }\n}': {
		return: MetafieldDefinitionUpdateMutation;
		variables: MetafieldDefinitionUpdateMutationVariables;
	};
	'mutation MetafieldDelete($metafields: [MetafieldIdentifierInput!]!) {\n  metafieldsDelete(metafields: $metafields) {\n    deletedMetafields {\n      key\n      namespace\n      ownerId\n    }\n    userErrors {\n      field\n      message\n    }\n  }\n}': {
		return: MetafieldDeleteMutation;
		variables: MetafieldDeleteMutationVariables;
	};
	'mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {\n  metafieldsSet(metafields: $metafields) {\n    metafields {\n      key\n      namespace\n      value\n      createdAt\n      updatedAt\n    }\n    userErrors {\n      code\n      field\n      message\n    }\n  }\n}': {
		return: MetafieldsSetMutation;
		variables: MetafieldsSetMutationVariables;
	};
	'mutation MetaobjectDefinitionCreate($definition: MetaobjectDefinitionCreateInput!) {\n  metaobjectDefinitionCreate(definition: $definition) {\n    metaobjectDefinition {\n      name\n      type\n      fieldDefinitions {\n        name\n        key\n      }\n    }\n    userErrors {\n      code\n      field\n      message\n    }\n  }\n}': {
		return: MetaobjectDefinitionCreateMutation;
		variables: MetaobjectDefinitionCreateMutationVariables;
	};
	'mutation MetaobjectDefinitionDelete($id: ID!) {\n  metaobjectDefinitionDelete(id: $id) {\n    deletedId\n    userErrors {\n      code\n      field\n      message\n    }\n  }\n}': {
		return: MetaobjectDefinitionDeleteMutation;
		variables: MetaobjectDefinitionDeleteMutationVariables;
	};
	'mutation MetaobjectDefinitionUpdate($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {\n  metaobjectDefinitionUpdate(id: $id, definition: $definition) {\n    metaobjectDefinition {\n      id\n      name\n      displayNameKey\n      fieldDefinitions {\n        name\n        key\n        type {\n          name\n        }\n      }\n    }\n    userErrors {\n      code\n      field\n      message\n    }\n  }\n}': {
		return: MetaobjectDefinitionUpdateMutation;
		variables: MetaobjectDefinitionUpdateMutationVariables;
	};
	'mutation MetaobjectDelete($id: ID!) {\n  metaobjectDelete(id: $id) {\n    deletedId\n    userErrors {\n      code\n      field\n      message\n    }\n  }\n}': {
		return: MetaobjectDeleteMutation;
		variables: MetaobjectDeleteMutationVariables;
	};
	'mutation MetaobjectUpsert($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {\n  metaobjectUpsert(handle: $handle, metaobject: $metaobject) {\n    metaobject {\n      displayName\n      fields {\n        key\n        type\n        value\n      }\n      handle\n      id\n    }\n    userErrors {\n      code\n      field\n      message\n    }\n  }\n}': {
		return: MetaobjectUpsertMutation;
		variables: MetaobjectUpsertMutationVariables;
	};
	'mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {\n  stagedUploadsCreate(input: $input) {\n    stagedTargets {\n      url\n      resourceUrl\n      parameters {\n        name\n        value\n      }\n    }\n    userErrors {\n      field\n      message\n    }\n  }\n}': {
		return: StagedUploadsCreateMutation;
		variables: StagedUploadsCreateMutationVariables;
	};
}
declare module '@shopify/admin-api-client' {
	type InputMaybe<T> = AdminTypes.InputMaybe<T>;
	interface AdminQueries extends GeneratedQueryTypes {}
	interface AdminMutations extends GeneratedMutationTypes {}
}
