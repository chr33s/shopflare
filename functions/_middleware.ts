import { ensureInstalledOnShop } from "@/lib/middleware";

export const onRequest = [ensureInstalledOnShop];
