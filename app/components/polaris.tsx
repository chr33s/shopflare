import * as Polaris from "@shopify/polaris";
import type { LinkLikeComponentProps } from "@shopify/polaris/build/ts/src/utilities/link";
import { type Ref, useCallback, useState } from "react";
import { Link as ReactRouterLink } from "react-router";

export * from "@shopify/polaris";

// TODO: [Combobox, Dropzone] : -> source components !pass [name] attribute

export function AppProvider({ children, ...props }: Polaris.AppProviderProps) {
	return (
		<Polaris.AppProvider {...props} linkComponent={Link}>
			{children}
		</Polaris.AppProvider>
	);
}

export interface CheckboxProps extends Omit<Polaris.CheckboxProps, "name"> {
	name: Polaris.CheckboxProps["name"];
	ref?: Ref<Polaris.CheckboxHandles>;
}

export function Checkbox(props: CheckboxProps) {
	const [checked, setChecked] = useState(!!props.checked);
	const onChange = useCallback(
		(value: boolean, id: string) => {
			props.onChange?.(value, id);
			setChecked(value);
		},
		[props.onChange],
	);

	return (
		<Polaris.Checkbox
			{...props}
			checked={checked}
			id={props.name}
			onChange={onChange}
		/>
	);
}

export interface ColorPickerProps
	extends Omit<Polaris.ColorPickerProps, "color" | "onChange"> {
	color?: Polaris.HSBAColor;
	name: string;
	onChange?: Polaris.ColorPickerProps["onChange"];
	ref?: Ref<Polaris.ColorPicker>;
}

export function ColorPicker(props: ColorPickerProps) {
	const [value, setValue] = useState(
		props.color ?? {
			alpha: 1,
			brightness: 0,
			hue: 1,
			saturation: 0,
		},
	);
	const onChange = useCallback(
		(value: Polaris.HSBAColor) => {
			props.onChange?.(value);
			setValue(value);
		},
		[props.onChange],
	);

	return (
		<>
			<input type="hidden" name={props.name} value={JSON.stringify(value)} />

			<Polaris.ColorPicker
				{...props}
				color={value}
				id={props.name}
				onChange={onChange}
			/>
		</>
	);
}

export interface DatePickerProps extends Polaris.DatePickerProps {
	name: string;
	ref?: Ref<typeof Polaris.DatePicker>;
}

export function DatePicker(props: DatePickerProps) {
	const date = new Date();

	const [selected, setSelected] = useState(
		(props.selected ?? !props.allowRange)
			? new Date(date)
			: {
					start: new Date(date),
					end: new Date(date),
				},
	);
	const onChange = useCallback(
		(selected: Polaris.Range) => {
			props.onChange?.(selected);
			setSelected(selected);
		},
		[props.onChange],
	);

	const [{ month, year }, setDate] = useState({
		month: props.month,
		year: props.year,
	});
	const onMonthChange = useCallback(
		(month: number, year: number) => {
			props.onMonthChange?.(month, year);
			setDate({ month, year });
		},
		[props.onMonthChange],
	);

	const format = useCallback((value: Date): string => {
		if (!(value instanceof Date)) {
			return "";
		}

		return [
			value.getFullYear(),
			(value.getMonth() + 1).toString().padStart(2, "0"),
			value.getDate().toString().padStart(2, "0"),
		].join("-");
	}, []);

	return (
		<>
			{props.allowRange ? (
				[
					<input
						key="start"
						name={`${props.name}[start]`}
						type="hidden"
						value={format((selected as Polaris.Range).start)}
					/>,
					<input
						key="end"
						name={`${props.name}[end]`}
						type="hidden"
						value={format((selected as Polaris.Range).end)}
					/>,
				]
			) : (
				<input
					type="hidden"
					name={props.name}
					value={
						format(selected as Date) ||
						format((selected as Polaris.Range).start)
					}
				/>
			)}

			<Polaris.DatePicker
				{...props}
				id={props.name}
				month={month}
				onChange={onChange}
				onMonthChange={onMonthChange}
				selected={selected}
				year={year}
			/>
		</>
	);
}

export interface LinkProps extends LinkLikeComponentProps {
	ref?: Ref<HTMLAnchorElement>;
}

export function Link({ url, ...props }: LinkProps) {
	return <ReactRouterLink {...props} to={url} />;
}

export interface RadioButtonProps
	extends Omit<Polaris.RadioButtonProps, "name"> {
	name: Polaris.RadioButtonProps["name"];
	ref?: Ref<typeof Polaris.RadioButton>;
}

export function RadioButton(props: RadioButtonProps) {
	const [checked, setChecked] = useState(!!props.checked);
	const onChange = useCallback(
		(value: boolean, id: string) => {
			props.onChange?.(value, id);
			setChecked(value);
		},
		[props.onChange],
	);

	return (
		<Polaris.RadioButton
			{...props}
			checked={checked}
			id={props.name}
			onChange={onChange}
		/>
	);
}

export interface RangeSliderProps
	extends Omit<Polaris.RangeSliderProps, "onChange" | "value"> {
	name: string;
	onChange?: Polaris.RangeSliderProps["onChange"];
	ref?: Ref<typeof Polaris.RangeSlider>;
	value?: Polaris.RangeSliderProps["value"];
}

export function RangeSlider(props: RangeSliderProps) {
	const [value, setValue] = useState(props.value ?? 0);
	const onChange = useCallback(
		(value: Polaris.RangeSliderProps["value"], id: string) => {
			props.onChange?.(value, id);
			setValue(value);
		},
		[props.onChange],
	);

	return (
		<Polaris.RangeSlider
			{...props}
			id={props.name}
			onChange={onChange}
			value={value}
		/>
	);
}

export interface SelectProps extends Omit<Polaris.SelectProps, "name"> {
	name: Polaris.SelectProps["name"];
	ref?: Ref<typeof Polaris.Select>;
}

export function Select(props: SelectProps) {
	const [value, setValue] = useState(props.value ?? "");
	const onChange = useCallback(
		(value: string, id: string) => {
			props.onChange?.(value, id);
			setValue(value);
		},
		[props.onChange],
	);

	return (
		<Polaris.Select
			{...props}
			id={props.name}
			onChange={onChange}
			value={value}
		/>
	);
}

export interface TextFieldProps extends Omit<Polaris.TextFieldProps, "name"> {
	name: Polaris.TextFieldProps["name"];
	ref?: Ref<typeof Polaris.TextField>;
}

export function TextField(props: TextFieldProps) {
	const [value, setValue] = useState(props.value ?? "");
	const onChange = useCallback(
		(value: string, id: string) => {
			props.onChange?.(value, id);
			setValue(value);
		},
		[props.onChange],
	);

	return (
		<Polaris.TextField
			{...props}
			id={props.name}
			onChange={onChange}
			value={value}
		/>
	);
}
