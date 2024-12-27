import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Process AI moves every 2 seconds
crons.interval(
  "process AI moves",
  { seconds: 2 },
  internal.aiMoves.processAIMoves
);

export default crons;
