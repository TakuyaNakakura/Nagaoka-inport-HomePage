import Link from "next/link";
import type { Route } from "next";
import { LogoutButton } from "./LogoutButton";
import type { User } from "@/lib/types";

const primaryNav = [
  { href: "/", label: "ホーム" },
  { href: "/news", label: "お知らせ" },
  { href: "/centers", label: "取り組み紹介" },
  { href: "/activity-reports", label: "活動報告" },
  { href: "/support-projects", label: "支援プロジェクト" },
  { href: "/companies", label: "会員企業" },
  { href: "/tech-seeds", label: "技術シーズ" },
  { href: "/about", label: "サイトについて" }
];

const memberNav = [
  { href: "/my/company", label: "自社会社情報" },
  { href: "/my/tech-seeds", label: "自社技術シーズ" },
  { href: "/change-password", label: "パスワード変更" }
];

const adminNav = [
  { href: "/admin", label: "管理トップ" },
  { href: "/admin/news", label: "お知らせ管理" },
  { href: "/admin/centers", label: "センター管理" },
  { href: "/admin/activity-reports", label: "活動報告管理" },
  { href: "/admin/support-projects", label: "支援プロジェクト管理" },
  { href: "/admin/companies", label: "会員企業管理" },
  { href: "/admin/tech-seeds", label: "技術シーズ管理" },
  { href: "/admin/users", label: "ユーザー管理" },
  { href: "/admin/about", label: "サイト情報管理" }
];

type AppShellProps = {
  user: User;
  children: React.ReactNode;
};

export const AppShell = ({ user, children }: AppShellProps) => (
  <div className="app-shell">
    <aside className="app-sidebar">
      <div className="brand-block">
        <p className="eyebrow">技術協力会</p>
        <h2>会員向けポータル</h2>
        <p className="muted-text">会員企業と管理者のためのクローズドサイト</p>
      </div>

      <nav className="nav-group">
        <p className="nav-group__title">閲覧メニュー</p>
        {primaryNav.map((item) => (
          <Link key={item.href} href={item.href as Route} className="nav-link">
            {item.label}
          </Link>
        ))}
      </nav>

      <nav className="nav-group">
        <p className="nav-group__title">自分の管理</p>
        {memberNav.map((item) => (
          <Link key={item.href} href={item.href as Route} className="nav-link">
            {item.label}
          </Link>
        ))}
      </nav>

      {user.role === "admin" ? (
        <nav className="nav-group">
          <p className="nav-group__title">管理メニュー</p>
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href as Route} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </aside>

    <div className="app-main">
      <header className="app-topbar">
        <div>
          <p className="topbar-name">{user.userName}</p>
          <p className="muted-text">
            {user.role === "admin" ? "管理者" : user.companyName ?? "会員企業"} / {user.email}
          </p>
        </div>
        <div className="topbar-actions">
          {user.mustChangePassword ? (
            <span className="must-change-pill">初回ログインのためパスワード変更が必要です</span>
          ) : null}
          <LogoutButton />
        </div>
      </header>
      <main className="page-content">{children}</main>
    </div>
  </div>
);
