import React, { Suspense } from "react";

import AnimatedLoader from "../../src/components/AnimatedLoader";

const BlogScreen = React.lazy(() => import("../../src/screens/BlogScreen"));

export default function BlogRoute() {
  return (
    <Suspense fallback={<AnimatedLoader />}>
      <BlogScreen />
    </Suspense>
  );
}
