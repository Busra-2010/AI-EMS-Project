import Sidebar from './Sidebar';

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="ml-64 flex-1 overflow-y-auto">
        <main className="min-h-screen">
          {children}
        </main>
      </div>

    </div>
  );
}