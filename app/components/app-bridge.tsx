import type {
	ShopifyGlobal,
	UIModalAttributes,
	UINavMenuAttributes,
	UISaveBarAttributes,
	UITitleBarAttributes,
} from "@shopify/app-bridge-types";
import { useEffect, useState } from "react";

declare module "react" {
	// biome-ignore lint/style/noNamespace: upstream
	namespace JSX {
		interface IntrinsicElements {
			"ui-modal": UIModalAttributes & React.RefAttributes<UIModalElement>;
			"ui-title-bar": UITitleBarAttributes &
				React.RefAttributes<UITitleBarElement>;
			"ui-save-bar": UISaveBarAttributes &
				React.RefAttributes<UISaveBarElement>;
			"ui-nav-menu": UINavMenuAttributes &
				React.RefAttributes<UINavMenuElement>;
		}
	}
}

export interface ModalProps extends React.PropsWithChildren<UIModalAttributes> {
	onHide?(): void;
	onShow?(): void;
	open?: boolean;
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

	return (
		<ui-modal {...props} ref={setComponent}>
			{children}
		</ui-modal>
	);
}

interface NavMenuProps extends React.PropsWithChildren<UINavMenuAttributes> {}

export function NavMenu({ children }: NavMenuProps) {
	return <ui-nav-menu>{children}</ui-nav-menu>;
}

export interface SaveBarProps
	extends React.PropsWithChildren<UISaveBarAttributes> {
	onHide?(): void;
	onShow?(): void;
	open?: boolean;
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
		return () => component?.removeEventListener("hide", onHide);
	}, [component, onHide]);

	useEffect(() => {
		if (!component || !onShow) return;

		component.addEventListener("show", onShow);
		return () => component?.removeEventListener("show", onShow);
	}, [component, onShow]);

	return (
		<ui-save-bar {...props} ref={setComponent}>
			{children}
		</ui-save-bar>
	);
}

interface TitleBarProps extends React.PropsWithChildren<UINavMenuAttributes> {
	title?: string;
}

export function TitleBar({ children, ...props }: TitleBarProps) {
	return <ui-title-bar {...props}>{children}</ui-title-bar>;
}

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
