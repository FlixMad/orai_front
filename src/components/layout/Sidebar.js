import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { useState, useEffect, useContext } from "react";
import { FiDatabase, FiBell } from "react-icons/fi";
import { UserContext } from "../../context/UserContext";
import axiosInstance from "../../configs/axios-config";
import { API_BASE_URL, ETC } from "../../configs/host-config";
import { NativeEventSource, EventSourcePolyfill } from "event-source-polyfill";

const EventSourceImpl = NativeEventSource || EventSourcePolyfill;

const SidebarContainer = styled.div`
  width: ${(props) => props.theme.sidebar.width};
  padding-right: 1vw;
  background-color: ${({ theme }) => theme.colors.background2};
  position: fixed;
  left: ${(props) => (props.$isOpen ? "2vw" : "-20vw")};
  top: 2vh;
  bottom: 2vh;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  z-index: 100;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin-top: 2vh;

  img {
    width: 60px;
    height: 60px;
  }
`;

const BrandName = styled.div`
  text-align: center;
  font-weight: 600;
  font-size: 16px;
  color: #333;
`;

const NavLinks = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: 2vh;
`;

const StyledLink = styled.div`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text2};
  padding: 12px 16px;
  border-radius: 0 16px 16px 0;
  border-color: ${({ theme }) => theme.colors.background1};
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0;
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  justify-content: flex-start;
  position: relative;
  cursor: pointer;

  &:hover {
    background-color: #dbe0de;
    color: ${({ theme }) => theme.colors.text1};

    img {
      opacity: 1;
    }
  }

  ${({ $active, theme }) =>
    $active &&
    `
    background-color: #DBE0DE;
    color: ${theme.colors.text1};
    font-weight: 600;

    img {
      opacity: 1;
    }
  `}

  img {
    width: 20px;
    height: 20px;
    opacity: 0.7;
    transition: opacity 0.2s ease-in-out;
  }

  img:last-child {
    position: absolute;
    right: 16px;
  }
`;

const FooterLogo = styled.div`
  padding: 24px 0 0 0;
  display: flex;
  justify-content: center;
  img {
    height: 109px;
  }
`;

const fetchNotificationCount = async () => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (!token) return;

  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}${ETC}/api/notifications/count`
    );

    if (response.status === 200) {
      return response.data.result;
    }
  } catch (error) {
    console.error("알림 개수 조회 중 오류:", error);
    return 0;
  }
};

