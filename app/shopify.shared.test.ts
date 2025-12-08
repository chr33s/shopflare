import { expect, test } from "vitest";

import * as shopify from "./shopify.shared";

test("log", () => {
  expect(shopify.log.error()).toBeDefined();
});
