type MailAddress = {
	email: string;
	name: string;
};

type MailContent = {
	type: "text/plain" | "text/html";
	value: string;
};

type MailPersonalization = {
	to: MailAddress[];
};

type Mail = {
	content: MailContent[];
	from: MailAddress;
	personalizations: MailPersonalization[];
	subject: string;
};

export async function send(mail: Mail) {
	return new Request("https://api.mailchannels.net/tx/v1/send", {
		body: JSON.stringify(mail),
		headers: { "content-type": "application/json" },
		method: "POST",
	});
}
