import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

const HeaderContainer = styled.header`
  height: 6vh;
  background-color: ${({ theme }) => theme.colors.background2};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: fixed;
  top: 2vh;
  right: 2vw;
  left: 2vw;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const PageTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  .menu-icon {
    width: 20px;
    height: 20px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }

  .page-icon {
    width: 24px;
    height: 24px;
    opacity: 0.9;
  }

  span {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  span {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }

  div {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => `${theme.colors.primary}15`};
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 500;
  }

  img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid ${({ theme }) => theme.colors.border};
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const Header = () => {
  const location = useLocation();
  const { toggleSidebar, isOpen } = useSidebar();

  const getPageInfo = () => {
    switch (location.pathname) {
      case "/notifications":
        return { icon: "/images/icons/bell.png", text: "알림" };
      case "/calendar":
        return { icon: "/images/icons/calendar.png", text: "캘린더" };
      case "/chat":
        return { icon: "/images/icons/chat.png", text: "채팅방" };
      case "/organization":
        return { icon: "/images/icons/organization.png", text: "조직도" };
      case "/emergency":
        return { icon: "/images/icons/emergency.png", text: "비상연락망" };
      case "/profile":
        return { icon: "/images/icons/profile.png", text: "프로필" };
      case "/area":
        return { icon: "/images/icons/vacation.png", text: "연차관리" };
      case "/admin/dashboard":
        return { icon: "/images/icons/admin.png", text: "관리자 대시보드" };
      case "/admin/users":
        return { icon: "/images/icons/users.png", text: "사용자 관리" };
      case "/admin/organization":
        return { icon: "/images/icons/org-manage.png", text: "조직 관리" };
      default:
        return { icon: "/images/icons/home.png", text: "홈" };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <HeaderContainer $isOpen={isOpen}>
      <PageTitle>
        <img
          src="/images/icons/menu.png"
          alt="메뉴"
          onClick={toggleSidebar}
          className="menu-icon"
        />
        <img src={pageInfo.icon} alt={pageInfo.text} className="page-icon" />
        <span>{pageInfo.text}</span>
      </PageTitle>
      <UserProfile>
        <span>오승준</span>
        <div>팀장</div>
        <img src="/images/profile/user-avatar.png" alt="User Avatar" />
      </UserProfile>
    </HeaderContainer>
  );
};

export default Header;