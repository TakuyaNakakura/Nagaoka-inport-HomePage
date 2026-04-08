import "./globals.css";

export const metadata = {
  title: "技術協力会 会員向けポータル",
  description: "技術協力会 会員企業向けポータルサイト"
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

