import CustomerDashboard from "./CustomerDashboard";

function UserDashboard({ account, onLogout }) {
  return <CustomerDashboard account={account} onLogout={onLogout} />;
}

export default UserDashboard;