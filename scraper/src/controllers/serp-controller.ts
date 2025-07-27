import { Request, Response, Router } from "express";
import z from "zod";
import { scraper } from "../";
import { SearchEngine } from "../scraper-provider";

const SearchSchema = z.object({
  query: z.string().min(1, "Query must not be empty"),
  provider: z.enum(["google", "bing", "yahoo", "duckduckgo"], {
    message: "Provider must be one of google, bing, duckduckgo or yahoo",
  }),
});

// Helper function to map provider string to enum
function getSearchEngine(provider: string): SearchEngine {
  switch (provider) {
    case "google":
      return SearchEngine.GOOGLE;
    case "bing":
      return SearchEngine.BING;
    case "duckduckgo":
      return SearchEngine.DUCKDUCKGO;
    case "yahoo":
      return SearchEngine.YAHOO;
    default:
      throw new Error("Invalid provider");
  }
}

// Main search function with automatic cancellation
async function search(req: Request, res: Response) {
  // Validate request
  const parsed = SearchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request",
      errors: parsed.error.issues,
    });
  }

  // Check scraper availability
  if (!scraper) {
    return res.status(500).json({ message: "Scraper not initialized" });
  }

  const { query, provider } = parsed.data;

  try {
    // Get search engine enum
    const searchEngine = getSearchEngine(provider);

    // Start cancellable search
    const { promise, cancel } = await scraper.search(query, searchEngine);

    // Setup automatic cancellation on client disconnect
    const handleCancel = () => {
      console.log(
        `Client disconnected, cancelling search for query: "${query}"`,
      );
      cancel();
    };

    // Listen for client disconnect events
    req.on("close", handleCancel);
    req.on("aborted", handleCancel);

    // Wait for search results
    const results = await promise;

    return res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Search error:", error);

    // Handle different error types
    if (error instanceof Error) {
      if (error.message === "Request cancelled") {
        return res.status(499).json({
          success: false,
          message: "Request cancelled",
        });
      }

      if (error.message === "Invalid provider") {
        return res.status(400).json({
          success: false,
          message: "Invalid provider",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Search failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Setup routes
const router = Router();

router.post("/search", search);

export default router;
