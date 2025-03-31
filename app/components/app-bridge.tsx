import type {
	ShopifyGlobal,
	UIModalAttributes,
	UINavMenuAttributes,
	UISaveBarAttributes,
	UITitleBarAttributes,
} from "@shopify/app-bridge-types";
import {
	Children,
	type FunctionComponent,
	type PropsWithChildren,
	type ReactElement,
	type ReactNode,
	type RefAttributes as ReactRefAttributes,
	type Ref,
	useEffect,
	useState,
} from "react";
import { createPortal } from "react-dom";

declare module "react" {
	// biome-ignore lint/style/noNamespace: upstream
	namespace JSX {
		interface IntrinsicElements {
			"ui-modal": UIModalAttributes & ReactRefAttributes<UIModalElement>;
			"ui-title-bar": UITitleBarAttributes &
				ReactRefAttributes<UITitleBarElement>;
			"ui-save-bar": UISaveBarAttributes & ReactRefAttributes<UISaveBarElement>;
			"ui-nav-menu": UINavMenuAttributes & ReactRefAttributes<UINavMenuElement>;
		}
	}
}

interface ModalProps extends PropsWithChildren<UIModalAttributes> {
	onHide?(): void;
	onShow?(): void;
	open?: boolean;
	ref?: Ref<UIModalElement>;
}

export function Modal({
	children,
	onHide,
	onShow,
	open,
	...props
}: ModalProps) {
	const [component, setComponent] = useState<UIModalElement | null>(null);

	useEffect(() => {
		if (!component) return;

		component[open ? "show" : "hide"]();
		return () => {
			component.hide();
		};
	}, [component, open]);

	useEffect(() => {
		if (!component || !onHide) return;

		component.addEventListener("hide", onHide);
		return () => component.removeEventListener("hide", onHide);
	}, [component, onHide]);

	useEffect(() => {
		if (!component || !onShow) return;

		component.addEventListener("show", onShow);
		return () => component.removeEventListener("show", onShow);
	}, [component, onShow]);

	const { modalContent, saveBar, titleBar } = Children.toArray(children).reduce(
		(acc, node) => {
			const displayName = ((node as ReactElement)?.type as FunctionComponent)
				?.displayName;
			switch (displayName) {
				default:
					acc.modalContent.push(node);
					break;
				case "ui-save-bar":
					acc.saveBar = node;
					break;
				case "ui-title-bar":
					acc.titleBar = node;
					break;
			}
			return acc;
		},
		{ modalContent: [] } as {
			modalContent: ReactNode[];
			saveBar?: ReactNode;
			titleBar?: ReactNode;
		},
	);
	const modalContentPortal = component?.content
		? createPortal(modalContent, component.content, props.id)
		: null;

	return (
		<ui-modal
			{...props}
			ref={(ref) => {
				setComponent(ref);
				if (props.ref) {
					if (typeof props.ref === "function") {
						props.ref(ref);
					} else {
						props.ref.current = ref;
					}
				}
			}}
		>
			{saveBar}
			{titleBar}
			<div>{modalContentPortal}</div>
		</ui-modal>
	);
}

interface NavMenuProps extends PropsWithChildren<UINavMenuAttributes> {}

export function NavMenu({ children }: NavMenuProps) {
	return <ui-nav-menu>{children}</ui-nav-menu>;
}

interface SaveBarProps extends PropsWithChildren<UISaveBarAttributes> {
	onHide?(): void;
	onShow?(): void;
	open?: boolean;
	ref?: Ref<UISaveBarElement>;
}

export function SaveBar({
	children,
	onHide,
	onShow,
	open,
	...props
}: SaveBarProps) {
	const [component, setComponent] = useState<UISaveBarElement | null>(null);

	useEffect(() => {
		if (!component) return;

		component[open ? "show" : "hide"]();
		return () => {
			component.hide();
		};
	}, [component, open]);

	useEffect(() => {
		if (!component || !onHide) return;

		component.addEventListener("hide", onHide);
		return () => component.removeEventListener("hide", onHide);
	}, [component, onHide]);

	useEffect(() => {
		if (!component || !onShow) return;

		component.addEventListener("show", onShow);
		return () => component.removeEventListener("show", onShow);
	}, [component, onShow]);

	return (
		<ui-save-bar
			{...props}
			ref={(ref) => {
				setComponent(ref);
				if (props.ref) {
					if (typeof props.ref === "function") {
						props.ref(ref);
					} else {
						props.ref.current = ref;
					}
				}
			}}
		>
			{children}
		</ui-save-bar>
	);
}
SaveBar.displayName = "ui-save-bar";

interface TitleBarProps extends PropsWithChildren<UITitleBarAttributes> {
	title?: string;
}

export function TitleBar({ children, ...props }: TitleBarProps) {
	return <ui-title-bar {...props}>{children}</ui-title-bar>;
}
TitleBar.displayName = "ui-title-bar";

export function useAppBridge() {
	if (typeof window === "undefined") {
		return new Proxy(
			{},
			{
				get(_, prop) {
					throw Error(
						`shopify.${String(
							prop,
						)} can't be used in a server environment. You likely need to move this code into an Effect.`,
					);
				},
			},
		) as unknown as ShopifyGlobal;
	}
	if (!window.shopify) {
		throw Error(
			"The shopify global is not defined. This likely means the App Bridge script tag was not added correctly to this page",
		);
	}
	return window.shopify;
}
