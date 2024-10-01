import axios from "axios";
import { load } from "cheerio"; // Import load function directly

const scrapeCodeforcesProblemStatus = async (url, category, language) => {
  console.log("lang", language);
  const categories = [category];

  try {
    const submissions = {};
    let pageIndex = 1;
    let categoriesFound = 0;

    // Loop through pages until either 500 pages or all categories are found
    while (pageIndex <= 500 && categoriesFound < categories.length) {
      const currentPageUrl = `${url}/page/${pageIndex}?order=BY_PROGRAM_LENGTH_ASC`;

      try {
        const { data } = await axios.get(currentPageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://codeforces.com',
          }
        });

        // Load the HTML data into cheerio using load
        const $ = load(data);

        // Parse each row in the table
        $("table.status-frame-datatable tbody tr").each((index, element) => {
          // If enough categories are found, stop processing
          if (categoriesFound >= categories.length) return false; // This will break the loop

          const submissionId = $(element).find("td:nth-child(1)").text().trim();
          const authorTitle = $(element).find("td.status-party-cell a").attr("title") || "unknown";
          const authorFirstWord = authorTitle.split(" ")[0].toLowerCase();
          const lang = $(element).find("td:nth-child(5)").text().trim();
          const verdict = $(element).find("span.verdict-accepted").text().trim() ||
                          $(element).find("span.verdict").text().trim();

          // Check if the submission matches the desired category, language, and verdict
          if (
            !submissions[authorFirstWord] &&
            categories.includes(authorFirstWord) &&
            verdict === "Accepted" &&
            lang === language
          ) {
            submissions[authorFirstWord] = {
              submission: `https://codeforces.com/contest/${url.split("/")[5]}/submission/${submissionId}`,
              author: authorTitle,
            };
            categoriesFound++;
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error.response ? error.response.status : error.message);
        break; // Stop if there's an issue with fetching data
      }

      pageIndex++;
    }

    return Object.values(submissions); // Return an array of submissions
  } catch (error) {
    console.error("Error scraping website:", error);
    throw new Error("Failed to scrape website.");
  }
};

export { scrapeCodeforcesProblemStatus };