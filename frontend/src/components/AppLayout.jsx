import Sidebar from './Sidebar'
import { AppNavbar } from './Navbar'

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      {/* Desktop sidebar */}
      <div className="app-sidebar">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="app-main">
        {/* Mobile top navbar */}
        <AppNavbar />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
