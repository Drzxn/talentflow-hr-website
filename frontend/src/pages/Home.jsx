import { useState } from "react";
import { USERS_DATA } from "../data/dummyData";

export default function Home({ user }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = USERS_DATA.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      u.manager.toLowerCase().includes(search.toLowerCase())
  );

  const perPage = 5;
  const totalPages = Math.ceil(filtered.length / perPage);
  const pageUsers = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="greeting-card">
        <div>
          <h2>
            Hello, <em>{user.name.split(" ")[0]}</em> 👋
          </h2>
          <p>Here&apos;s what&apos;s happening at your organization today.</p>
        </div>

        <div className="greeting-art">
          {Array.from({ length: 10 }).map((_, i) => (
            <div className="g-dot" key={i}></div>
          ))}
        </div>
      </div>

      <div className="users-table">
        <div className="table-header">
          <h3>Team Members</h3>
          <input
            className="search-users"
            placeholder="Filter users…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Role</th>
              <th>Reporting Manager</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            {pageUsers.map((u, i) => (
              <tr key={u.email}>
                <td>{(page - 1) * perPage + i + 1}</td>
                <td>{u.name}</td>
                <td>
                  <span className={`role-badge role-${u.role.toLowerCase()}`}>
                    {u.role}
                  </span>
                </td>
                <td>{u.manager}</td>
                <td>{u.email}</td>
              </tr>
            ))}

            {pageUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-row">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`page-btn ${page === i + 1 ? "active" : ""}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
