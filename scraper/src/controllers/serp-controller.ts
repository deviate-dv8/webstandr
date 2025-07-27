import { Request, Response, Router } from "express";
import z from "zod";
import { scraper } from "../app";
import { SearchEngine } from "../scraper-provider";
const SearchSchema = z.object({
  query: z.string().min(1, "Query must not be empty"),
  provider: z.enum(["google", "bing", "yahoo", "duckduckgo"], {
    message: "Provider must be one of google, bing, duckduckgo or yahoo",
  }),
});

async function search(req: Request, res: Response) {
  const parsed = SearchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request",
      errors: parsed.error.issues,
    });
  }
  const { query, provider } = parsed.data;
  if (!scraper) {
    return res.status(500).json({ message: "Scraper not initialized" });
  }
  try {
    let enumProvider;
    switch (provider) {
      case "google":
        enumProvider = SearchEngine.GOOGLE;
        break;
      case "bing":
        enumProvider = SearchEngine.BING;
        break;
      case "duckduckgo":
        enumProvider = SearchEngine.DUCKDUCKGO;
        break;
      case "yahoo":
        enumProvider = SearchEngine.YAHOO;
        break;
      default:
        return res.status(400).json({ message: "Invalid provider" });
    }
    const results = await scraper?.search(query, enumProvider);
    return res.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Search failed", error: error });
  }
  return res.json({ message: "Search" });
}

const router = Router();
router.post("/search", search);
export default router;
