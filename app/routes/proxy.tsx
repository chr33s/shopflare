import { Outlet } from "react-router";

import { Provider } from "#app/components/proxy";
import { APP_URL } from "#app/const";

export default function Proxy() {
  return (
    <Provider appUrl={APP_URL}>
      <Outlet />
    </Provider>
  );
}
