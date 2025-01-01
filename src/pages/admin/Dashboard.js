import styled from "styled-components";
import { useState } from "react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <DashboardContainer>
      <DashboardHeader>
        <TabMenu>
          <TabButton
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          >
            사용자 관리
          </TabButton>
          <TabButton
            active={activeTab === "organization"}
            onClick={() => setActiveTab("organization")}
          >
            조직 관리
          </TabButton>
          <TabButton
            active={activeTab === "attendance"}
            onClick={() => setActiveTab("attendance")}
          >
            근태 관리
          </TabButton>
        </TabMenu>
      </DashboardHeader>

      <ContentArea>
        {activeTab === "users" && (
          <UserManagement>
            <SearchSection>
              <SearchInput
                type="text"
                placeholder="사용자 검색 (이름, 부서, 직책)"
              />
              <Button>
                <img src="/images/icons/add-user.png" alt="사용자 추가" />
                사용자 추가
              </Button>
              <Button>
                <img src="/images/icons/invite.png" alt="초대" />
                초대하기
              </Button>
            </SearchSection>

            <UsersTable>
              <thead>
                <tr>
                  <th>프로필</th>
                  <th>이름</th>
                  <th>부서</th>
                  <th>직책</th>
                  <th>이메일</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>{/* 사용자 목록이 여기에 매핑됩니다 */}</tbody>
            </UsersTable>
          </UserManagement>
        )}
      </ContentArea>
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  padding: 24px;
  height: 100%;
  overflow-y: auto;
`;

const DashboardHeader = styled.div`
  margin-bottom: 24px;
`;

const TabMenu = styled.div`
  display: flex;
  gap: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TabButton = styled.button`
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.text2};
  border-bottom: 2px solid
    ${({ active, theme }) => (active ? theme.colors.primary : "transparent")};
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ContentArea = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const UserManagement = styled.div``;

const SearchSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;

  img {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary1};
  }
`;

const UsersTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text2};
    font-size: 14px;
  }

  td {
    font-size: 14px;
  }
`;

export default Dashboard;
