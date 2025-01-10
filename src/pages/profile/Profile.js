import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "오승준", // 기본값 설정
    position: "팀장 | 개발팀", // 기본값 설정
    profileImage: "/images/profile/user-avatar.png", // 기본값 설정
  });
  const [workStatus, setWorkStatus] = useState("업무 중");
  const [isWorking, setIsWorking] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const workStatuses = [
    "업무 중",
    "외출 중",
    "외근 중",
    "회의 중",
    "휴가 중",
    "재택 근무 중",
  ];

  useEffect(() => {
    // ACCESS_TOKEN을 사용해 유저 정보 가져오기
    fetch("http://localhost:8181/user-service/api/users/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUser({
          name: data.name,
          position: `${data.position} | ${data.departmentId}`, // 부서 정보 포함
          profileImage: data.profileImage || "/images/profile/user-avatar.png",
        });
      })
      .catch((error) => {
        console.error("사용자 정보 가져오기 실패:", error);
      });
  }, []); // 컴포넌트 마운트 시에만 호출

  const handleWorkStart = () => {
    setIsWorking(true);
    const token = localStorage.getItem("ACCESS_TOKEN");

    // 출근 API 호출
    fetch("http://localhost:8181/user-service/api/attitude/checkin", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`, // 토큰을 Authorization 헤더에 추가
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.userId, // 필요에 따라 사용자 ID나 기타 필요한 데이터 추가
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("출근 시간 기록 성공", data);
      })
      .catch((error) => {
        console.error("출근 시간 기록 실패:", error);
      });
  };

  const handleWorkEnd = () => {
    setIsWorking(false);
    const token = localStorage.getItem("ACCESS_TOKEN");

    // 퇴근 API 호출
    fetch("http://localhost:8181/user-service/api/attitude/checkout", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`, // 토큰을 Authorization 헤더에 추가
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.userId, // 필요에 따라 사용자 ID나 기타 필요한 데이터 추가
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("퇴근 시간 기록 성공", data);
      })
      .catch((error) => {
        console.error("퇴근 시간 기록 실패:", error);
      });
  };

  const handleStatusChange = (status) => {
    setWorkStatus(status);
    setShowStatusModal(false);
    // API 호출: 상태 변경 저장
  };

  const handleLogout = () => {
    // JWT 토큰 제거
    localStorage.removeItem("ACCESS_TOKEN");
    navigate("/login");
  };

  return (
    <ProfileContainer>
      <ProfileHeader>
        <UserInfo>
          <UserAvatar>
            <img src={user.profileImage} alt="프로필 사진" />
            <StatusBadge status={workStatus} />
          </UserAvatar>
          <UserDetails>
            <h2>{user.name}</h2>
            <Position>{user.position}</Position>
            <StatusButton onClick={() => setShowStatusModal(true)}>
              {workStatus}
              <img src="/images/icons/arrow-down.png" alt="상태 변경" />
            </StatusButton>
          </UserDetails>
        </UserInfo>
        <WorkActions>
          {!isWorking ? (
            <ActionButton onClick={handleWorkStart} color="primary">
              <img src="/images/icons/work-start.png" alt="출근" />
              출근하기
            </ActionButton>
          ) : (
            <ActionButton onClick={handleWorkEnd} color="secondary3">
              <img src="/images/icons/work-end.png" alt="퇴근" />
              퇴근하기
            </ActionButton>
          )}
        </WorkActions>
      </ProfileHeader>

      <ContentGrid>
        <Section>
          <SectionTitle>근태 현황</SectionTitle>
          <AttendanceStats>
            <StatItem>
              <Label>이번 주 근무</Label>
              <Value>32시간</Value>
            </StatItem>
            <StatItem>
              <Label>이번 주 초과근무</Label>
              <Value>2시간</Value>
            </StatItem>
            <StatItem>
              <Label>이번 달 근무</Label>
              <Value>140시간</Value>
            </StatItem>
          </AttendanceStats>
        </Section>

        <Section>
          <SectionTitle>연차 현황</SectionTitle>
          <LeaveStats>
            <StatItem>
              <Label>총 연차</Label>
              <Value>15일</Value>
            </StatItem>
            <StatItem>
              <Label>사용 연차</Label>
              <Value>7일</Value>
            </StatItem>
            <StatItem>
              <Label>잔여 연차</Label>
              <Value>8일</Value>
            </StatItem>
          </LeaveStats>
          <ActionButton
            onClick={() => navigate("/leave-request")}
            color="primary"
          >
            휴가 신청
          </ActionButton>
        </Section>

        <Section>
          <SectionTitle>계정 관리</SectionTitle>
          <AccountActions>
            <ActionButton onClick={() => navigate("/change-password")}>
              비밀번호 변경
            </ActionButton>
            <ActionButton onClick={handleLogout} color="status3">
              로그아웃
            </ActionButton>
          </AccountActions>
        </Section>
      </ContentGrid>

      {showStatusModal && (
        <StatusModal>
          <ModalContent>
            <ModalHeader>
              <h3>상태 변경</h3>
              <CloseButton onClick={() => setShowStatusModal(false)}>
                ✕
              </CloseButton>
            </ModalHeader>
            <StatusList>
              {workStatuses.map((status) => (
                <StatusOption
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  active={status === workStatus}
                >
                  {status}
                </StatusOption>
              ))}
            </StatusList>
          </ModalContent>
        </StatusModal>
      )}
    </ProfileContainer>
  );
};

const ProfileContainer = styled.div`
  padding: 24px;
  height: 100%;
  overflow-y: auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const UserInfo = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
`;

const UserAvatar = styled.div`
  position: relative;

  img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 3px solid ${({ theme }) => theme.colors.primary};
  }
`;

const StatusBadge = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ status, theme }) => {
    switch (status) {
      case "업무 중":
        return theme.colors.status1;
      case "외출 중":
      case "외근 중":
        return theme.colors.status2;
      case "회의 중":
        return theme.colors.status4;
      case "휴가 중":
        return theme.colors.status3;
      default:
        return theme.colors.primary;
    }
  }};
  border: 2px solid white;
`;

const UserDetails = styled.div`
  h2 {
    font-size: 24px;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.text1};
  }
`;

const Position = styled.div`
  color: ${({ theme }) => theme.colors.text2};
  margin-bottom: 12px;
`;

const StatusButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text1};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background1};
  }

  img {
    width: 12px;
    height: 12px;
  }
`;

const WorkActions = styled.div`
  display: flex;
  gap: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  background-color: ${({ color, theme }) =>
    theme.colors[color] || theme.colors.background2};
  color: ${({ color }) =>
    color ? "white" : ({ theme }) => theme.colors.text1};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  img {
    width: 16px;
    height: 16px;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const Section = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h3`
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.text1};
  font-size: 18px;
`;

const AttendanceStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const LeaveStats = styled(AttendanceStats)`
  margin-bottom: 20px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const Label = styled.div`
  color: ${({ theme }) => theme.colors.text2};
  font-size: 14px;
  margin-bottom: 8px;
`;

const Value = styled.div`
  color: ${({ theme }) => theme.colors.text1};
  font-size: 20px;
  font-weight: 600;
`;

const AccountActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatusModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  max-width: 90%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    color: ${({ theme }) => theme.colors.text1};
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.text2};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text1};
  }
`;

const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatusOption = styled.button`
  padding: 12px;
  text-align: left;
  background: ${({ active, theme }) =>
    active ? theme.colors.background1 : "transparent"};
  border: none;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text1};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background1};
  }
`;

export default Profile;
