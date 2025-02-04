import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom"; // useNavigate 추가
import { useSidebar } from "../../context/SidebarContext";
import { useEffect, useState } from "react";
import { FiDatabase } from "react-icons/fi"; // FiGrid 제거
import { API_BASE_URL, ETC, USER } from "../../configs/host-config";
import axiosInstance from "../../configs/axios-config";
import { NativeEventSource, EventSourcePolyfill } from "event-source-polyfill";

const EventSourceImpl = NativeEventSource || EventSourcePolyfill;

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
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text1};
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

const NotificationCount = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  position: absolute;
  top: -5px;
  right: -10px;
`;

const PageIcon = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text1};
`;

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate(); // useNavigate 훅 사용
  const { toggleSidebar, isOpen } = useSidebar();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      if (!token) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${USER}/api/users/me`
        );
        console.log(response);

        if (response.status !== 200) {
          throw new Error("데이터 로드 실패");
        }

        const data = response.data;
        setUser(data);
      } catch (error) {
        setError("회원 정보 조회 중 오류가 발생했습니다.");
        console.error("User data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNotificationCount = async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      if (!token) return;

      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${ETC}/api/notifications/count`
        );

        if (response.status === 200) {
          const count = response.data.count;
          setNotificationCount(count);
        } else {
          throw new Error("알림 개수 조회 실패");
        }
      } catch (error) {
        console.error("알림 개수 조회 중 오류:", error);
      }
    };

    fetchUserData();
    fetchNotificationCount();
  }, []);

  const getPageInfo = () => {
    if (location.pathname.startsWith("/chat")) {
      return {
        icon: "/images/icons/chat.png",
        text: "채팅방",
        isReactIcon: false,
      };
    }

    switch (location.pathname) {
      case "/notifications":
        return {
          icon: "/images/icons/bell.png",
          text: "알림",
          isReactIcon: false,
        };
      case "/calendar":
        return {
          icon: "/images/icons/calendar.png",
          text: "캘린더",
          isReactIcon: false,
        };
      case "/organization":
        return {
          icon: "/images/icons/organization.png",
          text: "조직도",
          isReactIcon: false,
        };
      case "/emergency":
        return {
          icon: "/images/icons/emergency.png",
          text: "비상연락망",
          isReactIcon: false,
        };
      case "/profile":
        return {
          icon: "/images/icons/profile.png",
          text: "프로필",
          isReactIcon: false,
        };
      case "/area":
        return {
          icon: "/images/icons/vacation.png",
          text: "연차관리",
          isReactIcon: false,
        };
      case "/admin/dashboard":
        return {
          icon: <FiDatabase size={24} />,
          text: "관리자 대시보드",
          isReactIcon: true,
        };
      case "/admin/users":
        return {
          icon: "/images/icons/users.png",
          text: "사용자 관리",
          isReactIcon: false,
        };
      case "/admin/organization":
        return {
          icon: "/images/icons/org-manage.png",
          text: "조직 관리",
          isReactIcon: false,
        };
      default:
        return {
          icon: "/images/icons/home.png",
          text: "홈",
          isReactIcon: false,
        };
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
        <PageIcon>
          {pageInfo.isReactIcon ? (
            pageInfo.icon
          ) : (
            <>
              <img src={pageInfo.icon} alt={pageInfo.text} />
              {location.pathname === "/notifications" &&
                notificationCount > 0 && (
                  <NotificationCount>{notificationCount}</NotificationCount>
                )}
            </>
          )}
        </PageIcon>
        <span>{pageInfo.text}</span>
      </PageTitle>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : user ? (
        <UserProfile onClick={() => navigate("/profile")}>
          {" "}
          {/* 클릭 시 navigate */}
          <span>{user.name}</span>
          <div>{user.position}</div>
          <img
            src={`http://localhost:8181/user-service/api/users/profileImage/${user.profileImage}`}
            alt="User Avatar"
          />
        </UserProfile>
      ) : (
        <div>회원 정보 로드 실패</div>
      )}
    </HeaderContainer>
  );
};

export default Header;
