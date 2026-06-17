
interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  return (
    <div className="mb-10 pt-2">
      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'hsl(34, 32%, 52%)' }}>
        Dashboard
      </p>
      <h1 className="text-3xl font-semibold mb-1" style={{ color: 'hsl(220, 30%, 12%)', fontFamily: "'Raleway', sans-serif" }}>
        Welcome back, {userName}
      </h1>
      <p className="text-sm" style={{ color: 'hsl(220, 12%, 46%)' }}>Inspection overview · last 90 days</p>
    </div>
  );
};

export default DashboardHeader;
