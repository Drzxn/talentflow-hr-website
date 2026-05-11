export default function Settings({ user }) {
  return (
    <>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Manage your profile and website settings.</p>

      <div className="settings-card">
        <h3>Profile Information</h3>

        <div className="form-group">
          <label>Name</label>
          <input type="text" value={user.name} readOnly />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="text" value={user.email} readOnly />
        </div>

        <div className="form-group">
          <label>Role</label>
          <input type="text" value="Admin" readOnly />
        </div>

        <button className="btn-primary">Save Changes</button>
      </div>
    </>
  );
}
