import express from "express";
import whetherController from "./controllers/whether-controller";
import SERPScraper from "./scraper-provider";
// Initialize
const app = express();
let scraper: SERPScraper | null = null;
const PORT = 3000;

// Middleware
app.use(express.static("public"));
app.use(express.json());

// Controllers
app.use("/weather", whetherController);

app.get("/", (req, res) => {
  res.redirect("/weather");
});
app.listen(PORT, () => {
  scraper = new SERPScraper();
  console.log("⚡️[server]: Server is running at http://localhost:" + PORT);
});

process.on("SIGINT", async () => {
  await scraper?.closeBrowser();
  process.exit();
});

process.on("SIGUSR2", async () => {
  await scraper?.closeBrowser();
  process.exit();
});
