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

// Store active requests for cancellation tracking
const activeRequests = new Map<string, () => void>();

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

  // Generate unique request ID
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

    // Get cancellable search
    const { promise, cancel } = await scraper.search(query, enumProvider);

    // Store cancel function for this request
    activeRequests.set(requestId, cancel);

    // Handle client disconnect (request cancellation)
    req.on("close", () => {
      console.log(`Client disconnected, cancelling request ${requestId}`);
      const cancelFn = activeRequests.get(requestId);
      if (cancelFn) {
        cancelFn();
        activeRequests.delete(requestId);
      }
    });

    // Handle abort signal if available (for newer Node.js versions)
    if (req.signal) {
      req.signal.addEventListener("abort", () => {
        console.log(`Request aborted, cancelling request ${requestId}`);
        const cancelFn = activeRequests.get(requestId);
        if (cancelFn) {
          cancelFn();
          activeRequests.delete(requestId);
        }
      });
    }

    // Wait for results
    const results = await promise;

    // Clean up - remove from active requests
    activeRequests.delete(requestId);

    return res.json({
      results,
      requestId, // Include for potential future cancellation API
    });
  } catch (error) {
    // Clean up on error
    activeRequests.delete(requestId);

    console.error("Search error:", error);

    // Handle cancellation error specifically
    if (error instanceof Error && error.message === "Request cancelled") {
      return res.status(499).json({
        message: "Request cancelled",
        requestId,
      }); // 499 Client Closed Request
    }

    return res.status(500).json({
      message: "Search failed",
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });
  }
}

// Optional: Add endpoint to manually cancel requests
async function cancelSearch(req: Request, res: Response) {
  const { requestId } = req.params;

  const cancelFn = activeRequests.get(requestId);
  if (!cancelFn) {
    return res.status(404).json({
      message: "Request not found or already completed",
      requestId,
    });
  }

  try {
    cancelFn();
    activeRequests.delete(requestId);

    return res.json({
      message: "Request cancelled successfully",
      requestId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to cancel request",
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });
  }
}

// Optional: Get status of all active requests
async function getActiveRequests(req: Request, res: Response) {
  const scraperStatus = scraper?.getStatus();

  return res.json({
    activeRequestsCount: activeRequests.size,
    activeRequestIds: Array.from(activeRequests.keys()),
    scraperStatus,
  });
}

// Optional: Cancel all active requests
async function cancelAllRequests(req: Request, res: Response) {
  try {
    const cancelledCount = activeRequests.size;

    // Cancel all stored requests
    for (const [requestId, cancelFn] of activeRequests) {
      try {
        cancelFn();
      } catch (error) {
        console.error(`Error cancelling request ${requestId}:`, error);
      }
    }

    // Clear the map
    activeRequests.clear();

    // Also cancel any requests still in scraper queue
    const scraperCancelled = scraper?.cancelAllRequests() || 0;

    return res.json({
      message: "All requests cancelled",
      cancelledRequests: cancelledCount,
      scraperCancelled,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to cancel all requests",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Cleanup function - call this when shutting down server
function cleanup() {
  console.log(`Cleaning up ${activeRequests.size} active requests`);
  for (const [requestId, cancelFn] of activeRequests) {
    try {
      cancelFn();
    } catch (error) {
      console.error(
        `Error cancelling request ${requestId} during cleanup:`,
        error,
      );
    }
  }
  activeRequests.clear();
}

// Export the functions
export { search, cancelSearch, getActiveRequests, cancelAllRequests, cleanup };

const router = Router();
router.post("/search", search);
export default router;
