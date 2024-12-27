
# Adding Convex to an existing project

You first need to run this once to setup Convex initially, this will create some files and folders for you.

```bash
bun convex dev --once --configure=new
```

You should not modify `.env.local` directly to add the convex url, the above command will do that for you.

As this is a React and Vite project you should remember to add the Convex provider at the top level.

```tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Note: this assumes you're using `vite`
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
root.render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
```

# convex/values

You should consult the "Module: values" document when working with the `convex/values` module so that you know what types are available to use.