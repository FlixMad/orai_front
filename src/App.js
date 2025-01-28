import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { SidebarProvider } from "./context/SidebarContext";
import Login from "./pages/auth/Login";
import Layout from "./components/layout/Layout";
import AppRoutes from "./routes";
import theme from "./styles/theme";
import GlobalStyle from "./styles/GlobalStyle";
import DevLogin from "./pages/auth/DevLogin";
import { AuthContextProvider } from "./context/UserContext";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("ACCESS_TOKEN");

  if (
    !token &&
    location.pathname !== "/login" &&
    location.pathname !== "/devLogin"
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SidebarProvider>
        <AuthContextProvider>
          <GlobalStyle />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/devLogin" element={<DevLogin />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Layout>
                    <AppRoutes />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthContextProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
