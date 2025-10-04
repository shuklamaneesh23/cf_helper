import { scrapeCodeforcesProblemStatus } from '../../../utils/scrapper';

export async function POST(req) {
  const { url, category,language } = await req.json();
  
  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!category) {
    return new Response(JSON.stringify({ error: 'Category is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!language) {
    return new Response(JSON.stringify({ error: 'Language is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  

  // Adjusted URL format pattern
  const urlPattern = /^https:\/\/codeforces\.com\/problemset\/status\/\d+\/problem\/[A-Z]$/;
  if (!urlPattern.test(url)) {
    console.log('URL:', url);
    console.log('URL Pattern Match:', urlPattern.test(url));
    return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await scrapeCodeforcesProblemStatus(url,category,language);

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
