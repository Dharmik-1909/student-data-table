import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/students";
const ROWS_OPTIONS = [5, 10, 20, 30, 50, 100, 150, 200, 250, 300];

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "E-mail" },
  { key: "age", label: "Age" },
  { key: "course", label: "Course" },
  { key: "city", label: "City" },
];

function App() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch from json-server on mount (no localStorage)
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed with status " + res.status);
        return res.json();
      })
      .then((students) => {
        setData(students);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          "Could not load students. Make sure json-server is running on port 5000. (" +
          err.message +
          ")"
        );
        setLoading(false);
      });
  }, []);

  // 1. FILTER - search across all columns
  const query = searchQuery.trim().toLowerCase();
  const filteredData = data.filter((student) =>
    Object.values(student).some((value) =>
      String(value).toLowerCase().includes(query)
    )
  );

  // 2. SORT - based on sortConfig state (copy first so state isn't mutated)
  const sortedData = filteredData.slice().sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    let result;
    if (typeof aVal === "number" && typeof bVal === "number") {
      result = aVal - bVal;
    } else {
      result = String(aVal).localeCompare(String(bVal), undefined, {
        sensitivity: "base",
      });
    }
    return sortConfig.direction === "asc" ? result : -result;
  });

  // 3. SLICE - rows for the current page
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;
  const pageData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
    setCurrentPage(1);
  };

  const handleRowsChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="container-fluid px-3">
      <div className="students-wrapper">
        <h1 className="students-title h2">Students Data</h1>

        <input
          type="text"
          className="form-control search-input mb-3"
          placeholder="Search Here"
          value={searchQuery}
          onChange={handleSearch}
        />

        <div className="table-responsive">
          <table className="table table-bordered students-table align-middle">
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th key={col.key} onClick={() => handleSort(col.key)}>
                    {col.label}
                    {sortConfig.key === col.key && (
                      <span className="sort-arrow">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="empty-row">
                  <td colSpan={COLUMNS.length}>Loading...</td>
                </tr>
              )}
              {error && (
                <tr className="empty-row">
                  <td colSpan={COLUMNS.length}>{error}</td>
                </tr>
              )}
              {!loading && !error && pageData.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={COLUMNS.length}>No students match your search.</td>
                </tr>
              )}
              {pageData.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.age}</td>
                  <td>{student.course}</td>
                  <td>{student.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="rowsPerPage" className="mb-0">
              Per Pages Data
            </label>
            <select
              id="rowsPerPage"
              className="form-select form-select-sm"
              value={rowsPerPage}
              onChange={handleRowsChange}
            >
              {ROWS_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="page-text">
            Page {safePage} of {totalPages}
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-danger btn-sm"
              disabled={safePage === 1}
              onClick={() => setCurrentPage(safePage - 1)}
            >
               Previous
            </button>
            <button
              className="btn btn-primary btn-sm"
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
            >
              Next 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
