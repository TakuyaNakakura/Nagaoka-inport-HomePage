"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

export type AppNavItem = {
  href: string;
  label: string;
  matchMode?: "exact" | "prefix";
};

export type AppNavGroup = {
  title: string;
  items: AppNavItem[];
};

type MatchedItem = {
  groupTitle: string;
  item: AppNavItem;
};

const isItemActive = (pathname: string, item: AppNavItem) => {
  if (item.matchMode === "exact") {
    return pathname === item.href;
  }

  if (item.href === "/") {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
};

const getCurrentItem = (pathname: string, groups: AppNavGroup[]): MatchedItem | null => {
  const matches = groups.flatMap((group) =>
    group.items
      .filter((item) => isItemActive(pathname, item))
      .map((item) => ({ groupTitle: group.title, item }))
  );

  if (matches.length === 0) {
    return null;
  }

  return matches.sort((left, right) => right.item.href.length - left.item.href.length)[0];
};

type SharedNavigationProps = {
  groups: AppNavGroup[];
};

export const AppShellNavigation = ({ groups }: SharedNavigationProps) => {
  const pathname = usePathname();

  return (
    <div className="app-sidebar__nav">
      {groups.map((group) => (
        <nav key={group.title} className="nav-group" aria-label={group.title}>
          <p className="nav-group__title">{group.title}</p>
          <div className="nav-group__list">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href as Route}
                className={`nav-link ${isItemActive(pathname, item) ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ))}
    </div>
  );
};

export const AppShellCurrentLocation = ({ groups }: SharedNavigationProps) => {
  const pathname = usePathname();
  const current = getCurrentItem(pathname, groups);

  if (!current) {
    return null;
  }

  return (
    <div className="topbar-context" aria-label="現在地">
      <span className="topbar-context__label">現在地</span>
      <strong className="topbar-context__title">{current.item.label}</strong>
      <span className="topbar-context__meta">{current.groupTitle}</span>
    </div>
  );
};
