"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = __importDefault(require("zod"));
const __1 = require("../");
const scraper_provider_1 = require("../scraper-provider");
const SearchSchema = zod_1.default.object({
    query: zod_1.default.string().min(1, "Query must not be empty"),
    provider: zod_1.default.enum(["google", "bing", "yahoo", "duckduckgo"], {
        message: "Provider must be one of google, bing, duckduckgo or yahoo",
    }),
});
// Helper function to map provider string to enum
function getSearchEngine(provider) {
    switch (provider) {
        case "google":
            return scraper_provider_1.SearchEngine.GOOGLE;
        case "bing":
            return scraper_provider_1.SearchEngine.BING;
        case "duckduckgo":
            return scraper_provider_1.SearchEngine.DUCKDUCKGO;
        case "yahoo":
            return scraper_provider_1.SearchEngine.YAHOO;
        default:
            throw new Error("Invalid provider");
    }
}
// Main search function with automatic cancellation
function search(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate request
        const parsed = SearchSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid request",
                errors: parsed.error.issues,
            });
        }
        // Check scraper availability
        if (!__1.scraper) {
            return res.status(500).json({ message: "Scraper not initialized" });
        }
        const { query, provider } = parsed.data;
        const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        console.log(`[${requestId}] Starting search for query: "${query}" with provider: ${provider}`);
        try {
            // Get search engine enum
            const searchEngine = getSearchEngine(provider);
            // Start cancellable search
            const { promise, cancel } = yield __1.scraper.search(query, searchEngine);
            let isCancelled = false;
            // Setup automatic cancellation on client disconnect
            const handleCancel = (event) => {
                if (!isCancelled) {
                    isCancelled = true;
                    console.log(`[${requestId}] Client ${event}, cancelling search for query: "${query}"`);
                    cancel();
                }
            };
            // Listen for ALL possible client disconnect events
            req.on("close", () => handleCancel("disconnected"));
            req.on("aborted", () => handleCancel("aborted"));
            req.on("error", () => handleCancel("errored"));
            // Also monitor if response is finished/destroyed
            res.on("close", () => handleCancel("response closed"));
            res.on("finish", () => console.log(`[${requestId}] Response finished normally`));
            console.log(`[${requestId}] Request events attached, waiting for results...`);
            // Wait for search results
            const results = yield promise;
            if (!isCancelled) {
                console.log(`[${requestId}] Search completed successfully with ${results.length} results`);
                return res.json({
                    success: true,
                    results,
                    requestId,
                });
            }
        }
        catch (error) {
            console.error(`[${requestId}] Search error:`, error);
            // Handle different error types
            if (error instanceof Error) {
                if (error.message === "Request cancelled") {
                    console.log(`[${requestId}] Request was cancelled`);
                    return res.status(499).json({
                        success: false,
                        message: "Request cancelled",
                        requestId,
                    });
                }
                if (error.message === "Invalid provider") {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid provider",
                        requestId,
                    });
                }
            }
            return res.status(500).json({
                success: false,
                message: "Search failed",
                error: error instanceof Error ? error.message : String(error),
                requestId,
            });
        }
    });
}
// Setup routes
const router = (0, express_1.Router)();
router.post("/search", search);
exports.default = router;
