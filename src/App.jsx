import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [listings, setListings] = useState([]);
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fetching, setFetching] = useState(false);
  const [date, setDate] = useState("");
  const [scraping, setScraping] = useState(false); // Add scraping state
  const backendUrl = "https://your-backend.vercel.app";

  useEffect(() => {
    fetchListings();
  }, [city, type, date]);

  const fetchListings = async () => {
    try {
      const response = await axios.get(`${backendUrl}/landlords`, {
        params: { city, type, date },
      });
      setListings(response.data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const handleRunScrape = async () => {
    setScraping(true); // Set scraping to true
    try {
      await axios.post(`${backendUrl}/landlords/run-scrape`, { username, password });
      fetchListings();
    } catch (error) {
      console.error("Error running scrape:", error);
    } finally {
      setScraping(false); // Set scraping to false
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(`${backendUrl}/landlords/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "landlords.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
  };

  return (
    <div className="container">
      <h1>SchoolProp Listings</h1>
      <div className="scrape-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleRunScrape} disabled={scraping}>
          {scraping ? "Scraping..." : "Run Scrape"}
        </button>
      </div>
      <div className="filters">
        <label>City:</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <label>Type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All</option>
          <option value="BTS">BTS</option>
          <option value="Lease">Lease</option>
        </select>
        <label>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={handleDownloadExcel}>Download Excel</button>
      </div>
      {fetching ? (
        <p>Fetching...</p>
      ) : (
        <ul className="listings">
          {listings.map((l) => (
            <li key={l._id} className="listing-item">
              <strong>{l.city}</strong> - {l.type} <br />
              {l.phone && <div>Phone: {l.phone}</div>}
              {l.email && <div>Email: {l.email}</div>}
              {l.location && <div>Location: {l.location}</div>}
              {l.details && <div>Details: {l.details}</div>}
              <button onClick={() => alert(JSON.stringify(l, null, 2))}>
                Access Details
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;