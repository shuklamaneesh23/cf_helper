import { scrapeCodeforcesSubmission } from '../../../utils/codeExtracter';

export async function POST(req) {
  const { url } = await req.json();

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate the URL format
  const urlPattern = /^https:\/\/codeforces\.com\/contest\/\d+\/submission\/\d+$/;

  console.log(url);
  console.log(urlPattern.test(url));
  if (!urlPattern.test(url)) {
    return new Response(JSON.stringify({ error: 'Invalid URL format1' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await scrapeCodeforcesSubmission(url);
    return new Response(JSON.stringify({ data }), {
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