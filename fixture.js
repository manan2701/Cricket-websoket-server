require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { performance } = require("perf_hooks");

const API_TOKEN = process.env.MATCH_API_TOKEN;
const BASE_URL = "https://cricket.sportmonks.com/api/v2.0/fixtures";

/**
 * Fetch all fixtures (all pages)
 */
async function fetchAllFixtures() {
  const allFixtures = [];

  console.log("Fetching first page...");

  const firstPageStart = performance.now();

  const firstRes = await axios.get(BASE_URL, {
    params: {
      api_token: API_TOKEN,
      sort: "starting_at",
      include: "localteam,visitorteam,venue,league,winnerteam,runs,tosswon"
    },
  });

  const firstPageEnd = performance.now();
  console.log(
    `Page 1 fetched in ${(firstPageEnd - firstPageStart).toFixed(2)} ms`
  );

  allFixtures.push(...(firstRes.data.data || []));

  const lastPage = firstRes.data.meta?.last_page || 1;

  if (lastPage <= 1) return allFixtures;

  // Fetch remaining pages in parallel
  const requests = [];

  for (let page = 2; page <= lastPage; page++) {
    requests.push(
      (async () => {
        const start = performance.now();

        const res = await axios.get(BASE_URL, {
          params: {
            api_token: API_TOKEN,
            page,
            sort: "starting_at",
            include: "localteam,visitorteam,venue,league,winnerteam,runs,tosswon"
          },
        });

        const end = performance.now();

        console.log(
          `Page ${page} fetched in ${(end - start).toFixed(2)} ms`
        );

        return res.data.data || [];
      })()
    );
  }

  const results = await Promise.all(requests);

  for (const pageFixtures of results) {
    allFixtures.push(...pageFixtures);
  }

  return allFixtures;
}

/**
 * Save fixtures and calculate total execution time
 */
async function saveFixturesToFile() {
  console.log("Starting fixture fetch...");

  const totalStart = performance.now();

  try {
    const fixtures = await fetchAllFixtures();

    const filePath = path.join(__dirname, "fixtures.json");

    fs.writeFileSync(filePath, JSON.stringify(fixtures, null, 2));

    const totalEnd = performance.now();

    console.log("------------------------------------------------");
    console.log(`Saved ${fixtures.length} fixtures`);
    console.log(`File: ${filePath}`);
    console.log(
      `Total execution time: ${(totalEnd - totalStart).toFixed(2)} ms`
    );
    console.log("------------------------------------------------");
  } catch (error) {
    console.error("Error while fetching fixtures:", error.message);
  }
}

/**
 * Run script
 */
saveFixturesToFile();
