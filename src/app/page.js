"use client";

import { useState, useEffect } from "react";
import { parseStream } from "../utils/streaming";

export default function Home() {
  const [contestID, setContestID] = useState("");
  const [problemIndex, setProblemIndex] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");
  const [result, setResult] = useState(null);
  const [sourceCode, setSourceCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "pupil",
    "newbie",
    "specialist",
    "expert",
    "candidate master",
    "master",
    "international master",
    "grandmaster",
    "international grandmaster",
    "legendary grandmaster",
  ];

  const languages = [
    "PyPy 3-64",
    "C++17 (GCC 7-32)",
    "Python 3",
    "PyPy 3",
    "C++14 (GCC 6-32)",
    "C++20 (GCC 13-64)",
    "Java 21",
    "JavaScript",
  ];

  const maneesh = async () => {
    const sc = sourceCode;
    const prompt = sc;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/explainCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        // Handle the streaming data
        parseStream(response, (chunk) => {
          let a = chunk.replace(/\\n/g, '\n'); // Log the chunk
          setExplanation(a); // Update explanation with new chunks
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "An error occurred");
      }
    } catch (error) {
      setError("An error occurred while fetching the data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const url = `https://codeforces.com/problemset/status/${contestID}/problem/${problemIndex}`;

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, category, language }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.data);
        console.log(data.data);
      } else {
        setError(data.error || "An error occurred");
      }
    } catch (error) {
      setError("An error occurred while fetching the data.");
    } finally {
      setLoading(false);
    }
  };

  const handleExplainClick = async () => {
    if (!result || result.length === 0) {
      console.log("No result available");
      return;
    }

    const url = result[0].submission;
    setLoading(true);
    setError("");

    try {
      console.log("manesh", url);
      const response = await fetch("/api/codeExtraction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        setSourceCode(data.data.sourceCode);
      } else {
        setError(data.error || "An error occurred");
      }
    } catch (error) {
      setError("An error occurred while fetching the data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Updated sourceCode:", sourceCode); // Log when sourceCode updates
  }, [sourceCode]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-800 to-black p-8">
      <h1 className="text-5xl font-bold text-white mb-10 font-['Roboto']">Codeforces Submission Scraper</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Submit Problem Details</h2>
        <input
          type="text"
          value={contestID}
          onChange={(e) => setContestID(e.target.value)}
          placeholder="Enter Contest ID"
          className="w-full h-12 px-4 py-2 text-black border border-gray-300 rounded-lg mb-4"
          required
        />
        <input
          type="text"
          value={problemIndex}
          onChange={(e) => setProblemIndex(e.target.value)}
          placeholder="Enter Problem Index"
          className="w-full h-12 px-4 py-2 text-black border border-gray-300 rounded-lg mb-4"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full h-12 px-4 py-2 pr-8 text-black border border-gray-300 rounded-lg mb-4 "
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full h-12 px-4 py-2 pr-8 text-black border border-gray-300 rounded-lg mb-4"
          required
        >
          <option value="">Select Language</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full font-semibold bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Scraping..." : "Scrape Submission"}
        </button>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {result && (
        <div className="mt-4 w-full max-w-md bg-black p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-white">Results:</h2>
          <pre className="bg-gray-800 p-2 rounded-lg overflow-x-auto text-white">
            {result.length > 0 ? (
              <div>
                <div className="mb-2">
                  <strong>Author:</strong> {result[0].author}
                </div>
                <div className="mb-2">
                  <a
                    href={result[0].submission} // Adjust URL as needed
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Submission
                  </a>
                </div>
                <div className="mb-2">
                  <button
                    onClick={handleExplainClick}
                    className="text-blue-500 underline bg-transparent border-none cursor-pointer"
                  >
                    View the Code
                  </button>
                </div>
              </div>
            ) : (
              <p>No results found.</p>
            )}
          </pre>
        </div>
      )}
      {sourceCode && (
        <div>
          <div className="mt-4 w-full max-w-md bg-black p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-white">Source Code:</h2>
            <pre className="bg-gray-800 p-2 rounded-lg overflow-x-auto text-white">
              {sourceCode}
            </pre>
          </div>
          <div>
            <button
              onClick={maneesh}
              className="w-full h-[5vh] bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mt-4"
            >
              Explain
            </button>
          </div>
        </div>
      )}
      {explanation && (
        <div className="mt-4 w-full max-w-md bg-black p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-white">Explanation:</h2>
          <pre className="bg-gray-800 p-2 rounded-lg overflow-x-auto text-white">
            {explanation}
          </pre>
        </div>
      )}
    </div>
  );
}
