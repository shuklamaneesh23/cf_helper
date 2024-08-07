import axios from 'axios';
import cheerio from 'cheerio';

const scrapeCodeforcesSubmission = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const submissionDetails = {};

    // Extract the verdict
    submissionDetails.verdict = $('span.verdict-accepted').text().trim();

    // Extract the programming language
    submissionDetails.language = $('table td:contains("Programming Language") + td').text().trim();

    // Extract the source code
    submissionDetails.sourceCode = $('#program-source-text').text().trim();

    return submissionDetails;
  } catch (error) {
    console.error("Error scraping website:", error);
    throw new Error("Failed to scrape website.");
  }
};

export { scrapeCodeforcesSubmission };