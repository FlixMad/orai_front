import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { login } from "../../context/UserContext"; // UserContext import

// styled-components 임포트
import { HeaderContainer, PageTitle, UserProfile } from "./styled"; // styled.js에 정의된 컴포넌트들

const Header = () => {
  const location = useLocation();
  const { toggleSidebar, isOpen } = useSidebar();
  const { name, profile } = useContext(login); // UserContext에서 name과 profile을 가져옵니다.

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
        <span>{name || "사용자"}</span> {/* name을 표시, 없으면 기본값 "사용자" */}
        <div>팀장</div> {/* 여기서 팀장 정보도 필요하면 추가 가능 */}
        <img src={profile || "/images/profile/user-avatar.png"} alt="User Avatar" />
      </UserProfile>
    </HeaderContainer>
  );
};

export default Header;
