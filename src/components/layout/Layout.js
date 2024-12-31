import styled from "styled-components";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";

const LayoutContent = ({ children }) => {
  const { isOpen } = useSidebar();

  return (
    <LayoutWrapper>
      <Sidebar />
      <MainContent>
        <Header />
        <PageContent $isOpen={isOpen}>{children}</PageContent>
      </MainContent>
    </LayoutWrapper>
  );
};

const Layout = ({ children }) => {
  return (
    <SidebarProvider>
      <LayoutContent children={children} />
    </SidebarProvider>
  );
};

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background1};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PageContent = styled.main`
  background-color: ${({ theme }) => theme.colors.background2};
  position: fixed;
  top: 10vh;
  right: 2vh;
  left: ${(props) => (props.$isOpen ? "17vw" : "2vh")};
  bottom: 2vh;
  border-radius: 12px;
  transition: all 0.3s ease;
`;

export default Layout;
