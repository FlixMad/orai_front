import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../configs/host-config";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "오승준",
        position: "팀장 | 개발팀",
        profileImage: "/images/profile/user-avatar.png",
    });
    const [workStatus, setWorkStatus] = useState("업무 중");
    const [isWorking, setIsWorking] = useState(false);
    const [workStartTime, setWorkStartTime] = useState(null); // 출근 시간
    const [workEndTime, setWorkEndTime] = useState(null); // 퇴근 시간
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
        const savedWorkStatus = localStorage.getItem("isWorking");
        const savedWorkStartTime = localStorage.getItem("workStartTime");

        if (savedWorkStatus === "true") {
            setIsWorking(true);
            setWorkStartTime(savedWorkStartTime);
        } else {
            setIsWorking(false);
        }

        fetch(`${API_BASE_URL}/user-service/api/users/me`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setUser({
                    name: data.name,
                    position: `${data.position} | ${data.departmentId}`,
                    profileImage:
                        data.profileImage || "/images/profile/user-avatar.png",
                });
            })
            .catch((error) => {
                console.error("사용자 정보 가져오기 실패:", error);
            });
    }, []);

    const handleWorkStart = () => {
        const startTime = new Date().toISOString();
        setIsWorking(true);
        setWorkStartTime(startTime); // 출근 시간 설정
        localStorage.setItem("isWorking", "true");
        localStorage.setItem("workStartTime", startTime); // 출근 시간 저장

        fetch(`${API_BASE_URL}/user-service/api/attitude/checkin`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: user.userId,
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
        const endTime = new Date().toISOString();
        setIsWorking(false);
        setWorkEndTime(endTime); // 퇴근 시간 설정
        localStorage.setItem("isWorking", "false");

        fetch(`${API_BASE_URL}/user-service/api/attitude/checkout`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: user.userId,
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
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const calculateWorkDuration = () => {
        if (workStartTime && workEndTime) {
            const start = new Date(workStartTime);
            const end = new Date(workEndTime);
            const durationInMilliseconds = end - start;
            const hours = Math.floor(durationInMilliseconds / (1000 * 60 * 60));
            const minutes = Math.floor(
                (durationInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
            );
            return `${hours}시간 ${minutes}분`;
        }
        return "근무 시간이 없습니다.";
    };

    useEffect(() => {
        console.log("출근 시간:", workStartTime);
        console.log("퇴근 시간:", workEndTime);
    }, [workStartTime, workEndTime]);

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
                            <img
                                src="/images/icons/work-end.png"
                                alt="상태 변경"
                            />
                        </StatusButton>
                    </UserDetails>
                </UserInfo>
                <WorkActions>
                    {!isWorking ? (
                        <ActionButton
                            onClick={handleWorkStart}
                            color="primary"
                            disabled={workStartTime}
                        >
                            <img
                                src="/images/icons/work-start.png"
                                alt="출근"
                            />
                            출근하기
                        </ActionButton>
                    ) : (
                        <ActionButton
                            onClick={handleWorkEnd}
                            color="secondary3"
                            disabled={workEndTime}
                        >
                            <img src="/images/icons/work-end.png" alt="퇴근" />
                            퇴근하기
                        </ActionButton>
                    )}
                </WorkActions>
            </ProfileHeader>

            <ContentGrid>
                <Section>
                    <SectionTitle>계정 관리</SectionTitle>
                    <AccountActions>
                        <ActionButton
                            onClick={() => navigate("/change-password")}
                        >
                            비밀번호 변경
                        </ActionButton>
                        <ActionButton onClick={handleLogout} color="status3">
                            로그아웃
                        </ActionButton>
                    </AccountActions>
                </Section>
                <Section>
                    <SectionTitle>근무 시간</SectionTitle>
                    <WorkDurationBox>
                        {workStartTime && workEndTime ? (
                            <p>{calculateWorkDuration()}</p>
                        ) : (
                            <p>출근과 퇴근 시간을 기록해주세요.</p>
                        )}
                    </WorkDurationBox>
                </Section>
            </ContentGrid>

            {showStatusModal && (
                <StatusModal>
                    <ModalContent>
                        <ModalHeader>
                            <h3>상태 변경</h3>
                            <CloseButton
                                onClick={() => setShowStatusModal(false)}
                            >
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

// Styled Components
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

const Section = styled.div`
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h3`
    margin-bottom: 16px;
    font-size: 20px;
`;

const AccountActions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;
const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr; /* 1:1 ratio */
    gap: 24px;
`;
const WorkDurationBox = styled.div`
    background-color: ${({ theme }) => theme.colors.background1};
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    color: ${({ theme }) => theme.colors.text1};
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    border: 2px solid ${({ theme }) => theme.colors.primary};

    p {
        margin: 0;
        font-size: 20px;
        color: ${({ theme }) => theme.colors.text2};
    }
`;

const StatusModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
    background: white;
    padding: 24px;
    border-radius: 12px;
    width: 400px;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 18px;
`;

const CloseButton = styled.button`
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
`;

const StatusList = styled.ul`
    list-style: none;
    padding: 0;
`;

const StatusOption = styled.li`
    padding: 12px 16px;
    cursor: pointer;
    background: ${({ active, theme }) =>
        active ? theme.colors.background1 : "transparent"};
    color: ${({ active, theme }) =>
        active ? theme.colors.primary : theme.colors.text1};
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 16px;

    &:hover {
        background: ${({ theme }) => theme.colors.background2};
    }
`;

export default Profile;
