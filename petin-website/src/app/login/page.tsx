import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'
import { BrandColor, TextFont } from "../_config/branding";
import { LoginRequest } from "../api/_core/types/petin-api";
import { LoginSucceeded } from "../api/login/route";
import LoginForm from "./_components/login.form";

async function signIn({ email, password }: LoginRequest): Promise<void> {
  "use server";

  console.log("Sign in");
  const url = `${process.env.BASE_URL}/api/login`;
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json"
    },
  });
  const data = (await response.json()) as LoginSucceeded;
  console.log(data);
  if (data.success) {
    cookies().set({
      name: "Petin-Access-Token",
      value: JSON.stringify(data.login),
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      path: '/',
    })
    redirect("/");
  }
}

export default async function Login() {
  return (
    <body
      className={TextFont.className}
      style={{ backgroundColor: `${BrandColor} !important` }}
    >
      <LoginForm signIn={signIn} />
    </body>
  );
}
