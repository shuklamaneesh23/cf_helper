import { scrapeCodeforcesProblemStatus } from '../../../utils/scrapper';

export async function POST(req) {
  const { url, verdict, language } = await req.json();

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate the URL format
  const urlPattern = /^https:\/\/codeforces\.com\/problemset\/status\/\d+\/problem\/[A-Z]$/;
  if (!urlPattern.test(url)) {
    return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await scrapeCodeforcesProblemStatus(url);

    // Filter data based on the verdict and language
    const filteredData = data.filter(submission => {
      return (!verdict || submission.verdict.includes(verdict)) && (!language || submission.language.includes(language));
    });

    return new Response(JSON.stringify({ data: filteredData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to scrape website' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
