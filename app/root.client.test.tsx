import { createRoutesStub } from "react-router";
import { test } from "vitest";
import { render } from "vitest-browser-preact";

import Root from "./root";

test("component", () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: Root as any,
      children: [{ index: true, Component: () => null }],
    },
  ]);

  render(<Stub initialEntries={["/"]} />);
});
