import axios from "axios";
import cheerio from "cheerio";

const scrapeCodeforcesProblemStatus = async (url, category, language) => {
  console.log("lang", language);
  const categories = [category];

  try {
    const submissions = {};
    let pageIndex = 1;
    let categoriesFound = 0;

    while (pageIndex <= 500 && categoriesFound < categories.length) {
      const currentPageUrl = `${url}/page/${pageIndex}?order=BY_PROGRAM_LENGTH_ASC`;

      const { data } = await axios.get(currentPageUrl);
      const $ = cheerio.load(data);

      $("table.status-frame-datatable tbody tr").each((index, element) => {
        if (categoriesFound >= categories.length) return;

        const submissionId = $(element).find("td:nth-child(1)").text().trim();
        const authorTitle = $(element)
          .find("td.status-party-cell a")
          .attr("title");
        const authorFirstWord = authorTitle
          ? authorTitle.split(" ")[0].toLowerCase()
          : "unknown";
        const lang = $(element).find("td:nth-child(5)").text().trim(); // Renamed to avoid shadowing variable
        const verdict =
          $(element).find("span.verdict-accepted").text().trim() ||
          $(element).find("span.verdict").text().trim();

        if (
          !submissions[authorFirstWord] &&
          categories.includes(authorFirstWord) &&
          verdict === "Accepted" &&
          lang === language
        ) {
          submissions[authorFirstWord] = {
            submission: `https://codeforces.com/contest/${
              url.split("/")[5]
            }/submission/${submissionId}`,
            author: authorTitle,
          };
          categoriesFound++;
        }
      });

      pageIndex++;
    }

    return Object.values(submissions);
  } catch (error) {
    console.error("Error scraping website:", error);
    throw new Error("Failed to scrape website.");
  }
};

export { scrapeCodeforcesProblemStatus };
