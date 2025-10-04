"use client";

import { useState, useEffect } from "react";
import { parseStream } from "@/utils/streaming";
import ThemeToggler from "@/components/themetoggler"; 
import { categories, languages } from "../utils/constants";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true); 
  const [contestID, setContestID] = useState("");
  const [problemIndex, setProblemIndex] = useState("");
  const [category, setCategory] = useState("");
  const [baseLanguage, setBaseLanguage] = useState("");
  const [result, setResult] = useState(null);
  const [sourceCode, setSourceCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        parseStream(response, (chunk) => {
          let a = chunk.replace(/\\n/g, '\n');
          setExplanation(a); 
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
      const selectedLanguages = languageCategories[baseLanguage] || []; // baseLanguage is a string like "C++" or "Python" (a valid key from languageCategories)

      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, category, languageList: selectedLanguages }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.data);
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
    console.log("Updated sourceCode:", sourceCode); 
  }, [sourceCode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-8 ${
        isDarkMode ? "bg-gradient-to-r from-gray-800 to-black p-8" : "bg-gray-100 text-black"
      }`}
    >
      {/* Theme toggler button */}
      <div className="absolute top-4 right-7 ">
        <ThemeToggler isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
      </div>

      {/* Logo */}
      {isDarkMode && (
        <div className="absolute top-4 left-3">
          <Image src="/logo2dark.png" alt="Logo" width={250} height={250} className="p-0.5" />
        </div>
      )}
      {!isDarkMode && (
        <div className="absolute top-4 left-3">
          <Image src="/logo2light.png" alt="Logo" width={250} height={250} className="p-0.5" />
        </div>
      )}

      <h1 className="text-5xl font-bold mb-10 font-['Roboto']">Codeforces Submission Scraper</h1>

      <form onSubmit={handleSubmit} className={`w-full max-w-md p-8 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Submit Problem Details
        </h2>
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
          className="w-full h-12 px-4 py-2 pr-8 text-black border border-gray-300 rounded-lg mb-4"
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
          value={baseLanguage}
          onChange={(e) => setBaseLanguage(e.target.value)}
          className="w-full h-12 px-4 py-2 pr-8 text-black border border-gray-300 rounded-lg mb-4"
          required
        >
          <option value="">Select Language</option>
          {Object.keys(languageCategories).map((baseLang) => (
            <option key={baseLang} value={baseLang}>
              {baseLang}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full font-semibold bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Scraping..." : "Retrieve Submission"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-500">{error}</p>}
      {result && (
        <div className={`mt-4 w-full max-w-md  p-4 rounded-lg shadow-md
        ${isDarkMode? "bg-black":"bg-gray-400" }`}>
          <h2 className={`text-xl font-semibold mb-2 text-white`}>Results:</h2>
          <pre className={` p-2 rounded-lg overflow-x-auto text-white
            ${isDarkMode? "bg-gray-800":"bg-white"}`}>
            {result.length > 0 ? (
              <div>
                <div className={`mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>
                  <strong>Author:</strong> {result[0].author}
                </div>
                <div className="mb-2">
                  <a
                    href={result[0].submission}
                    target="_blank"
                    rel="noreferrer"
                    className={` underline ${isDarkMode ? "text-blue-500" : "text-blue-700"}`}
                  >
                    View Submission
                  </a>
                </div>
                <div className="mb-2">
                  <button
                    onClick={handleExplainClick}
                    className={` underline bg-transparent border-none cursor-pointer ${isDarkMode ? "text-blue-500 " : "text-blue-700"}`}
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
