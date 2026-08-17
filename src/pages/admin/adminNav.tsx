import { LayoutDashboard, UserCheck, FileCheck2, Users, UserCog, School, ClipboardList, Wallet, Receipt, Settings } from "lucide-react";
import type { NavItem } from "../../components/layout/AppShell";

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Approvals", path: "/admin/approvals", icon: UserCheck },
  { label: "Admissions", path: "/admin/admissions", icon: FileCheck2 },
  { label: "Students", path: "/admin/students", icon: Users },
  { label: "Teachers", path: "/admin/teachers", icon: UserCog },
  { label: "Classrooms", path: "/admin/classrooms", icon: School },
  { label: "Assessments", path: "/admin/assessments", icon: ClipboardList },
  { label: "Fees & Terms", path: "/admin/fees", icon: Wallet },
  { label: "Billing", path: "/admin/billing", icon: Receipt },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];
