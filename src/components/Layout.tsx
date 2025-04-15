import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingBagIcon,
  HomeIcon,
  UserIcon,
  ShoppingCartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    {
      to: "/market",
      icon: ShoppingCartIcon,
      label: "Market",
    },
    {
      to: "/misc",
      icon: SparklesIcon,
      label: "Misc",
    },
    {
      to: "/",
      icon: HomeIcon,
      label: "Spider",
      isHome: true
    },
    {
      to: "/bag",
      icon: ShoppingBagIcon,
      label: "Bag",
    },
    {
      to: "/profile",
      icon: UserIcon,
      label: "Profile",
    },
  ];

  return (
    <div className="min-h-screen">
      {children}
      
      <nav className="fixed bottom-4 left-4 right-4 z-50">
        {/* Gradient overlay for better visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent -z-10 rounded-[1.2rem]" />
        
        {/* Blur backdrop */}
        <div className="absolute inset-0 backdrop-blur-lg bg-black/20 -z-10 rounded-[1.2rem]" />
        
        {/* Navigation content */}
        <div className="max-w-lg mx-auto px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-3 sm:py-4 flex justify-around items-center">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={clsx(
                "flex flex-col items-center gap-0.5 xs:gap-1 transition-all duration-200 relative group",
                item.isHome ? "-mt-4 xs:-mt-5 sm:-mt-6 md:-mt-8" : ""
              )}
            >
              {/* Background glow effect */}
              <div
                className={clsx(
                  "absolute inset-0 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-200",
                  location.pathname === item.to ? "bg-teal-400" : "bg-white"
                )}
              />
              
              {/* Icon container */}
              {item.isHome ? (
                <div className={clsx(
                  "w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transform transition-transform duration-200",
                  "hover:scale-110",
                  location.pathname === item.to ? "scale-110" : ""
                )}>
                  <img 
                    src="https://raw.githubusercontent.com/stackblitz/stackblitz-web/main/src/assets/images/logo.svg" 
                    alt="Spider"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <item.icon
                  className={clsx(
                    "w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-colors duration-200",
                    location.pathname === item.to
                      ? "text-teal-400"
                      : "text-gray-400 group-hover:text-white"
                  )}
                />
              )}
              
              {/* Label */}
              <span
                className={clsx(
                  "text-[8px] xs:text-[10px] sm:text-xs font-medium transition-colors duration-200",
                  location.pathname === item.to
                    ? "text-teal-400"
                    : "text-gray-400 group-hover:text-white"
                )}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default Layout;