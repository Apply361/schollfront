import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import * as XLSX from "xlsx";

function App() {
  const [listings, setListings] = useState([]);
  const [city, setCity] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [scraping, setScraping] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showDetails, setShowDetails] = useState({});
  const backendUrl = "https://schollpropback.onrender.com";

  useEffect(() => {
    fetchListings();
  }, [city]);

  const fetchListings = async () => {
    try {
      const response = await axios.get(`${backendUrl}/landlords`, { params: { city } });
      setListings(response.data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const handleRunScrape = async () => {
    setScraping(true);
    try {
      await axios.post(`${backendUrl}/landlords/run-scrape`, { username, password });
      fetchListings();
    } catch (error) {
      console.error("Error running scrape:", error);
    } finally {
      setScraping(false);
    }
  };

  const handleDownloadExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Listings");
    XLSX.writeFile(workbook, fileName);
  };

  const groupedListings = listings.reduce((acc, listing) => {
    const listingDate = listing.date ? listing.date.split('T')[0] : "Unknown Date";
    if (!acc[listingDate]) {
      acc[listingDate] = [];
    }
    acc[listingDate].push(listing);
    return acc;
  }, {});

  const toggleDetails = (id) => {
    setShowDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="container">
      <h1>SchoolProp Listings</h1>
      <div className="header-container">
        <div className="setup-header">
          <h2 style={{ color: "white" }}>Setup Details</h2>
          {showSetup && (
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
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <button onClick={handleRunScrape} disabled={scraping}>
                {scraping ? "Scraping..." : "Run Scrape"}
              </button>
            </div>
          )}
        </div>
        <button className="toggle-setup" onClick={() => setShowSetup(!showSetup)}>
          {showSetup ? "Hide Setup" : "Show Setup"}
        </button>
      </div>

      <div className="data-container">
        {Object.entries(groupedListings).map(([listingDate, listingsForDate]) => (
          <div key={listingDate} className="date-group">
            <ul className="listings">
              {listingsForDate.map((l) => (
                <li key={l._id} className="listing-item">
                  <div className="listing-content">
                    <div className="listing-date">{l.date ? l.date.split('T')[0] : "Unknown Date"}</div>
                    <div className="listing-title">
                      <strong>{l.city}</strong>
                    </div>
                  </div>
                  <button onClick={() => toggleDetails(l._id)}>
                    {showDetails[l._id] ? "Hide Details" : "View Details"}
                  </button>
                  {showDetails[l._id] && (
                    <div className="listing-details">
                      <table>
                        <thead>
                          <tr>
                            <th>S.No.</th>
                            <th>Name</th>
                            <th>Title</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Location</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>1</td>
                            <td>-</td>
                            <td>{l.city}</td>
                            <td>{l.phone || "-"}</td>
                            <td>{l.email || "-"}</td>
                            <td>{l.location || "-"}</td>
                            <td>{l.details || "-"}</td>
                          </tr>
                          <tr>
                            <td colSpan="7"><hr /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <button onClick={() => {
              const excelData = listingsForDate.map(l => ({
                Date: l.date ? l.date.split('T')[0] : "Unknown Date",
                City: l.city,
                Phone: l.phone,
                Email: l.email,
                Location: l.location,
                Details: l.details
              }));
              handleDownloadExcel(excelData, `${listingDate}_listings.xlsx`);
            }}>
              Download Excel for {listingDate}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
