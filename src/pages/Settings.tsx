import { Redirect } from "@shopify/app-bridge/actions";
import * as AppBridge from "@shopify/app-bridge-react";
import * as Polaris from "@shopify/polaris";
import isEquals from "fast-deep-equal/es6/react";
import * as React from "react";

import { useAppQuery, useAppMutation, useI18n } from "@/hooks";
import { graphql } from "@/utils";

export default function Settings() {
	const [i18n] = useI18n();

	const defaults = React.useMemo(
		() => ({
			setting1: "",
			setting2: "",
		}),
		[]
	);
	const [defaultData, setDefaultData] = React.useState({ ...defaults });
	const [data, setData] = React.useReducer<React.Reducer<any, any>>(
		(prev, next) => {
			if (next === null) {
				return {};
			}
			return { ...prev, ...next };
		},
		{
			...defaultData,
		}
	);
	const isChanged = React.useMemo(
		() => !isEquals(data, defaultData),
		[data, defaultData]
	);

	const query = useAppQuery(
		graphql({
			url: "/api/proxy/graphql/admin",
			query: /* graphql */ `{
				currentAppInstallation {
					id
					metafield(namespace: "shopflare", key: "settings") {
						value
					}
				}
			}`,
			reactQueryOptions: {
				onSuccess: ({ data }: any) => {
					let v = data?.currentAppInstallation?.metafield?.value;
					if (v) {
						v = JSON.parse(v);
						setDefaultData(v);
						setData(v);
					}
				},
			},
		})
	);

	const { show } = AppBridge.useToast();

	const [isSaving, setSaving] = React.useState(false);

	const mutation = useAppMutation(
		graphql({
			url: "/api/proxy/graphql/admin",
			query: /* graphql */ `mutation createAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
				metafieldsSet(metafields: $metafieldsSetInput) {
					metafields {
						value
					}
					userErrors {
						field
						message
					}
				}
			}`,
			reactQueryOptions: {
				onError: (error: any) => {
					show(i18n.translate("app.settings.failure"), { isError: true });

					console.error(error);
				},
				onMutate: () => {
					setSaving(true);
				},
				onSettled: () => {
					setSaving(false);
				},
				onSuccess: ({ data }: any) => {
					let v = data?.metafieldsSet?.metafields?.[0]?.value;
					if (v) {
						v = JSON.parse(v);
						setDefaultData(v);
					}

					show(i18n.translate("app.settings.success"));
				},
			},
		})
	);

	const onSave = React.useCallback(() => {
		mutation.mutate({
			variables: {
				metafieldsSetInput: [
					{
						key: "settings",
						namespace: "shopflare",
						ownerId: (query.data as any)?.data?.currentAppInstallation.id,
						type: "json",
						value: JSON.stringify(data),
					},
				],
			},
		} as any);
	}, [data, query.data, mutation]);

	const onDiscard = React.useCallback(() => {
		setData(defaults);
	}, [defaults]);

	const { smUp } = Polaris.useBreakpoints();

	return (
		<Polaris.Page>
			<AppBridge.TitleBar title={i18n.translate("app.settings.title")} />

			<AppBridge.ContextualSaveBar
				discardAction={{
					disabled: isSaving,
					onAction: onDiscard,
				}}
				fullWidth
				saveAction={{
					disabled: isSaving,
					loading: isSaving,
					onAction: onSave,
				}}
				visible={isChanged}
			/>

			<Polaris.VerticalStack gap={{ xs: "8", sm: "4" }}>
				<Section
					body={i18n.translate("app.settings.billingPlan.body")}
					heading={i18n.translate("app.settings.billingPlan.heading")}
				>
					<BillingPlan />
				</Section>

				{smUp ? <Polaris.Divider /> : null}

				<Section
					body={i18n.translate("app.settings.body")}
					heading={i18n.translate("app.settings.heading")}
				>
					<Polaris.TextField
						autoComplete="off"
						label={i18n.translate("app.settings.label", { n: 1 })}
						onChange={(setting1) => setData({ setting1 })}
						value={data.setting1}
					/>
					<Polaris.TextField
						autoComplete="off"
						label={i18n.translate("app.settings.label", { n: 2 })}
						multiline={4}
						onChange={(setting2) => setData({ setting2 })}
						value={data.setting2}
					/>
				</Section>
			</Polaris.VerticalStack>
		</Polaris.Page>
	);
}

