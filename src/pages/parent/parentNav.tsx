import { Home, UserPlus } from "lucide-react";
import type { NavItem } from "../../components/layout/AppShell";

export const parentNavItems: NavItem[] = [
  { label: "Home", path: "/parent", icon: Home },
  { label: "Apply", path: "/parent/apply", icon: UserPlus },
];
