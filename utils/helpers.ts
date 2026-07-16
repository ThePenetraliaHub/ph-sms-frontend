/* eslint-disable @typescript-eslint/no-explicit-any */

interface Payload {
  [key: string]: any;
}

const tokenSecret = process.env.NEXT_PUBLIC_JWT_SECRET as string;

let jwt: any = null;
if (typeof window === "undefined") {
  try {
    jwt = require("jsonwebtoken");
  } catch (e) {
    console.warn("jsonwebtoken not available - token operations will fail");
  }
}

export const generateToken = (data: Payload, time: string | number): string => {
  if (!tokenSecret) {
    throw new Error("JWT secret is not defined, GEN");
  }

  if (!jwt) {
    throw new Error("JWT library not available");
  }

  const options = {
    expiresIn: time,
  };

  const token = jwt.sign(data, tokenSecret, options);
  return token;
};

interface DecryptTokenResult {
  success: boolean;
  data: any | null;
}

// Client: decode only. Server: verify.
export const decryptToken = (token: string): DecryptTokenResult => {
  let tokenData: DecryptTokenResult = { success: false, data: null };

  if (!tokenSecret) {
    console.error("JWT secret is not defined");
    return tokenData;
  }

  if (typeof window !== "undefined") {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        tokenData = { success: true, data: payload };
      }
    } catch (error) {
      console.warn("Failed to decode token on client:", error);
    }
    return tokenData;
  }

  if (!jwt) {
    console.error("JWT library not available on server");
    return tokenData;
  }

  try {
    jwt.verify(token, tokenSecret, (error: any, decoded: any) => {
      if (!error) {
        tokenData = { success: true, data: decoded };
      }
    });
  } catch (error) {
    console.warn("Failed to verify token:", error);
  }

  return tokenData;
};

export const getStatusColor = (status: "approved" | "pending" | "draft" | "rejected") => {
  switch (status) {
    case "approved":
      return "text-green-600";
    case "pending":
      return "text-orange-600";
    case "draft":
      return "text-gray-600";
    case "rejected":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};