function BillingPlan() {
	const app = AppBridge.useAppBridge();

	const [i18n] = useI18n();

	const query = useAppQuery(
		graphql({
			url: "/api/graphql",
			query: /* graphql */ `{
				billingPlans {
					amount
					currencyCode
					interval
					replacementBehavior
					name
					trialDays
					usageTerms
				}
			}`,
		})
	);

	const [selected, setSelected] = React.useState("");
	useAppQuery(
		graphql({
			url: "/api/proxy/graphql/admin",
			query: /* graphql */ `{
				app {
					installation {
						activeSubscriptions {
							name
						}
					}
				}
			}`,
			reactQueryOptions: {
				onSuccess: ({ data }: any) => {
					setSelected(data?.app?.installation?.activeSubscriptions?.[0]?.name);
				},
			},
		})
	);

	const { show } = AppBridge.useToast();

	const mutation = useAppMutation(
		graphql({
			url: "/api/graphql",
			query: /* graphql */ `mutation setBillingPlan($input: BillingPlanInput!) {
				billingPlan(input: $input) {
					confirmationUrl
				}
			}`,
			reactQueryOptions: {
				onError: (error: any) => {
					show(i18n.translate("app.settings.billingPlan.failed"), {
						isError: true,
					});

					console.error(error);
				},
				onSuccess: ({ data }: any) => {
					show(i18n.translate("app.settings.billingPlan.success"));

					if (!data.billingPlan.confirmationUrl) {
						return;
					}

					setTimeout(() => {
						const redirect = Redirect.create(app);
						redirect.dispatch(
							Redirect.Action.REMOTE,
							decodeURIComponent(data.billingPlan.confirmationUrl)
						);
					}, 1500);
				},
			},
		})
	);

	const onChange = React.useCallback(
		(_: boolean, plan: string) => {
			mutation.mutate({ variables: { input: { plan } } } as any);
			setSelected(plan);
		},
		[mutation]
	);

	const label = React.useCallback(
		(plan: any) => {
			const price = i18n.formatCurrency(plan.amount, {
				currency: plan.currencyCode,
			});
			const interval =
				plan.interval === "ANNUAL"
					? i18n.translate("app.year")
					: i18n.translate("app.30Days");

			return (
				<Polaris.Text variant="headingMd" as="h6">
					{plan.name}, {price} {interval}
				</Polaris.Text>
			);
		},
		[i18n]
	);

	const helpText = React.useCallback(
		(plan: any) => {
			return (
				<>
					{plan.trialDays} {i18n.translate("app.dayTrial")}
					<br />
					{plan.usageTerms}
				</>
			);
		},
		[i18n]
	);

	if (query.isError) {
		return (
			<Polaris.LegacyStack vertical>
				<Polaris.Button
					destructive={true}
					disabled={query.isRefetching}
					loading={query.isRefetching}
					outline={true}
					onClick={() => query.refetch()}
				>
					{i18n.translate("app.fetchFailedRetry")}
				</Polaris.Button>
			</Polaris.LegacyStack>
		);
	}

	if (query.isLoading) {
		return (
			<Polaris.Spinner accessibilityLabel={i18n.translate("app.loading")} />
		);
	}

	if (!query.data) {
		return <>{i18n.translate("app.none")}</>;
	}

	return (
		<Polaris.LegacyStack vertical>
			{(query.data as any).data.billingPlans.map((plan: any) => (
				<Polaris.RadioButton
					label={label(plan)}
					helpText={helpText(plan)}
					checked={plan.name === selected}
					id={plan.name}
					key={plan.name}
					name={plan.name}
					onChange={onChange}
				/>
			))}
		</Polaris.LegacyStack>
	);
}

type Section = {
	body?: string;
	children: React.ReactNode;
	heading?: string;
};

function Section({ body = "", children, heading = "" }: Section) {
	return (
		<Polaris.HorizontalGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="4">
			<Polaris.Box
				as="section"
				paddingInlineStart={{ xs: "4", sm: "0" }}
				paddingInlineEnd={{ xs: "4", sm: "0" }}
			>
				<Polaris.VerticalStack gap="4">
					<Polaris.Text as="h3" variant="headingMd">
						{heading}
					</Polaris.Text>
					<Polaris.Text as="p" variant="bodyMd">
						{body}
					</Polaris.Text>
				</Polaris.VerticalStack>
			</Polaris.Box>
			<Polaris.AlphaCard
				background="bg"
				padding={{ xs: "4", sm: "5" }}
				roundedAbove="sm"
			>
				<Polaris.VerticalStack gap="4">{children}</Polaris.VerticalStack>
			</Polaris.AlphaCard>
		</Polaris.HorizontalGrid>
	);
}
