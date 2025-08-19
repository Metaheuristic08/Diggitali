import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Database, Settings, LayoutDashboard } from "lucide-react"

export default function AdminNavbar() {
  const pathname = usePathname()
  
  const navItems = [
    { 
      name: "Cargar Preguntas", 
      href: "/admin", 
      icon: FileText,
      active: pathname === "/admin"
    },
    { 
      name: "Ver Preguntas", 
      href: "/admin/questions", 
      icon: Database,
      active: pathname === "/admin/questions"
    },
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: LayoutDashboard,
      active: false
    }
  ]
  
  return (
    <div className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <Settings className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-bold">Panel de Administración</h1>
        </div>
        
        <nav className="flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                item.active
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-700 text-gray-300 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 mr-1" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}