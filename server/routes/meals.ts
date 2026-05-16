```typescript
import { Router, type IRouter } from "express";
import { db, mealsTable } from "@workspace/db";
import {
  ListMealsResponse,
  LogMealBody,
  AnalyzeMealBody,
  AnalyzeMealResponse,
  GetNutritionSummaryResponse,
} from "@workspace/api-zod";
import { gte, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

// Get today's meals
router.get("/meals", async (_req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const meals = await db.select().from(mealsTable).where(gte(mealsTable.loggedAt, today)).orderBy(desc(mealsTable.loggedAt));
  res.json(ListMealsResponse.parse(meals));
});

// Log a meal manually
router.post("/meals", async (req, res): Promise<void> => {
  const parsed = LogMealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [meal] = await db.insert(mealsTable).values({
    ...parsed.data,
    calories: parsed.data.calories != null ? Math.round(parsed.data.calories) : null,
    protein: parsed.data.protein != null ? Math.round(parsed.data.protein) : null,
    carbs: parsed.data.carbs != null ? Math.round(parsed.data.carbs) : null,
    fat: parsed.data.fat != null ? Math.round(parsed.data.fat) : null,
  }).returning();
  res.status(201).json(meal);
});

// Analyze meal text description
router.post("/meals/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeMealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const prompt = `You are an elite sports nutritionist AI coaching a high-performance athlete on a clean bulk. 
Analyze this meal description and estimate accurate macros.

Meal description: "${parsed.data.description}"

Rules:
- Use realistic, large serving sizes suited for a clean bulk.
- Scale portions accurately (e.g. 8oz chicken breast = ~220 cal, 53g protein).
- Assume a full high-performance athlete serving if unclear.

Return ONLY valid JSON:
{
  "name": "short descriptive meal name",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "athleteFeedback": "Direct coaching feedback on how this meal supports mass, recovery, or gym performance."
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (response.choices[0]?.message?.content ?? "{}").trim();
  const cleaned = raw.replace(/^

```
```(?
  let parsed2: any;
  try { parsed2 = JSON.parse(cleaned); } catch { parsed2 = {}; }

  res.json(AnalyzeMealResponse.parse({
    name: parsed2.name ?? parsed.data.description,
    calories: parsed2.calories ?? 0,
    protein: parsed2.protein ?? 0,
    carbs: parsed2.carbs ?? 0,
    fat: parsed2.fat ?? 0,
    athleteFeedback: parsed2.athleteFeedback ?? "Fuel up. Stay consistent with the bulk.",
  }));
});

// Analyze meal image (The Scanner Engine)
router.post("/meals/analyze-image", async (req, res): Promise<void> => {
  const { imageBase64, mimeType, notes } = req.body as { imageBase64?: string; mimeType?: string; notes?: string };
  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  const notesLine = notes ? `\nAthlete note: "${notes}" — adjust macros accordingly.` : "";
  const prompt = `You are a precise sports nutrition AI vision model. Analyze this image to support an elite athlete's mass-building goals.

STEP 1: Identify Context
- FOOD PHOTO: Estimate volume/weight for a high-calorie clean bulk.
- NUTRITION LABEL: Read exact numbers printed on the box. Precision is 100% required.
- PACKAGED FOOD: Use known baseline data for performance meals.${notesLine}

STEP 2: Elite Performance Calculation
- Reflect true muscle recovery needs. Never underestimate calories/protein for this frame.

Return ONLY valid JSON:
{
  "name": "specific food name",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "athleteFeedback": "High-energy coaching feedback focusing on clean bulk execution and gym power."
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: `data:${mimeType ?? "image/jpeg"};base64,${imageBase64}` } },
      ],
    }],
  });

  const raw = (response.choices[0]?.message?.content ?? "{}").trim();
  const cleaned = raw.replace(/^

```
```(?
  let parsed2: any;
  try { parsed2 = JSON.parse(cleaned); } catch { parsed2 = {}; }

  res.json(AnalyzeMealResponse.parse({
    name: parsed2.name ?? parsed.data.description,
    calories: parsed2.calories ?? 0,
    protein: parsed2.protein ?? 0,
    carbs: parsed2.carbs ?? 0,
    fat: parsed2.fat ?? 0,
    athleteFeedback: parsed2.athleteFeedback ?? "Fuel up. Stay consistent with the bulk.",
  }));
});

// Analyze meal image (The Scanner Engine)
router.post("/meals/analyze-image", async (req, res): Promise<void> => {
  const { imageBase64, mimeType, notes } = req.body as { imageBase64?: string; mimeType?: string; notes?: string };
  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  const notesLine = notes ? `\nAthlete note: "${notes}" — adjust macros accordingly.` : "";
  const prompt = `You are a precise sports nutrition AI vision model. Analyze this image to support an elite athlete's mass-building goals.

STEP 1: Identify Context
- FOOD PHOTO: Estimate volume/weight for a high-calorie clean bulk.
- NUTRITION LABEL: Read exact numbers printed on the box. Precision is 100% required.
- PACKAGED FOOD: Use known baseline data for performance meals.${notesLine}

STEP 2: Elite Performance Calculation
- Reflect true muscle recovery needs. Never underestimate calories/protein for this frame.

Return ONLY valid JSON:
{
  "name": "specific food name",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "athleteFeedback": "High-energy coaching feedback focusing on clean bulk execution and gym power."
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: `data:${mimeType ?? "image/jpeg"};base64,${imageBase64}` } },
      ],
    }],
  });

  const raw = (response.choices[0]?.message?.content ?? "{}").trim();
  const cleaned = raw.replace(/^

```
