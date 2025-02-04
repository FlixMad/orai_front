import { useState, useEffect } from "react";
import styled from "styled-components";
import axiosInstance from "../../configs/axios-config";
import { API_BASE_URL, USER } from "../../configs/host-config";

const LeaveApprovalPage = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState(null);

  const API_USER_ME = `${API_BASE_URL}${USER}/api/users/me`;
  const API_APPROVALS_BY_USER = `${API_BASE_URL}${USER}/api/approvals/user`;
  const API_VACATIONS_APPROVE = `${API_BASE_URL}${USER}/api/approvals`;

  // 내 프로필에서 userId 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get(API_USER_ME);
        setUserId(response.data.userId);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // 승인 목록 조회
  useEffect(() => {
    if (!userId) return;

    const fetchApprovals = async () => {
      try {
        const token = localStorage.getItem("ACCESS_TOKEN");
        if (!token) {
          console.error("토큰이 없습니다. 로그인 필요");
          return;
        }

        const response = await axiosInstance.get(
          `${API_APPROVALS_BY_USER}/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setApprovals(response.data);
      } catch (error) {
        console.error("Error fetching approval data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, [userId]);

  // 승인 처리
  const handleApprove = async (approval) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    try {
      await axiosInstance.post(
        `${API_VACATIONS_APPROVE}/approve/${approval.vacationId}`,
        { approvalId: approval.approvalId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus("APPROVED");
      setApprovals((prev) =>
        prev.filter((request) => request.vacationId !== approval.vacationId)
      );
    } catch (error) {
      setStatus("ERROR_APPROVING");
      console.error("Error approving vacation:", error);
    }
  };

  // 거절 처리
  const handleReject = async (approval) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    try {
      await axiosInstance.post(
        `${API_VACATIONS_APPROVE}/reject/${approval.vacationId}`,
        { approvalId: approval.approvalId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus("REJECTED");
      setApprovals((prev) =>
        prev.filter((request) => request.vacationId !== approval.vacationId)
      );
    } catch (error) {
      setStatus("ERROR_REJECTING");
      console.error("Error rejecting vacation:", error);
    }
  };

  return (
    <Container>
      <h2>휴가 승인</h2>
      {status && (
        <StatusMessage status={status}>
          {status === "APPROVED" ? "승인 완료!" : "거절 완료!"}
        </StatusMessage>
      )}
      <ApprovalList>
        {loading ? (
          <p>로딩 중...</p>
        ) : approvals.length > 0 ? (
          approvals.map((approval) => (
            <ApprovalItem key={approval.approvalId}>
              <p>제목: {approval.title}</p>
              <p>신청자: {approval.requestUserName} </p> {/* ✅ UUID 대신 이름 표시 */}
              <p>상태: {approval.vacationState}</p>
              <p>
                휴가 기간: {approval.startDate} ~ {approval.endDate}
              </p>{" "}
              {/* ✅ 시작일 ~ 종료일 추가 */}
          
              <ButtonContainer>
                <ApproveButton onClick={() => handleApprove(approval)}>
                  승인
                </ApproveButton>
                <RejectButton onClick={() => handleReject(approval)}>
                  거절
                </RejectButton>
              </ButtonContainer>
            </ApprovalItem>
          ))
        ) : (
          <p>승인할 휴가 신청이 없습니다.</p>
        )}
      </ApprovalList>
    </Container>
  );
};

const Container = styled.div`
  padding: 24px;
`;

const StatusMessage = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background-color: ${({ status }) =>
    status === "APPROVED" ? "#d4edda" : "#f8d7da"};
  color: ${({ status }) => (status === "APPROVED" ? "#155724" : "#721c24")};
  border-radius: 4px;
  text-align: center;
`;

const ApprovalList = styled.div`
  margin-top: 16px;
`;

const ApprovalItem = styled.div`
  margin-bottom: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ButtonContainer = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;
`;

const ApproveButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  &:hover {
    background: #218838;
  }
`;

const RejectButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  &:hover {
    background: #c82333;
  }
`;

export default LeaveApprovalPage;
