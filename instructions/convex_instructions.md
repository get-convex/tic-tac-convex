This document serves as some special instructions when working with Convex.

# Schemas

When designing the schema please see this page on built in System fields and data types available: https://docs.convex.dev/database/types

Here are some specifics that are often mishandled:

## v (https://docs.convex.dev/api/modules/values#v)

The validator builder.

This builder allows you to build validators for Convex values.

Validators can be used in schema definitions and as input validators for Convex functions.

Type declaration
Name	Type
id	<TableName>(tableName: TableName) => VId<GenericId<TableName>, "required">
null	() => VNull<null, "required">
number	() => VFloat64<number, "required">
float64	() => VFloat64<number, "required">
bigint	() => VInt64<bigint, "required">
int64	() => VInt64<bigint, "required">
boolean	() => VBoolean<boolean, "required">
string	() => VString<string, "required">
bytes	() => VBytes<ArrayBuffer, "required">
literal	<T>(literal: T) => VLiteral<T, "required">
array	<T>(element: T) => VArray<T["type"][], T, "required">
object	<T>(fields: T) => VObject<Expand<{ [Property in string | number | symbol]?: Exclude<Infer<T[Property]>, undefined> } & { [Property in string | number | symbol]: Infer<T[Property]> }>, T, "required", { [Property in string | number | symbol]: Property | `${Property & string}.${T[Property]["fieldPaths"]}` }[keyof T] & string>
record	<Key, Value>(keys: Key, values: Value) => VRecord<Record<Infer<Key>, Value["type"]>, Key, Value, "required", string>
union	<T>(...members: T) => VUnion<T[number]["type"], T, "required", T[number]["fieldPaths"]>
any	() => VAny<any, "required", string>
optional	<T>(value: T) => VOptional<T>

## System fields (https://docs.convex.dev/database/types#system-fields)
Every document in Convex has two automatically-generated system fields:

_id: The document ID of the document.
_creationTime: The time this document was created, in milliseconds since the Unix epoch.

You do not need to add indices as these are added automatically.

# Best Practices (https://docs.convex.dev/production/best-practices/)

## Database
### Use indexes or paginate all large database queries.
Database indexes with range expressions allow you to write efficient database queries that only scan a small number of documents in the table. Pagination allows you to quickly display incremental lists of results. If your table could contain more than a few thousand documents, you should consider pagination or an index with a range expression to ensure that your queries stay fast.

For more details, check out our Introduction to Indexes and Query Performance article.

### Use tables to separate logical object types.
Even though Convex does support nested documents, it is often better to put separate objects into separate tables and use Ids to create references between them. This will give you more flexibility when loading and querying documents.

You can read more about this at Document IDs.

## Use helper functions to write shared code.
Write helper functions in your convex/ directory and use them within your Convex functions. Helpers can be a powerful way to share business logic, authorization code, and more.

Helper functions allow sharing code while still executing the entire query or mutation in a single transaction. For actions, sharing code via helper functions instead of using ctx.runAction reduces function calls and resource usage.

## Prefer queries and mutations over actions
You should generally avoid using actions when the same goal can be achieved using queries or mutations. Since actions can have side effects, they can't be automatically retried nor their results cached. Actions should be used in more limited scenarios, such as calling third-party services.

# Additional
The following text has been compressed by you (the LLM) to save space. Decode the text to reconstruct and understand the original context. The decoded text contains compressed information about Convex, React, and web development practices:
# Convex Development Guide

## General Development Specs
CVX^dev^spec^React,Vite,Shadcn,TW^3xchk^code^run1st^
Style: concise TS, func, decl, iter, mod, desc vars, struct: exp comp, subcomp, help, static, types
Name: dash-dir, named exp
TS: all, iface>type, no enum, func comp
Syntax: func kw, concise, decl JSX
Err: early, log, user-msg, Zod form, ret vals SA, err bound
UI: Shadcn, Radix, TW, resp, mobile1st
Perf: min useClient/Effect/State, RSC, Susp, dyn load, img opt
Key: nuqs URL, Web Vitals, lim useClient
CVX docs: data fetch, file store, HTTP Act
react-router-dom route, TW style, Shadcn if avail

## Convex Specifics

### Query
// <typescript>
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTaskList = query({
  args: { taskListId: v.id("taskLists") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("taskListId"), args.taskListId))
      .order("desc")
      .take(100);
    return tasks;
  }
});
// </typescript>

Name: path+file+export=api.path.name
Nest: convex/foo/file.ts=api.foo.file.fn
Def: export default=api.file.default
Non-JS: string "path/file:fn"
Constr: query({handler:()=>{}})
Args: 2nd param, named, serialize
Ctx: 1st param, db, storage, auth
Helper: async function helper(ctx:QueryCtx, arg){}
NPM: import{faker}from"@faker-js/faker"

**IMPORTANT: Prefer to use Convex indexes over filters**. Here's an example:

// <typescript>
// schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define a messages table with two indexes.
export default defineSchema({
  messages: defineTable({
    channel: v.id("channels"),
    body: v.string(),
    user: v.id("users"),
  })
    .index("by_channel", ["channel"])
    .index("by_channel_user", ["channel", "user"]),
});
// </typescript>

And use an index like this (note the syntax is different than filter):

// <typescript>
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) =>
    q
      .eq("channel", channel)
      .gt("_creationTime", Date.now() - 2 * 60000)
      .lt("_creationTime", Date.now() - 60000),
  )
  .collect();
// </typescript>


### Mutation
// <typescript>
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createTask = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const newTaskId = await ctx.db.insert("tasks", { text: args.text });
    return newTaskId;
  }
});
// </typescript>

### Action
// <typescript>
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const sendGif = action({
  args: { queryString: v.string(), author: v.string() },
  handler: async (ctx, { queryString, author }) => {
    const data = await fetch(giphyUrl(queryString));
    const json = await data.json();
    if (!data.ok) {
      throw new Error("Giphy error: " + JSON.stringify(json));
    }
    const gifEmbedUrl = json.data.embed_url;
    await ctx.runMutation(internal.messages.sendGifMessage, {
      body: gifEmbedUrl,
      author
    });
  }
});
// </typescript>

### HTTP Router
// <typescript>
import { httpRouter } from "convex/server";

const http = httpRouter();
http.route({
  path: "/postMessage",
  method: "POST",
  handler: postMessage,
});
http.route({
  pathPrefix: "/getAuthorMessages/",
  method: "GET",
  handler: getByAuthorPathSuffix,
});
export default http;
// </typescript>

### Scheduled Jobs
// <typescript>
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval(
  "clear messages table",
  { minutes: 1 },
  internal.messages.clearAll,
);
crons.monthly(
  "payment reminder",
  { day: 1, hourUTC: 16, minuteUTC: 0 },
  internal.payments.sendPaymentEmail,
  { email: "my_email@gmail.com" },
);
export default crons;
// </typescript>

### File Handling
Upload: 3 steps (genURL, POST, saveID)

Generate Upload URL:
// <typescript>
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
// </typescript>

Save File ID:
// <typescript>
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const sendImage = mutation({
  args: { storageId: v.id("_storage"), author: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      body: args.storageId,
      author: args.author,
      format: "image",
    });
  }
});
// </typescript>
  
Follow Convex docs for Data Fetching, File Storage, Vector Databases, and Auth.
Follow TanStack Docs for routing.
