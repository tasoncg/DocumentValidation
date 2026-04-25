export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/templates/:path*", "/cases/:path*"]
};
