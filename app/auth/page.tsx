"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "login";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        alert("로그인 성공");
        // Redirect or handle login success
      }
    } catch (error) {
      console.error(error);
      setMessage("에러가 발생했습니다.");
    }
  };

  const handleSignup = async () => {
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, name }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        alert("회원가입 성공");
        // Redirect to login or handle success
      }
    } catch (error) {
      console.error(error);
      setMessage("에러가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {type === "login" ? "로그인" : "회원가입"}
          </h2>
        </div>

        <div className="space-y-6">
          {type === "signup" && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="이름을 입력하세요"
              />
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {message && (
            <div className={`text-sm ${message.includes("성공") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </div>
          )}

          <button
            onClick={type === "login" ? handleLogin : handleSignup}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {type === "login" ? "로그인" : "회원가입"}
          </button>

          <div className="text-center">
            <button
              onClick={() => window.location.href = type === "login" ? "/auth?type=signup" : "/auth?type=login"}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              {type === "login" ? "회원가입으로 전환" : "로그인으로 전환"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}