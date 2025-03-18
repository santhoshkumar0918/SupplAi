// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   ChevronLeft,
//   ChevronRight,
//   LayoutDashboard,
//   Package,
//   Thermometer,
//   PlusSquare,
//   ActivitySquare,
//   Settings,
//   Bot,
// } from "lucide-react";

// const Sidebar: React.FC = () => {
//   const pathname = usePathname();
//   const [collapsed, setCollapsed] = useState(false);

//   const toggleSidebar = () => {
//     setCollapsed(!collapsed);
//   };

//   const navItems = [
//     {
//       name: "Dashboard",
//       href: "/dashboard",
//       icon: <LayoutDashboard className="h-5 w-5" />,
//     },
//     {
//       name: "Batches",
//       href: "/batches",
//       icon: <Package className="h-5 w-5" />,
//     },
//     {
//       name: "Temperature",
//       href: "/temperature/record",
//       icon: <Thermometer className="h-5 w-5" />,
//     },
//     {
//       name: "Create Batch",
//       href: "/batches/create",
//       icon: <PlusSquare className="h-5 w-5" />,
//     },
//     {
//       name: "System Health",
//       href: "/system/health",
//       icon: <ActivitySquare className="h-5 w-5" />,
//     },
//   ];

//   return (
//     <div
//       className={`${
//         collapsed ? "w-20" : "w-64"
//       } bg-gray-950 text-white h-full fixed left-0 top-11vh transition-all duration-300 shadow-xl z-40`}
//     >
//       <div className="flex justify-end p-2">
//         <button
//           onClick={toggleSidebar}
//           className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
//         >
//           {collapsed ? <ChevronRight /> : <ChevronLeft />}
//         </button>
//       </div>

//       <div className="mt-4 flex flex-col h-[calc(100%-60px)] justify-between">
//         <nav className="space-y-2 px-3">
//           {navItems.map((item) => (
//             <Link
//               key={item.name}
//               href={item.href}
//               className={`flex items-center p-3 rounded-lg transition-colors ${
//                 pathname === item.href
//                   ? "bg-blue-800 text-white"
//                   : "text-gray-300 hover:text-white hover:bg-gray-800"
//               }`}
//             >
//               <div className="flex items-center">
//                 {item.icon}
//                 {!collapsed && (
//                   <span className="ml-3 transition-opacity duration-300">
//                     {item.name}
//                   </span>
//                 )}
//               </div>
//             </Link>
//           ))}
//         </nav>

//         <div className="px-3 mb-6">
//           <div
//             className={`p-4 rounded-lg bg-gray-800 ${
//               collapsed ? "text-center" : ""
//             }`}
//           >
//             <Bot className="h-6 w-6 text-blue-400 mx-auto mb-2" />
//             {!collapsed && (
//               <>
//                 <h5 className="font-medium text-sm text-white mb-1">
//                   Berry Agent
//                 </h5>
//                 <p className="text-xs text-gray-400">
//                   Monitoring your cold chain 24/7
//                 </p>
//                 <div className="mt-3 flex items-center">
//                   <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
//                   <span className="text-xs text-gray-300">Active</span>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;


"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Package,
  Thermometer,
  PlusSquare,
  ActivitySquare,
  Settings,
  Bot,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Batches",
      href: "/batches",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Temperature",
      href: "/temperature/record",
      icon: <Thermometer className="h-5 w-5" />,
    },
    {
      name: "Create Batch",
      href: "/batches/create",
      icon: <PlusSquare className="h-5 w-5" />,
    },
    {
      name: "System Health",
      href: "/system/health",
      icon: <ActivitySquare className="h-5 w-5" />,
    },
  ];

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-gray-950 text-white h-[calc(100vh-4rem)] fixed left-0 top-20 transition-all duration-300 shadow-xl z-40`}
    >
      <div className="flex justify-end p-2">
        <button
          onClick={toggleSidebar}
          className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      <div className="mt-4 flex flex-col h-[calc(100%-60px)] justify-between">
        <nav className="space-y-2 px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? "bg-blue-800 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center">
                {item.icon}
                {!collapsed && (
                  <span className="ml-3 transition-opacity duration-300">
                    {item.name}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </nav>

        <div className="px-3 mb-10">
          <div
            className={`p-4 rounded-lg bg-gray-800 ${
              collapsed ? "text-center" : ""
            }`}
          >
            <Bot className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            {!collapsed && (
              <>
                <h5 className="font-medium text-sm text-white mb-1">
                  Berry Agent
                </h5>
                <p className="text-xs text-gray-400">
                  Monitoring your cold chain 24/7
                </p>
                <div className="mt-3 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-300">Active</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;