import { withAuth } from "next-auth/middleware";
import { canListPets, canReviewAdoptions, isAdmin, normalizeRole } from "@/lib/roles";

export default withAuth({
  callbacks: {
    authorized({ token, req }) {
      if (!token) return false;

      const role = normalizeRole(token.role);
      const pathname = req.nextUrl.pathname;

      if (pathname.startsWith("/pets/upload")) {
        return canListPets(role);
      }

      if (pathname.startsWith("/adoption-requests")) {
        return canReviewAdoptions(role);
      }

      if (pathname.startsWith("/admin")) {
        return isAdmin(role);
      }

      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
});

export const config = {
  matcher: [
    "/profile/:path*",
    "/settings/:path*",
    "/my-pets/:path*",
    "/pets/upload/:path*",
    "/adoption-requests/:path*",
    "/admin/:path*",
  ],
};
