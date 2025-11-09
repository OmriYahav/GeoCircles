import React, { Suspense } from "react";

const LazyScreen = React.lazy(() => import("./ContactScreenContent"));

export default function ContactScreen() {
  return (
    <Suspense fallback={null}>
      <LazyScreen />
    </Suspense>
  );
}
