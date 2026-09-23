import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import UserLogin from "./UserLogin";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/employee-login" element={<UserLogin />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);