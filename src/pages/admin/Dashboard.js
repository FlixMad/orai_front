import styled from "styled-components";
import { useState } from "react";
import AddUserForm from "./AddUserForm";
import OrganizationManagement from "./OrganizationManagement";

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("users");
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [users, setUsers] = useState([
        {
            id: 1,
            name: "김영희",
            department: "개발팀",
            position: "선임 개발자",
            email: "kim.yh@company.com",
            status: "재직중",
            profileImage: "/images/profiles/user1.jpg",
        },
        {
            id: 2,
            name: "이철수",
            department: "디자인팀",
            position: "팀장",
            email: "lee.cs@company.com",
            status: "재직중",
            profileImage: "/images/profiles/user2.jpg",
        },
        {
            id: 3,
            name: "박지민",
            department: "인사팀",
            position: "매니저",
            email: "park.jm@company.com",
            status: "휴직중",
            profileImage: "/images/profiles/user3.jpg",
        },
    ]);

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
                        {!showAddUserForm && (
                            <SearchSection>
                                <SearchInput
                                    type="text"
                                    placeholder="사용자 검색 (이름, 부서)"
                                />
                            </SearchSection>
                        )}

                        {showAddUserForm && (
                            <AddUserForm
                                onBack={() => setShowAddUserForm(false)}
                            />
                        )}

                        {!showAddUserForm && (
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
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <ProfileImage
                                                    src={user.profileImage}
                                                    alt={user.name}
                                                />
                                            </td>
                                            <td>{user.name}</td>
                                            <td>{user.department}</td>
                                            <td>{user.position}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <StatusBadge
                                                    status={user.status}
                                                >
                                                    {user.status}
                                                </StatusBadge>
                                            </td>
                                            <td>
                                                <ActionButton>
                                                    <img
                                                        src="/images/icons/edit.png"
                                                        alt="편집"
                                                    />
                                                </ActionButton>
                                                <ActionButton>
                                                    <img
                                                        src="/images/icons/delete.png"
                                                        alt="삭제"
                                                    />
                                                </ActionButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </UsersTable>
                        )}
                    </UserManagement>
                )}

                {activeTab === "organization" && <OrganizationManagement />}
            </ContentArea>

            {!showAddUserForm && activeTab === "users" && (
                <FloatingButton onClick={() => setShowAddUserForm(true)}>
                    <img src="/images/icons/add-user.png" alt="사용자 추가" />
                </FloatingButton>
            )}
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
        ${({ active, theme }) =>
            active ? theme.colors.primary : "transparent"};
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

const FloatingButton = styled.button`
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: background-color 0.2s ease;

    img {
        width: 24px;
        height: 24px;
    }

    &:hover {
        background-color: ${({ theme }) => theme.colors.secondary1};
    }
`;

const ProfileImage = styled.img`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
`;

const StatusBadge = styled.span`
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${({ status, theme }) =>
        status === "재직중"
            ? theme.colors.success + "20"
            : theme.colors.warning + "20"};
    color: ${({ status, theme }) =>
        status === "재직중" ? theme.colors.success : theme.colors.warning};
`;

const ActionButton = styled.button`
    padding: 4px;
    margin: 0 4px;
    background: none;
    border: none;
    cursor: pointer;

    img {
        width: 16px;
        height: 16px;
        opacity: 0.6;
    }

    &:hover img {
        opacity: 1;
    }
`;

export default Dashboard;
