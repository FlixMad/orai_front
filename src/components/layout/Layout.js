import styled from "styled-components";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useSidebar } from "../../context/SidebarContext";
import ChatList from "../../pages/chat/ChatList";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const { isOpen } = useSidebar();
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith("/chat");

  return (
    <LayoutContainer>
      <Sidebar $isOpen={isOpen} />
      <MainSection>
        <MainContent $isOpen={isOpen}>
          <Header />
          <MainContainer>
            {isChatRoute && <ChatListPanel />}
            <Content isChatRoute={isChatRoute}>{children}</Content>
          </MainContainer>
        </MainContent>
      </MainSection>
    </LayoutContainer>
  );
};

const LayoutContainer = styled.div`
  height: 100vh;
  display: flex;
  background: ${({ theme }) => theme.colors.background1};
`;

const MainSection = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const MainContent = styled.div`
  position: fixed;
  left: ${({ $isOpen }) => ($isOpen ? "15vw" : "2vw")};
  top: 1vh;
  right: ${({ $isOpen }) => ($isOpen ? "0vw" : "2vw")};
  bottom: 1vh;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    right 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 2vh 2vw;
  display: flex;
  flex-direction: column;
  will-change: transform, opacity, left, right;
  transform-origin: center center;
  opacity: 1;
`;

const MainContainer = styled.div`
  flex: 1;
  display: flex;
  margin-top: 8vh;
  background: ${({ theme }) => theme.colors.background1};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, box-shadow;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ChatListPanel = styled(ChatList)`
  width: 320px;
  min-width: 320px;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: white;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
`;

const Content = styled.main`
  flex: 1;
  overflow-y: auto;
  background: white;
  padding: ${({ isChatRoute }) => (isChatRoute ? "0" : "24px")};
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: ${({ theme }) => theme.colors.text3};
    }
  }
`;

export default Layout;
