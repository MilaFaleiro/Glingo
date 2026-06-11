import { useState } from "react";
import RegisterForm from "../components/RegisterForm";
import LoginForm from "../components/LoginForm";

export default function RegisterLogin() {
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");

  return (
    <div className="max-w-2xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("register")}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "register"
              ? "bg-[#2563eb] text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Criar conta
        </button>
        <button
          onClick={() => setActiveTab("login")}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "login"
              ? "bg-[#2563eb] text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Entrar
        </button>
      </div>

      {/* Forms */}
      {activeTab === "register" ? <RegisterForm /> : <LoginForm />}
    </div>
  );
}
