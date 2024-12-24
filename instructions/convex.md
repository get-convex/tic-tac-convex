Hey, so we want to make a project using `convex`, which is a full-stack platform that both has a DB as well as a backend, and is meant for frontend developers.

Specifically, I want you to generate a React App that works with `convex` in a first-class way. We'll start with some examples + how to set up `convex` in an app

# How to set up convex in a react app

You already probably know how to set up a basic `react` app that doesn't have `convex`. In the case where the user doesn't have a `react` app, advise them to create it with `vite` as `create-react-app` is kind of deprecated:

```sh
npm create vite@latest PROJ_NAME --template react
```

In the case where it's created like this, the entry point is `src/main.jsx` (assuming JavaScript)

Assuming we have a `react` project, adding `convex` to an app is as simple as this:

```sh
npm install convex
npx convex dev
```

This will prompt the user to set up the `convex` app w/ the backend & authenticate. It will also create the `convex/` directory.

`npx convex dev` runs a server that will autogenerate `convex` definitions for use. So you don't have to run `npx convex codegen`. It also generates a `.env.local` which has the `CONVEX_URL` plugged in, ready to be used for `vite`.

# How to plug in Convex into the App

You have to wrap your app with the `ConvexProvider`. Something like this:

```jsx
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

# How to query / mutate with Convex

Remember, Convex is a backend + DB. So we want to be able to store & fetch data. The following example is inside `convex/` (not `src/convex`), which holds server-side `convex` handler code for reading & writing documents.

```jsx
// convex/tasks.ts
import { query, mutation } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const send = mutation({
  args: { body: v.string(), author: v.string() },
  returns: v.null(),
  handler: async (ctx, { body, author }) => {
    const message = { body, author };
    await ctx.db.insert("tasks", message);
  },
});
```

Convex only supports certain `js/ts` types. Specifically:

```
convex-type js/ts-type
Id	string
Null	null
Int64	bigint
Float64	number
Boolean	boolean
String	string
Bytes	ArrayBuffer
Array	Array
Object	Object
Record	Record(TS only)
```

So you can't send a `Date` to `convex` for example. You'll have to first convert it to a `string` or `Object` of some kind.

# How to wire that data into a React component

```jsx
// YourComponent.tsx (or .jsx)
import { useQuery, useMutation } from "convex/react";
// Note: this path is relative. The `convex` directory is at the root of the project, so above `src`. In the case where you're writing code that's in `src/components/*`, you'd want to import `../../convex/_generated/...`
import { api } from "../convex/_generated/api";

function YourComponent() {
  const tasks = useQuery(api.tasks.get);
  const addTask = useMutation(api.tasks.send);

  // Use tasks and addTask in your component...
}
```

So now you can use `tasks` within a JSX component like normal. Calling `addTask` will rerender everything.