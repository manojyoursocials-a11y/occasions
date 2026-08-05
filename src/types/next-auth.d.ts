import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "client";
      isOwner: boolean;
      canDelete: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin" | "client";
    isOwner: boolean;
    canDelete: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "client";
    isOwner: boolean;
    canDelete: boolean;
  }
}
