import { Link } from "wouter";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  to: string;
  className?: string;
  activeClassName?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, to, children, onClick }, ref) => {
    return (
      <Link to={to} className={cn(className)} onClick={onClick}>
        {children}
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