const Sidebar = () => {
  const { isOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const { notificationCount, setNotificationCount } = useContext(UserContext);
  const [fetchedNotificationCount, setFetchedNotificationCount] = useState(0);

  useEffect(() => {
    const departmentId = localStorage.getItem("departmentId");
    if (departmentId) {
      setShowAdminDashboard(departmentId === "team9");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (!token) return;

    const setupEventSource = () => {
      try {
        if (window.sidebarEventSource) {
          window.sidebarEventSource.close();
        }

        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found");
          return;
        }

        const eventSourceInitDict = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          heartbeatTimeout: 60 * 60 * 1000, // 1시간 (백엔드 설정과 동일)
          withCredentials: true,
        };

        window.sidebarEventSource = new EventSourceImpl(
          `${API_BASE_URL}${ETC}/api/notifications/subscribe`,
          eventSourceInitDict
        );

        // 연결 성공 이벤트
        window.sidebarEventSource.addEventListener("connect", (event) => {
          console.log("SSE Connection established:", event.data);
          fetchNotificationCount().then((count) => {
            if (count !== undefined) {
              setFetchedNotificationCount(count);
              if (setNotificationCount) {
                setNotificationCount(count);
              }
            }
          });
        });

        // heartbeat 이벤트 처리
        window.sidebarEventSource.addEventListener("heartbeat", (event) => {
          console.log("Heartbeat received:", event.data);
        });

        // 알림 이벤트 처리
        window.sidebarEventSource.addEventListener(
          "notification",
          async (event) => {
            try {
              console.log("Notification received:", event.data);
              const count = await fetchNotificationCount();
              if (count !== undefined) {
                setFetchedNotificationCount(count);
                if (setNotificationCount) {
                  setNotificationCount(count);
                }
              }
            } catch (error) {
              console.error("Error handling notification:", error);
            }
          }
        );

        // 에러 처리
        window.sidebarEventSource.onerror = (error) => {
          console.error("SSE connection error:", error);
          if (window.sidebarEventSource) {
            window.sidebarEventSource.close();
            window.sidebarEventSource = null;
          }
        };
      } catch (error) {
        console.error("EventSource setup error:", error);
      }
    };
    setupEventSource();

    return () => {
      if (window.sidebarEventSource) {
        window.sidebarEventSource.close();
        window.sidebarEventSource = null;
      }
    };
  }, [setNotificationCount]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <SidebarContainer $isOpen={isOpen}>
      <LogoSection>
        <img src="/images/factory-logo.png" alt="Charlie's Factory" />
        <BrandName>
          CHARLIE's <br /> FACTORY
        </BrandName>
      </LogoSection>

      <NavLinks>
        <StyledLink
          onClick={() => handleNavigation("/notifications")}
          $active={location.pathname === "/notifications"}
        >
          <img src="/images/icons/bell.png" alt="알림" />
          알림 {fetchedNotificationCount > 0 && `(${fetchedNotificationCount})`}
          <img src="/images/icons/arrow-right.png" alt="화살표" />
        </StyledLink>
        <StyledLink
          onClick={() => handleNavigation("/calendar")}
          $active={location.pathname === "/calendar"}
        >
          <img src="/images/icons/calendar.png" alt="캘린더" />
          캘린더
          <img src="/images/icons/arrow-right.png" alt="화살표" />
        </StyledLink>
        <StyledLink
          onClick={() => handleNavigation("/chat")}
          $active={location.pathname.startsWith("/chat")}
        >
          <img src="/images/icons/chat.png" alt="채팅방" />
          채팅방
          <img src="/images/icons/arrow-right.png" alt="화살표" />
        </StyledLink>
        <StyledLink
          onClick={() => handleNavigation("/organization")}
          $active={location.pathname === "/organization"}
        >
          <img src="/images/icons/organization.png" alt="조직도" />
          조직도
          <img src="/images/icons/arrow-right.png" alt="화살표" />
        </StyledLink>
        <StyledLink
          onClick={() => handleNavigation("/emergency")}
          $active={location.pathname === "/emergency"}
        >
          <img src="/images/icons/emergency.png" alt="비상연락망" />
          비상연락망
          <img src="/images/icons/arrow-right.png" alt="화살표" />
        </StyledLink>
        <StyledLink
          onClick={() => handleNavigation("/profile")}
          $active={location.pathname === "/profile"}
        >
          <img src="/images/icons/profile.png" alt="프로필" />
          프로필
          <img src="/images/icons/arrow-right.png" alt="화살표" />
        </StyledLink>
        <StyledLink
          onClick={() => handleNavigation("/leave")}
          $active={location.pathname === "/leave"}
        >
          <img src="/images/icons/vacation.png" alt="연차관리" />
          연차관리
          <img src="/images/icons/arrow-right.png" alt="화살표" />
        </StyledLink>
        {showAdminDashboard && (
          <StyledLink
            onClick={() => handleNavigation("/admin/dashboard")}
            $active={location.pathname.startsWith("/admin")}
          >
            <FiDatabase size={20} />
            관리자 대시보드
            <img src="/images/icons/arrow-right.png" alt="화살표" />
          </StyledLink>
        )}
      </NavLinks>

      <FooterLogo>
        <img src="/images/orai-logo.png" alt="ORAI" />
      </FooterLogo>
    </SidebarContainer>
  );
};

export const initializeEventSource = () => {
  try {
    if (window.sidebarEventSource) {
      window.sidebarEventSource.close();
    }

    const token = localStorage.getItem("ACCESS_TOKEN");
    const userId = localStorage.getItem("userId");
    if (!userId || !token) {
      console.error("User ID or token not found");
      return;
    }

    const eventSourceInitDict = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      heartbeatTimeout: 60 * 60 * 1000,
      withCredentials: true,
    };

    window.sidebarEventSource = new EventSourceImpl(
      `${API_BASE_URL}${ETC}/api/notifications/subscribe`,
      eventSourceInitDict
    );

    // ... rest of event source setup ...
  } catch (error) {
    console.error("EventSource setup error:", error);
  }
};

export default Sidebar;
