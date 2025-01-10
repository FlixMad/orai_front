import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { SidebarProvider } from "./context/SidebarContext";
import Login from "./pages/auth/Login";
import Layout from "./components/layout/Layout";
import AppRoutes from "./routes";
import theme from "./styles/theme";
import GlobalStyle from "./styles/GlobalStyle";

const PrivateRoute = ({ children }) => {
    const location = useLocation();
    const token = localStorage.getItem("ACCESS_TOKEN");

    if (!token && location.pathname !== "/login") {
        return <Navigate to="/login" replace />;
    }

    return children;
};

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
                            <PrivateRoute>
                                <Layout>
                                    <AppRoutes />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </SidebarProvider>
        </ThemeProvider>
    );
}

export default App;
