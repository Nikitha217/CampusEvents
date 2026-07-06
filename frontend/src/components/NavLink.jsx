import {
  NavLink as RouterNavLink,
} from "react-router-dom";

import { forwardRef } from "react";

import { cn } from "../lib/utils";

const NavLink = forwardRef(
  (
    {
      className,
      activeClassName,
      pendingClassName,
      children,
      to,
      icon: Icon,
      badge,
      ...props
    },
    ref
  ) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({
          isActive,
          isPending,
        }) =>
          cn(
            // BASE
            "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",

            // DEFAULT
            "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50",

            // ACTIVE
            isActive &&
              "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:text-white",

            // PENDING
            isPending &&
              "opacity-70 animate-pulse",

            // CUSTOM
            className,

            isActive &&
              activeClassName,

            isPending &&
              pendingClassName
          )
        }
        {...props}
      >
        {({
          isActive,
        }) => (
          <>
            {/* ICON */}

            {Icon && (
              <div
                className={cn(
                  "flex items-center justify-center transition-all duration-300",

                  isActive
                    ? "text-white"
                    : "text-gray-500 group-hover:text-indigo-600"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            )}

            {/* TEXT */}

            <span className="flex-1">
              {children}
            </span>

            {/* BADGE */}

            {badge && (
              <span
                className={cn(
                  "text-[10px] px-2 py-1 rounded-full font-semibold",

                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-indigo-100 text-indigo-600"
                )}
              >
                {badge}
              </span>
            )}

            {/* ACTIVE GLOW */}

            {isActive && (
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
            )}
          </>
        )}
      </RouterNavLink>
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };