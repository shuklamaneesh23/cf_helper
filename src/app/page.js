'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [verdict, setVerdict] = useState('');
  const [language, setLanguage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, verdict, language }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.data);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (error) {
      setError('An error occurred while fetching the data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <h1 className="text-2xl font-bold mb-4">Codeforces Problem Status Scraper</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Codeforces Problem Status URL"
          className="w-full px-4 py-2 border rounded-lg mb-4"
          required
        />
        <input
          type="text"
          value={verdict}
          onChange={(e) => setVerdict(e.target.value)}
          placeholder="Enter Verdict (e.g., OK)"
          className="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <input
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="Enter Programming Language"
          className="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Scraping...' : 'Scrape'}
        </button>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {result && (
        <div className="mt-4 w-full max-w-md bg-black p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Filtered Data:</h2>
          <pre className="bg-gray-900 p-2 rounded-lg overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
