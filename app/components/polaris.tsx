import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import type * as Polaris from "@shopify/polaris";
import type { LinkLikeComponentProps } from "@shopify/polaris/build/ts/src/utilities/link";
import type { JSX, Ref } from "react";
import { Link as ReactRouterLink } from "react-router";

export function AppProvider({ children, ...props }: Polaris.AppProviderProps) {
	return (
		<PolarisAppProvider {...props} linkComponent={LinkComponent}>
			{children}
		</PolarisAppProvider>
	);
}

export interface CheckboxProps extends Omit<Polaris.CheckboxProps, "name"> {
	name: Polaris.CheckboxProps["name"];
	ref?: Ref<HTMLInputElement>;
}

export declare function Checkbox(props: CheckboxProps): JSX.Element;

interface ComboboxActivatorProps
	extends Omit<Polaris.ComboboxProps["activator"], "name"> {
	name: string;
	ref?: Ref<HTMLInputElement>;
	value?: string | string[];
}

export interface ComboboxProps
	extends Omit<Polaris.ComboboxProps, "activator"> {
	activator: ComboboxActivatorProps;
}

export declare function Combobox(props: ComboboxProps): JSX.Element;

export interface DropZoneProps extends Polaris.DropZoneProps {
	name: string;
	ref?: Ref<HTMLInputElement>;
	value?: string | string[] | File | File[];
}

export declare function DropZone(props: DropZoneProps): JSX.Element;

export interface FormProps extends Omit<Polaris.FormProps, "action"> {
	action: Polaris.FormProps["action"];
	ref?: Ref<HTMLFormElement>;
}

export declare function Form(props: FormProps): JSX.Element;

export interface LinkComponentProps extends LinkLikeComponentProps {
	ref?: Ref<HTMLAnchorElement>;
}

export function LinkComponent({ url, ...props }: LinkComponentProps) {
	return (
		<ReactRouterLink
			viewTransition
			{...props}
			to={url}
			suppressHydrationWarning
		/>
	);
}

export interface RadioButtonProps
	extends Omit<Polaris.RadioButtonProps, "name"> {
	name: Polaris.RadioButtonProps["name"];
	ref?: Ref<HTMLInputElement>;
}

export declare function RadioButton(props: RadioButtonProps): JSX.Element;

export interface SelectProps extends Omit<Polaris.SelectProps, "name"> {
	name: Polaris.SelectProps["name"];
	ref?: Ref<HTMLSelectElement>;
}

export declare function Select(props: SelectProps): JSX.Element;

export interface TextFieldProps extends Omit<Polaris.TextFieldProps, "name"> {
	name: Polaris.TextFieldProps["name"];
	ref?: Ref<HTMLInputElement>;
}

export declare function TextField(props: TextFieldProps): JSX.Element;

export * from "@shopify/polaris";
