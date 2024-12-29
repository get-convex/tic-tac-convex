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