import axios from 'axios';
import cheerio from 'cheerio';

const scrapeCodeforcesProblemStatus = async (baseUrl) => {
  const numPages = 1;  // Hardcoded to scrape 50 pages
  try {
    const submissions = [];

    for (let page = 1; page <= numPages; page++) {
      const pageUrl = `${baseUrl}/page/${page}?order=BY_PROGRAM_LENGTH_ASC`;
      const { data } = await axios.get(pageUrl);
      const $ = cheerio.load(data);

      $('table.status-frame-datatable tbody tr').each((index, element) => {
        const submissionId = $(element).find('td:nth-child(1)').text().trim();
        const authorTitle = $(element).find('td:nth-child(3) a').attr('title');
        const authorFirstWord = authorTitle ? authorTitle.split(' ')[0] : 'Unknown';
        const language = $(element).find('td:nth-child(5)').text().trim();
        const verdict = $(element).find('span.verdict-accepted').text().trim() || $(element).find('span.verdict').text().trim();

        submissions.push({ submissionId, author: authorFirstWord, language, verdict });
      });
    }

    return submissions;
  } catch (error) {
    console.error("Error scraping website:", error);
    throw new Error("Failed to scrape website.");
  }
};

export { scrapeCodeforcesProblemStatus };
