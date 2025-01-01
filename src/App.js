import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { SidebarProvider } from "./context/SidebarContext";
import Login from "./pages/auth/Login";
import Layout from "./components/layout/Layout";
import AppRoutes from "./routes";
import theme from "./styles/theme";
import GlobalStyle from "./styles/GlobalStyle";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SidebarProvider>
        <GlobalStyle />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <Layout>
                <AppRoutes />
              </Layout>
            }
          />
        </Routes>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
