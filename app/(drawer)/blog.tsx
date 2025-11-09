import React, { Suspense } from "react";

const BlogScreen = React.lazy(() => import("../../src/screens/BlogScreen"));

export default function BlogRoute() {
  return (
    <Suspense fallback={null}>
      <BlogScreen />
    </Suspense>
  );
}
