import { ReactNode, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, GraduationCap, LucideIcon } from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "../../store/authStore";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface AppShellProps {
  navItems: NavItem[];
  pageTitle: string;
  children: ReactNode;
}

/**
 * One shell for every role. Desktop always gets a left sidebar. Mobile gets
 * a bottom tab bar when there are few enough destinations to fit thumb-width
 * tabs (Parent, Teacher); with more than 4 (Admin), a bottom bar would be
 * cramped, so it becomes a slide-out drawer instead — same nav data, the
 * shell just picks the layout that fits the item count.
 */
export function AppShell({ navItems, pageTitle, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const useBottomTabs = navItems.length <= 4;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-navy-100 bg-white md:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-700">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-navy-700">Scholify</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
        </nav>
        <div className="border-t border-navy-100 p-4">
          <p className="truncate text-sm font-medium text-ink-900">{user?.fullName}</p>
          <p className="truncate text-xs text-ink-400">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-500 hover:bg-surface-muted hover:text-danger-600"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-navy-100 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-700">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-base font-bold text-navy-700">Scholify</span>
        </div>
        {!useBottomTabs && (
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-ink-700 hover:bg-surface-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </header>

      {/* Mobile drawer (admin — more sections than fit a bottom bar) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white p-4 shadow-raised">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-base font-bold text-navy-700">Menu</span>
              <button onClick={() => setDrawerOpen(false)} className="rounded-full p-1.5 hover:bg-surface-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <SidebarLink key={item.path} item={item} onClick={() => setDrawerOpen(false)} />
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-surface-muted hover:text-danger-600"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="md:ml-64">
        <div className="hidden border-b border-navy-100 bg-white px-8 py-5 md:block">
          <h1 className="font-display text-xl font-bold text-ink-900">{pageTitle}</h1>
        </div>
        <div className="px-4 py-5 md:px-8 md:py-6 pb-24 md:pb-6">{children}</div>
      </main>

      {/* Mobile bottom tabs (Parent / Teacher — 4 or fewer destinations) */}
      {useBottomTabs && (
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex border-t border-navy-100 bg-white/95 backdrop-blur md:hidden">
          {navItems.map((item) => (
            <BottomTab key={item.path} item={item} />
          ))}
        </nav>
      )}
    </div>
  );
}

function SidebarLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive ? "bg-action-50 text-action-700" : "text-ink-500 hover:bg-surface-muted hover:text-ink-900"
        )
      }
    >
      <item.icon className="h-[18px] w-[18px]" />
      {item.label}
    </NavLink>
  );
}

function BottomTab({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        clsx(
          "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
          isActive ? "text-action-600" : "text-ink-400"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className={clsx("flex h-8 w-11 items-center justify-center rounded-full transition-colors", isActive && "bg-action-50")}>
            <item.icon className="h-5 w-5" />
          </div>
          {item.label}
        </>
      )}
    </NavLink>
  );
}
