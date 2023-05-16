import { Redirect } from "@shopify/app-bridge/actions";
import * as AppBridge from "@shopify/app-bridge-react";
import * as Polaris from "@shopify/polaris";
import isEquals from "fast-deep-equal/es6/react";
import * as React from "react";

import { useAppQuery, useAppMutation } from "@/hooks";
import { graphql } from "@/utils";

export default function Settings() {
	const defaults = {
		setting1: "",
		setting2: "",
	};
	const defaultsRef = React.useRef(defaults);
	const [data, setData] = React.useReducer<React.Reducer<any, any>>(
		(prev, next) => {
			if (next === null) {
				return {};
			}
			return { ...prev, ...next };
		},
		{
			...defaults,
		}
	);
	const isChanged = React.useMemo(
		() => !isEquals(defaultsRef.current, data),
		[data]
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
						defaultsRef.current = v;
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
						id
					}
					userErrors {
						field
						message
					}
				}
			}`,
			reactQueryOptions: {
				onError: (error: any) => {
					show("Failed to update settings", { isError: true });

					console.error(error);
				},
				onMutate: () => {
					setSaving(true);
				},
				onSettled: () => {
					setSaving(false);
				},
				onSuccess: (data: any) => {
					show("Settings saved successfully");
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
	}, [data, query.data]);

	const onDiscard = React.useCallback(() => {
		setData(defaults);
	}, [defaults]);

	const { smUp } = Polaris.useBreakpoints();

	return (
		<Polaris.Page>
			<AppBridge.TitleBar title="Settings" />

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
				<Section body="Please choose a plan" heading="Billing Plan">
					<BillingPlan />
				</Section>

				{smUp ? <Polaris.Divider /> : null}

				<Section body="..." heading="Section">
					<Polaris.TextField
						autoComplete="off"
						label="Setting 1"
						onChange={(setting1) => setData({ setting1 })}
						value={data.setting1}
					/>
					<Polaris.TextField
						autoComplete="off"
						label="Setting 2"
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

	const query = useAppQuery({ url: "/api/billing" });

	const { show } = AppBridge.useToast();

	const [plan, setPlan] = React.useState("");

	const mutation = useAppMutation({
		url: "/api/billing",
		fetchInit: {
			headers: { "Content-Type": "application/json" },
			method: "POST",
		},
		reactQueryOptions: {
			onError: (error: any) => {
				show("Failed to update Billing plan", { isError: true });

				console.error(error);
			},
			onSuccess: (data: any) => {
				show("Billing plan updated, redirecting...");

				setTimeout(() => {
					const redirect = Redirect.create(app);
					redirect.dispatch(
						Redirect.Action.REMOTE,
						decodeURIComponent(data.confirmationUrl)
					);
				}, 1500);
			},
		},
	});

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
					setPlan(data?.app?.installation?.activeSubscriptions?.[0]?.name);
				},
			},
		})
	);

	const onChange = React.useCallback((_: boolean, value: string) => {
		mutation.mutate({ plan: value } as any);
		setPlan(value);
	}, []);

	const label = React.useCallback((key: string, val: any) => {
		const price = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: val.currencyCode,
		}).format(val.amount);
		const interval = val.interval === "ANNUAL" ? "year" : "30 days";

		return (
			<Polaris.Text variant="headingMd" as="h6">
				{key}, {price} {interval}
			</Polaris.Text>
		);
	}, []);

	const helpText = React.useCallback((key: string, val: any) => {
		return (
			<>
				{val.trialDays} day trial
				<br />
				{val.usageTerms}
			</>
		);
	}, []);

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
					Fetch failed, retry
				</Polaris.Button>
			</Polaris.LegacyStack>
		);
	}

	if (query.isLoading) {
		return <Polaris.Spinner accessibilityLabel="Loading..." />;
	}

	if (!query.data) {
		return <>none</>;
	}

	return (
		<Polaris.LegacyStack vertical>
			{Object.entries(query.data as any).map(([key, val]: any) => (
				<Polaris.RadioButton
					label={label(key, val)}
					helpText={helpText(key, val)}
					checked={plan === key}
					id={key}
					key={key}
					name={key}
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
