import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ user, page, setPage, onLogout, children }) {
  return (
    <div className="app-wrap">
      <Sidebar page={page} setPage={setPage} />

      <div className="main-area">
        <Header user={user} onLogout={onLogout} />

        <main className="page">{children}</main>
      </div>
    </div>
  );
}