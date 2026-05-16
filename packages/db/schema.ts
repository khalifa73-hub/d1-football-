```typescript
import { pgTable, serial, text, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";

// Table for all your AI-scanned and manually logged meals
export const mealsTable = pgTable("meals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  athleteFeedback: text("athlete_feedback"),
  loggedAt: timestamp("logged_at").defaultNow().notNull(),
});

// Table for tracking your physical gains (Weight, Smith Machine, 40-Yard Dash)
export const progressTable = pgTable("progress_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id"), 
  metric: text("metric").notNull(), // e.g., 'smithMachineBench', 'fortyYardDash'
  value: text("value").notNull(),  // Stored as text to handle decimals/times
  unit: text("unit"),              // lbs, sec, in, etc.
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow().notNull(),
});

```
