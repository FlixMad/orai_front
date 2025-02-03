import { useState, useEffect } from "react";
import styled from "styled-components";
import axiosInstance from "../../configs/axios-config"; // axios 설정 가져오기
import { API_BASE_URL, USER } from "../../configs/host-config"; // API_BASE_URL과 USER 가져오기

const VacationPage = () => {
  const [vacationData, setVacationData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    type: "OTHER", // 기본값을 "OTHER"로 설정, 이후 선택 가능
  });
  const [vacationRequests, setVacationRequests] = useState([]);
  const [status, setStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부 확인

  // 로그인 상태 확인 및 휴가 신청 목록 가져오기
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      if (token) {
        try {
          // 사용자 정보 가져오기 (me API 호출)
          const response = await axiosInstance.get(
            "http://localhost:8181/user-service/api/users/me",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const userData = response.data;
          setIsAdmin(userData.position === "ADMIN"); // 관리자인지 확인
          fetchVacationRequests(); // 관리자의 경우 휴가 신청 목록도 가져오기
        } catch (error) {
          console.error("Error fetching user data:", error);
          setStatus("로그인 정보가 유효하지 않습니다.");
        }
      }
    };

    // 관리자의 경우 휴가 신청 목록 가져오기
    const fetchVacationRequests = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${USER}/api/vacations/requests`
        );
        setVacationRequests(response.data);
      } catch (error) {
        console.error("Error fetching vacation requests:", error);
        setStatus("휴가 신청 목록을 불러오는 데 실패했습니다.");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVacationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // JWT 토큰 가져오기
    const token = localStorage.getItem("ACCESS_TOKEN");

    // 로그인 상태 확인 후 userId 가져오기
    let userId = null;
    if (token) {
      try {
        // 사용자 정보 가져오기 (me API 호출)
        const response = await axiosInstance.get(
          "http://localhost:8181/user-service/api/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`, // 헤더에 JWT 토큰 추가
            },
          }
        );
        // userId 추출
        userId = response.data.userId;
      } catch (error) {
        console.error("Error fetching user data:", error);
        setStatus("로그인 정보가 유효하지 않습니다.");
        return;
      }
    }

    // userId가 없으면 에러 처리
    if (!userId) {
      setStatus("로그인 정보가 없습니다. 다시 로그인 해주세요.");
      return;
    }

    // 요청 바디 데이터
    const requestData = {
      type: vacationData.type, // 동적으로 선택된 휴가 유형
      startDate: vacationData.startDate, // 시작일
      endDate: vacationData.endDate, // 종료일
      title: vacationData.reason, // 제목 (사유를 제목으로 사용)
      userId: userId, // 가져온 userId 사용
    };

    // 휴가 신청 요청 보내기
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}${USER}/api/vacations/apply`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 헤더에 JWT 토큰 추가
          },
        }
      );
      console.log(response.data); // 응답 데이터 확인
      setStatus("휴가 신청이 완료되었습니다.");
    } catch (error) {
      setStatus("휴가 신청에 실패했습니다. 다시 시도해 주세요.");
      console.error("Error applying for vacation:", error);
    }
  };

  // 승인 처리
  const handleApproval = async (vacationId) => {
    try {
      await axiosInstance.post(
        `${API_BASE_URL}${USER}/api/vacations/${vacationId}/approve`
      );
      setStatus("휴가가 승인되었습니다.");
      // 승인된 휴가 목록에서 삭제
      const updatedRequests = vacationRequests.filter(
        (request) => request.id !== vacationId
      );
      setVacationRequests(updatedRequests);
    } catch (error) {
      setStatus("휴가 승인이 실패했습니다.");
      console.error("Error approving vacation:", error);
    }
  };

  // 거절 처리
  const handleRejection = async (vacationId) => {
    try {
      await axiosInstance.post(
        `${API_BASE_URL}${USER}/api/vacations/${vacationId}/reject`
      );
      setStatus("휴가가 거절되었습니다.");
      // 거절된 휴가 목록에서 삭제
      const updatedRequests = vacationRequests.filter(
        (request) => request.id !== vacationId
      );
      setVacationRequests(updatedRequests);
    } catch (error) {
      setStatus("휴가 거절에 실패했습니다.");
      console.error("Error rejecting vacation:", error);
    }
  };

  return (
    <Container>
      <h2>휴가 신청</h2>
      {/* 휴가 신청 양식 */}
      {!isAdmin && (
        <FormContainer>
          <h3>휴가 신청</h3>
          <form onSubmit={handleSubmit}>
            <Label>시작일:</Label>
            <Input
              type="date"
              name="startDate"
              value={vacationData.startDate}
              onChange={handleChange}
            />
            <Label>종료일:</Label>
            <Input
              type="date"
              name="endDate"
              value={vacationData.endDate}
              onChange={handleChange}
            />
            <Label>사유:</Label>
            <Input
              type="text"
              name="reason"
              value={vacationData.reason}
              onChange={handleChange}
            />
            <Label>휴가 유형:</Label>
            <Select name="type" value={vacationData.type} onChange={handleChange}>
              <option value="OTHER">기타</option>
              <option value="ANNUAL_LEAVE">연차</option>
              <option value="SICK_LEAVE">병가</option>
            </Select>
            <Button type="submit">신청</Button>
          </form>
        </FormContainer>
      )}

      {/* 휴가 승인 목록 */}
      {isAdmin && (
        <RequestList>
          <h3>승인 대기 중인 휴가 신청</h3>
          {vacationRequests.length === 0 ? (
            <p>승인 대기 중인 휴가 신청이 없습니다.</p>
          ) : (
            vacationRequests.map((request) => (
              <RequestItem key={request.id}>
                <RequestDetails>
                  <div><strong>신청자:</strong> {request.userName}</div>
                  <div><strong>휴가 유형:</strong> {request.type}</div>
                  <div><strong>시작일:</strong> {request.startDate}</div>
                  <div><strong>종료일:</strong> {request.endDate}</div>
                  <div><strong>사유:</strong> {request.reason}</div>
                </RequestDetails>
                <ButtonContainer>
                  <ApproveButton onClick={() => handleApproval(request.id)}>
                    승인
                  </ApproveButton>
                  <RejectButton onClick={() => handleRejection(request.id)}>
                    거절
                  </RejectButton>
                </ButtonContainer>
              </RequestItem>
            ))
          )}
        </RequestList>
      )}

      {/* 상태 메시지 */}
      {status && <StatusMessage>{status}</StatusMessage>}
    </Container>
  );
};

// 스타일 컴포넌트 (이전 코드와 동일)
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 8px;
`;

const Input = styled.input`
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 12px;
  font-size: 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const StatusMessage = styled.p`
  margin-top: 16px;
  color: green;
`;

const RequestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RequestItem = styled.div`
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const RequestDetails = styled.div`
  font-size: 14px;
  color: #333;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const ApproveButton = styled.button`
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;

const RejectButton = styled.button`
  padding: 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #e53935;
  }
`;

export default VacationPage;
