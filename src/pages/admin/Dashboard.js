import styled from "styled-components";
import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../../configs/axios-config";
import { handleAxiosError } from "../../configs/HandleAxiosError";
import { useNavigate } from "react-router-dom";
import AddUserForm from "./AddUserForm";
import { API_BASE_URL, USER } from "../../configs/host-config";
import OrganizationManagement from "./OrganizationManagement";
import { FiEye, FiEdit2, FiTrash2, FiUserPlus } from "react-icons/fi";
import { debounce } from "lodash";
import Modal from "../../components/common/Modal";
import AttitudeModal from "../../components/common/AttitudeModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTags, setSearchTags] = useState([]);

  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setSearchTerm(searchValue);
      setPage(0);
    }, 300),
    []
  );

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setLocalSearchTerm(searchValue);
    if (searchValue.trim() === "") {
      setSearchTerm("");
      setPage(0);
      setUsers([]);
    } else {
      debouncedSearch(searchValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (localSearchTerm.trim()) {
        const trimmedSearchTerm = localSearchTerm.trim();
        if (
          trimmedSearchTerm.startsWith("#") ||
          trimmedSearchTerm.startsWith("@")
        ) {
          setSearchTags((prevTags) => [...prevTags, trimmedSearchTerm]);
        }
        setLocalSearchTerm("");
      }
    }
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const lastUserElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let params = {
          page: page,
          size: size,
        };

        if (searchTerm.startsWith("@")) {
          params.position = searchTerm.slice(1);
        } else if (searchTerm.startsWith("#")) {
          params.departmentId = searchTerm.slice(1);
        } else {
          params.name = searchTerm;
        }

        const response = await axiosInstance.get(
          `${API_BASE_URL}${USER}/api/admin/users/page`,
          { params }
        );

        const userData = response.data.result.content || [];
        const isLast = response.data.result.last;

        const formattedUsers = userData.map((user) => ({
          id: user.userId,
          name: user.name,
          email: user.email,
          department: user.departmentId || "미지정",
          position: user.position || "미지정",
          status: user.accountActive ? "재직중" : "비활성",
          profileImage: user.profileImage || "/images/profiles/default.jpg",
          phoneNum: user.phoneNum,
        }));

        setUsers((prev) =>
          page === 0 ? formattedUsers : [...prev, ...formattedUsers]
        );
        setHasMore(!isLast);
        setError(null);
      } catch (err) {
        handleAxiosError(err, () => {}, navigate);
        setError("사용자 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, navigate, searchTerm, page, size]);

  const handleEditUser = (user) => {
    setEditUser(user);
  };

  const handleCloseModal = () => {
    setShowAddUserForm(false);
    setEditUser(null);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}${USER}/api/admin/users`, {
        data: { userId: userToDelete.id },
      });

      setUsers(users.filter((user) => user.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      handleAxiosError(err, () => {}, navigate);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleTagDelete = (index) => {
    setSearchTags((prevTags) => prevTags.filter((_, i) => i !== index));
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
                placeholder="사용자 검색 (이름)"
                value={localSearchTerm}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
                isSpecialSearch={
                  localSearchTerm.startsWith("#") ||
                  localSearchTerm.startsWith("@")
                }
              />
            </SearchSection>

            {searchTags.length > 0 && (
              <TagContainer>
                {searchTags.map((tag, index) => (
                  <Tag key={index}>
                    {tag}
                    <DeleteButton onClick={() => handleTagDelete(index)}>
                      ×
                    </DeleteButton>
                  </Tag>
                ))}
              </TagContainer>
            )}

            {loading ? (
              <LoadingMessage>사용자 목록을 불러오는 중...</LoadingMessage>
            ) : error ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : (
              <TableContainer>
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
                    {users.map((user, index) => (
                      <tr
                        key={user.id}
                        ref={
                          index === users.length - 1 ? lastUserElementRef : null
                        }
                      >
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
                          <StatusBadge status={user.status}>
                            {user.status}
                          </StatusBadge>
                        </td>
                        <td>
                          <ActionButton onClick={() => handleViewUser(user)}>
                            <FiEye size={16} />
                          </ActionButton>
                          <ActionButton onClick={() => handleEditUser(user)}>
                            <FiEdit2 size={16} />
                          </ActionButton>
                          <ActionButton onClick={() => handleDeleteClick(user)}>
                            <FiTrash2 size={16} />
                          </ActionButton>
                        </td>
                      </tr>
                    ))}
                    {loading && (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign: "center",
                          }}
                        >
                          데이터를 불러오는 중중...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </UsersTable>
              </TableContainer>
            )}
          </UserManagement>
        )}

        {activeTab === "organization" && <OrganizationManagement />}

        {(showAddUserForm || editUser) && (
          <AddUserForm onBack={handleCloseModal} editUser={editUser} />
        )}
      </ContentArea>

      {activeTab === "users" && !editUser && (
        <FloatingButton onClick={() => setShowAddUserForm(true)}>
          <FiUserPlus size={24} />
        </FloatingButton>
      )}

      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          title="사용자 삭제"
          confirmText="삭제"
          cancelText="취소"
          onConfirm={handleDeleteConfirm}
        >
          <p>정말 {userToDelete?.name} 사용자를 삭제하시겠습니까?</p>
          <p>이 작업은 되돌릴 수 없습니다.</p>
        </Modal>
      )}

      {showDetailModal && (
        <AttitudeModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
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
  background-color: ${({ isSpecialSearch, theme }) =>
    isSpecialSearch ? theme.colors.secondary1 + "20" : "white"};
  color: ${({ isSpecialSearch, theme }) =>
    isSpecialSearch ? theme.colors.primary : theme.colors.text};

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

const TableContainer = styled.div`
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
`;

const UsersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  display: table;
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
    background: white;
    z-index: 1;

    th {
      padding: 12px;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text2};
      font-size: 14px;
      text-align: left;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border};
      white-space: nowrap;
      overflow: visible;
    }
  }

  tbody td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
  }

  th:nth-child(1),
  td:nth-child(1) {
    width: 7%;
  }
  th:nth-child(2),
  td:nth-child(2) {
    width: 13%;
  }
  th:nth-child(3),
  td:nth-child(3) {
    width: 13%;
  }
  th:nth-child(4),
  td:nth-child(4) {
    width: 13%;
  }
  th:nth-child(5),
  td:nth-child(5) {
    width: 25%;
  }
  th:nth-child(6),
  td:nth-child(6) {
    width: 9%;
  }
  th:nth-child(7),
  td:nth-child(7) {
    width: 20%;
    text-align: center;
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
  padding: 6px;
  margin: 0 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text2};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.background};
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

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const Tag = styled.span`
  background-color: ${({ theme }) => theme.colors.secondary1};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  margin-left: 4px;
  &:hover {
    color: ${({ theme }) => theme.colors.error};
  }
`;

export default Dashboard;
