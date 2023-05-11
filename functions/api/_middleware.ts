import { errorHandling, validateAuthenticatedSession } from "@/lib/middleware";

export const onRequest = [errorHandling, validateAuthenticatedSession];
