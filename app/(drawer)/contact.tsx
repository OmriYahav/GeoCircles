import React, { Suspense } from "react";

const ContactScreen = React.lazy(() => import("../../src/screens/ContactScreen"));

export default function ContactRoute() {
  return (
    <Suspense fallback={null}>
      <ContactScreen />
    </Suspense>
  );
}
