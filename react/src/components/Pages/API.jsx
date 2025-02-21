import React, { useState, useEffect } from "react";

function API() {
  // State for Remote CDM device info
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for API language selection
  const [selectedLanguage, setSelectedLanguage] = useState("python");

  useEffect(() => {
    fetch("/remotecdm/widevine/deviceinfo")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch device info");
        return response.json();
      })
      .then((data) => {
        setDeviceInfo(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching device info:", error);
        setError("Failed to load device information.");
        setLoading(false);
      });
  }, []);

  // Function to generate API request code based on selected language
  const generateCode = (endpoint) => {
    const apiUrl = `https://cdrm-project.com/api/${endpoint}`;
    switch (selectedLanguage) {
      case "python":
        return `import requests

response = requests.post(
    url='${apiUrl}',
    headers={'Content-Type': 'application/json'},
    json={'input': 'YOUR_PSSH_HERE'}
)
print(response.json())`;
      case "php":
        return `<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "${apiUrl}");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(["input" => "YOUR_PSSH_HERE"]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`;
      case "curl":
        return `curl -X POST "${apiUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "YOUR_PSSH_HERE"}'`;
      default:
        return "";
    }
  };

  return (
    <div className="min-w-full w-full min-h-full overflow-x-auto bg-zinc-900 shadow-lg shadow-black flex flex-col p-10">
      
      {/* API Language Selector */}
      <div className="mb-4">
        <label className="text-white mr-2">Select Language:</label>
        <select
          className="bg-gray-800 text-white p-2 rounded"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          <option value="python">Python</option>
          <option value="php">PHP</option>
          <option value="curl">cURL</option>
        </select>
      </div>

      {/* Decryption Request Section */}
      <DetailsSection title={`Sending a decryption request | (${selectedLanguage.toUpperCase()})`}>
        <CodeBlock>{generateCode("decrypt")}</CodeBlock>
      </DetailsSection>

      {/* Search Request Section */}
      <DetailsSection title={`Sending a search request | (${selectedLanguage.toUpperCase()})`}>
        <CodeBlock>{generateCode("cache/search")}</CodeBlock>
      </DetailsSection>

      {/* Remote CDM Configuration Section */}
      <DetailsSection title="Remote CDM configuration | (For Devine / VineTrimmeer / Extensions)">
        {loading ? (
          <p className="text-white">Loading device information...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="p-2 text-white">
            {Object.entries(deviceInfo).map(([key, value]) => (
              <p key={key}>
                <strong>{key.replace("_", " ")}:</strong> {value}
              </p>
            ))}
          </div>
        )}
      </DetailsSection>

      {/* Webvault Configuration Section */}
      <DetailsSection title="Webvault configuration | (For Devine / VineTrimmer)">
        <CodeBlock>
          {`key_vaults:
    - type: API
      name: "CDRM"
      uri: "https://cdrm-project.com/api/cache"
      token: "CDRM"`}
        </CodeBlock>
      </DetailsSection>
    </div>
  );
}

// 🔹 Reusable Section Component for API Details
function DetailsSection({ title, children }) {
  return (
    <details open className="p-5 mb-5 border shadow-lg shadow-black overflow-y-auto">
      <summary className="bg-[rgba(0,0,0,0.2)] p-2 rounded text-white flex shadow-purple-900 shadow-sm">
        {title}
      </summary>
      <div className="h-9/10 bg-[rgba(0,0,0,0.2)] p-2 rounded text-white shadow-sm shadow-purple-900 w-full overflow-x-auto">
        {children}
      </div>
    </details>
  );
}

// 🔹 Reusable Component for Code Blocks
function CodeBlock({ children }) {
  return <pre className="p-2 whitespace-pre-wrap break-all">{children}</pre>;
}

export default API;
