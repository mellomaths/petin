import { NextApiRequest } from "next";
import cookie from "cookie";
import { LoginRequest, LoginResponse } from "../_core/types/petin-api";

export type LoginSucceeded = {
  success: boolean;
  login?: LoginResponse;
};

export async function POST(request: NextApiRequest & Request) {
  const login = (await request.json()) as LoginRequest;
  console.log(login);
  const url = `${process.env.PETIN_API_BASE_URL}/api/auth/login`;
  const response = await fetch("http://localhost:4000/api/auth/login", {
    method: "POST",
    body: JSON.stringify(login),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.status !== 201) {
    console.log("Login failed");
    console.log(await response.json());
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }

  const data = (await response.json()) as LoginResponse;
  data.creationDate = new Date().toISOString();

  console.log("Login succeeded");
  return new Response(JSON.stringify({ success: true, login: data }), {
    status: 200,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Set-Cookie": cookie.serialize("Petin-Login", JSON.stringify(data), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: data.expirationTime,
        sameSite: "strict",
        path: "/",
      }),
    },
  });
}
