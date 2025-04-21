export interface WebhookQueueMessage {
	payload: unknown;
	webhook: {
		subTopic: string;
		apiVersion: string;
		domain: string;
		hmac: string;
		topic: string;
		webhookId: string;
	}
}