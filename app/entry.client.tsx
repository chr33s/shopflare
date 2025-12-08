import i18next from "i18next";
import { hydrate } from "preact";
import { startTransition } from "preact/compat";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { HydratedRouter } from "react-router/dom";

import i18n, { LanguageDetector } from "./i18n";

async function main() {
  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      ...i18n,
      detection: {
        searchParams: new URL(window.location.href).searchParams,
      },
    });

  startTransition(() => {
    hydrate(
      <I18nextProvider i18n={i18next}>
        <HydratedRouter />
      </I18nextProvider>,
      document,
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(main);
} else {
  window.setTimeout(main, 1);
}
