import "./instrument";
import {
	Page,
	TextBlock,
	reactExtension,
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension("customer-account.page.render", () => (
	<CustomPage />
));

function CustomPage() {
	return (
		<Page title="Custom Page">
			<TextBlock>Text...</TextBlock>
		</Page>
	);
}
