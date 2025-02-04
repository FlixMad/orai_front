import { useState } from "react";
import styled from "styled-components";
import LeaveRequestPage from "./LeaveRequestPage";  // 휴가 신청 페이지
import LeaveHistoryPage from "./LeaveHistoryPage";  // 휴가 내역 페이지
import LeaveApprovalPage from "./LeaveApprovalPage";  // 휴가 승인 페이지

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState("request");

  return (
    <Container>
      <Header>
        <TabMenu>
          <TabButton
            active={activeTab === "request"}
            onClick={() => setActiveTab("request")}
          >
            휴가 신청
          </TabButton>
          <TabButton
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          >
            휴가 내역
          </TabButton>
          <TabButton
            active={activeTab === "approval"}
            onClick={() => setActiveTab("approval")}
          >
            휴가 승인
          </TabButton>
        </TabMenu>
      </Header>

      <Content>
        {activeTab === "request" && <LeaveRequestPage />} {/* 휴가 신청 페이지 */}
        {activeTab === "history" && <LeaveHistoryPage />} {/* 휴가 내역 페이지 */}
        {activeTab === "approval" && <LeaveApprovalPage />} {/* 휴가 승인 페이지 */}
      </Content>
    </Container>
  );
};

const Container = styled.div`
  padding: 24px;
  height: 100%;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const TabMenu = styled.div`
  display: flex;
  gap: 12px;
`;

const TabButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  background: ${({ active, theme }) =>
    active ? theme.colors.primary : "transparent"};
  color: ${({ active, theme }) => (active ? "white" : theme.colors.text2)};
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active, theme }) =>
      active ? theme.colors.primary : theme.colors.background1};
  }
`;

const Content = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export default LeaveManagement;
