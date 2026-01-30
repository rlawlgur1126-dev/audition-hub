import "./globals.css";

export const metadata = {
  title: "Audition Hub",
  description: "뮤지컬/연극 오디션 공고 통합 보드",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, background: "#fff" }}>{children}</body>
    </html>
  );
}
