import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

const SidebarContainer = styled.div`
  width: ${(props) => props.theme.sidebar.width};
  padding-right: 1vw;
  background-color: ${({ theme }) => theme.colors.background2};
  position: fixed;
  left: ${(props) => (props.$isOpen ? "2%" : "-20%")};
  top: 2%;
  bottom: 2%;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
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

const StyledLink = styled(Link)`
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
  transition: all 0.1s ease-in-out;
  justify-content: flex-start;
  position: relative;

  &:hover {
    background-color: #dbe0de;
    color: ${({ theme }) => theme.colors.text1};

    img {
      opacity: 1;
    }
  }

  ${(props) =>
    props.active &&
    `
    background-color: #DBE0DE;
    color: ${props.theme.colors.text1};
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

const Sidebar = () => {
  const { isOpen } = useSidebar();
  const location = useLocation();

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
          to="/notifications"
          active={location.pathname === "/notifications"}
        >
          <img src="/images/icons/bell.png" alt="알림" />
          알림
          <img src="/images/icons/arrow-right.png" alt="화살표" />
        </StyledLink>
        <StyledLink to="/calendar" active={location.pathname === "/calendar"}>
          <img src="/images/icons/calendar.png" alt="캘린더" />
          캘린더
          <img src="/images/icons/arrow-right.png" alt="캘린더" />
        </StyledLink>
        <StyledLink to="/chat" active={location.pathname === "/chat"}>
          <img src="/images/icons/chat.png" alt="채팅방" />
          채팅방
          <img src="/images/icons/arrow-right.png" alt="화살표" />
        </StyledLink>
        <StyledLink
          to="/organization"
          active={location.pathname === "/organization"}
        >
          <img src="/images/icons/organization.png" alt="조직도" />
          조직도
          <img src="/images/icons/arrow-right.png" alt="화살표" />
        </StyledLink>
        <StyledLink to="/emergency" active={location.pathname === "/emergency"}>
          <img src="/images/icons/emergency.png" alt="비상연락망" />
          비상연락망
          <img src="/images/icons/arrow-right.png" alt="화살표" />
        </StyledLink>
        <StyledLink to="/profile" active={location.pathname === "/profile"}>
          <img src="/images/icons/profile.png" alt="프로필" />
          프로필
          <img src="/images/icons/arrow-right.png" alt="화살표" />
        </StyledLink>
        <StyledLink to="/area" active={location.pathname === "/area"}>
          <img src="/images/icons/vacation.png" alt="연차관리" />
          연차관리
          <img src="/images/icons/arrow-right.png" alt="화살표" />
        </StyledLink>
      </NavLinks>

      <FooterLogo>
        <img src="/images/orai-logo.png" alt="ORAI" />
      </FooterLogo>
    </SidebarContainer>
  );
};

export default Sidebar;