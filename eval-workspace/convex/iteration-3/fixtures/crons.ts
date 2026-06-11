import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Send the daily digest every morning.
crons.daily(
  "daily-digest",
  { hourUTC: 9, minuteUTC: 0 },
  api.messages.sendDigest,
  {},
);

export default crons;
