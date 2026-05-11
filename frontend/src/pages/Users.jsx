import Home from "./Home";

export default function Users() {
  return (
    <>
      <h1 className="page-title">Users</h1>
      <p className="page-subtitle">Manage admins, managers, and employees.</p>

      <Home
        user={{
          name: "Admin",
        }}
      />
    </>
  );
}
