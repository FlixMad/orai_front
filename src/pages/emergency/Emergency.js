import { useState } from "react";
import styled from "styled-components";

const Emergency = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  return (
    <EmergencyContainer>
      <EmergencyHeader>
        <SearchSection>
          <DepartmentSelect
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="all">전체 부서</option>
            <option value="dev">개발팀</option>
            <option value="design">디자인팀</option>
            <option value="marketing">마케팅팀</option>
          </DepartmentSelect>
          <SearchBar>
            <img src="/images/icons/search.png" alt="검색" />
            <input
              type="text"
              placeholder="이름, 부서, 직책으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
        </SearchSection>
      </EmergencyHeader>

      <ContactList>
        {/* 연락처 목록이 여기에 매핑됩니다 */}
        <ContactCard>
          <ProfileImage src="/images/profile/user-avatar.png" alt="프로필" />
          <ContactInfo>
            <Name>오승준</Name>
            <Position>팀장 | 개발팀</Position>
            <ContactDetails>
              <Detail>
                <img src="/images/icons/phone.png" alt="전화" />
                010-1234-5678
              </Detail>
              <Detail>
                <img src="/images/icons/email.png" alt="이메일" />
                example@email.com
              </Detail>
            </ContactDetails>
          </ContactInfo>
        </ContactCard>
      </ContactList>
    </EmergencyContainer>
  );
};

const EmergencyContainer = styled.div`
  padding: 24px;
  height: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const EmergencyHeader = styled.div`
  margin-bottom: 24px;
`;

const SearchSection = styled.div`
  display: flex;
  gap: 16px;
`;

const DepartmentSelect = styled.select`
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: white;
  color: ${({ theme }) => theme.colors.text1};
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.background2};
  border-radius: 8px;
  flex: 1;

  img {
    width: 16px;
    height: 16px;
    opacity: 0.5;
  }

  input {
    border: none;
    background: none;
    outline: none;
    width: 100%;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text1};

    &::placeholder {
      color: ${({ theme }) => theme.colors.text2};
    }
  }
`;

const ContactList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const ContactCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background2};
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProfileImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text1};
`;

const Position = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text2};
  margin-bottom: 8px;
`;

const ContactDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Detail = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text1};

  img {
    width: 14px;
    height: 14px;
    opacity: 0.7;
  }
`;

export default Emergency;
