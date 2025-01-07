import styled from "styled-components";
import { useState, useEffect } from "react";
import axios from "axios";
import AddUserForm from "./AddUserForm";
import { API_BASE_URL, USER } from "../../configs/host-config";
import OrganizationManagement from "./OrganizationManagement";
import { FiEye, FiEdit2, FiTrash2, FiUserPlus } from "react-icons/fi";

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("users");
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}${USER}/api/admin/users/list`
                );

                const userData = response.data.result || [];

                const formattedUsers = userData.map((user) => ({
                    id: user.userId,
                    name: user.name,
                    email: user.email,
                    department: user.departmentId || "미지정",
                    position: user.position || "미지정",
                    status: user.accountActive ? "재직중" : "비활성",
                    profileImage:
                        user.profileImage || "/images/profiles/default.jpg",
                    phoneNum: user.phoneNum,
                }));

                setUsers(formattedUsers);
                setError(null);
            } catch (err) {
                setError("사용자 목록을 불러오는데 실패했습니다.");
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === "users") {
            fetchUsers();
        }
    }, [activeTab]);

    const handleEditUser = (user) => {
        setEditUser(user);
    };

    const handleCloseModal = () => {
        setShowAddUserForm(false);
        setEditUser(null);
    };

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
                </TabMenu>
            </DashboardHeader>

            <ContentArea>
                {activeTab === "users" && (
                    <UserManagement>
                        <SearchSection>
                            <SearchInput
                                type="text"
                                placeholder="사용자 검색 (이름, 부서)"
                            />
                        </SearchSection>

                        {loading ? (
                            <LoadingMessage>
                                사용자 목록을 불러오는 중...
                            </LoadingMessage>
                        ) : error ? (
                            <ErrorMessage>{error}</ErrorMessage>
                        ) : (
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
                                                    <FiEye size={16} />
                                                </ActionButton>
                                                <ActionButton
                                                    onClick={() =>
                                                        handleEditUser(user)
                                                    }
                                                >
                                                    <FiEdit2 size={16} />
                                                </ActionButton>
                                                <ActionButton>
                                                    <FiTrash2 size={16} />
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

                {(showAddUserForm || editUser) && (
                    <AddUserForm
                        onBack={handleCloseModal}
                        editUser={editUser}
                    />
                )}
            </ContentArea>

            {activeTab === "users" && !editUser && (
                <FloatingButton onClick={() => setShowAddUserForm(true)}>
                    <FiUserPlus size={24} />
                </FloatingButton>
            )}
        </DashboardContainer>
    );
};

const DashboardContainer = styled.div`
    padding: 24px;
    height: 100%;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.colors.background};
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colors.border};
        border-radius: 4px;

        &:hover {
            background: ${({ theme }) => theme.colors.text2};
        }
    }
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

    display: block;
    max-height: calc(100vh - 300px);
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.colors.background};
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colors.border};
        border-radius: 4px;

        &:hover {
            background: ${({ theme }) => theme.colors.text2};
        }
    }

    thead {
        position: sticky;
        top: 0;
        background: white;
        z-index: 1;
    }

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
    color: ${({ theme }) => theme.colors.text2};

    &:hover {
        color: ${({ theme }) => theme.colors.primary};
    }
`;

const LoadingMessage = styled.div`
    text-align: center;
    padding: 20px;
    color: ${({ theme }) => theme.colors.text2};
`;

const ErrorMessage = styled.div`
    text-align: center;
    padding: 20px;
    color: ${({ theme }) => theme.colors.error};
`;

export default Dashboard;
