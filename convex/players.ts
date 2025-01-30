import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  },
  returns: v.id("players"),
  handler: async (ctx, { name, kind }) =>
    await ctx.db.insert("players", { name, kind }),
});

export const get = query({
  args: {
    id: v.id("players"),
  },
  returns: v.object({
    _id: v.id("players"),
    _creationTime: v.number(),
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  }),
  handler: async (ctx, { id }) => {
    const player = await ctx.db.get(id);
    if (!player) throw new Error("Player not found");
    return player;
  },
});

export const getMultiple = query({
  args: {
    ids: v.array(v.id("players")),
  },
  returns: v.array(
    v.object({
      _id: v.id("players"),
      _creationTime: v.number(),
      name: v.string(),
      kind: v.union(v.literal("human"), v.literal("ai")),
    })
  ),
  handler: async (ctx, { ids }) => {
    const players = await Promise.all(ids.map((id) => ctx.db.get(id)));
    return players.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});
