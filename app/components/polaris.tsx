import * as Polaris from "@shopify/polaris";
import type {
	LinkLikeComponent,
	LinkLikeComponentProps,
} from "@shopify/polaris/build/ts/src/utilities/link";
import {
	type ComponentPropsWithRef,
	type FunctionComponent,
	useCallback,
	useState,
} from "react";
import { Link as ReactRouterLink } from "react-router";

export * from "@shopify/polaris";

// TODO: [Combobox, DropZone]

export function AppProvider({ children, ...props }: Polaris.AppProviderProps) {
	return (
		<Polaris.AppProvider {...props} linkComponent={Link}>
			{children}
		</Polaris.AppProvider>
	);
}

type UncontrolledType<
	Props,
	Component extends FunctionComponent<Props>,
> = Props & {
	name: string;
} & ComponentPropsWithRef<Component>;

export type CheckboxProps = UncontrolledType<
	Polaris.CheckboxProps,
	typeof Polaris.Checkbox
>;

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

export type DatePickerProps = UncontrolledType<
	Polaris.DatePickerProps,
	typeof Polaris.DatePicker
>;

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

export type LinkProps = LinkLikeComponentProps &
	ComponentPropsWithRef<LinkLikeComponent>;

export function Link({ url, ...props }: LinkProps) {
	return <ReactRouterLink {...props} to={url} />;
}

export type RadioButtonProps = UncontrolledType<
	Polaris.RadioButtonProps,
	typeof Polaris.RadioButton
>;

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

export type RangeSliderProps = UncontrolledType<
	Polaris.RangeSliderProps,
	typeof Polaris.RangeSlider
>;

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

export type SelectProps = UncontrolledType<
	Polaris.SelectProps,
	typeof Polaris.Select
>;

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

export type TextFieldProps = UncontrolledType<
	Polaris.TextFieldProps,
	typeof Polaris.TextField
>;

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
