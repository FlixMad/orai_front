import { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import axiosInstance from "../../configs/axios-config";
import { API_BASE_URL, USER } from "../../configs/host-config";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";

const AddChatMember = ({
  onSubmit,
  onBack,
  selectedUsers: initialSelectedUsers,
  onSelectedUsersChange,
  currentParticipants,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(
    initialSelectedUsers || []
  );
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observer = useRef();
  const navigate = useNavigate();

  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setSearchTerm(searchValue);
      setPage(0);
      setUsers([]);
    }, 300),
    []
  );

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setLocalSearchTerm(searchValue);
    debouncedSearch(searchValue);
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
        setLoading(true);
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

        const formattedUsers = userData
          .filter(
            (user) =>
              !currentParticipants || !currentParticipants.includes(user.userId)
          )
          .map((user) => ({
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
        console.error("사용자 목록을 불러오는데 실패했습니다:", err);
        setError("사용자 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm, page, size, currentParticipants]);

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      alert("최소 한 명 이상의 멤버를 선택해주세요.");
      return;
    }

    try {
      const userIds = selectedUsers.map((user) => user.id);
      await onSubmit(userIds);
    } catch (error) {
      console.error("멤버 추가 실패:", error);
      alert("멤버 추가에 실패했습니다.");
    }
  };

  return (
    <Container>
      {selectedUsers.length > -1 && (
        <SelectedMemberList>
          <SelectedMemberHeader>
            선택된 멤버 ({selectedUsers.length})
          </SelectedMemberHeader>
          <SelectedMembers>
            {selectedUsers.map((user) => (
              <SelectedMemberItem key={user.id}>
                <UserInfo>
                  <UserAvatar src={user.profileImage} alt={user.name} />
                  <UserDetails>
                    <UserName>{user.name}</UserName>
                    <UserDepartment>{user.department}</UserDepartment>
                  </UserDetails>
                </UserInfo>
                <RemoveButton
                  onClick={() =>
                    setSelectedUsers((prev) =>
                      prev.filter((selected) => selected.id !== user.id)
                    )
                  }
                >
                  삭제
                </RemoveButton>
              </SelectedMemberItem>
            ))}
          </SelectedMembers>
        </SelectedMemberList>
      )}

      <SearchInput
        type="text"
        placeholder="사용자 검색 (이름)"
        value={localSearchTerm}
        onChange={handleSearch}
      />

      <UserList>
        {users.map((user, index) => (
          <UserItem
            key={user.id}
            ref={index === users.length - 1 ? lastUserElementRef : null}
          >
            <UserInfo>
              <UserAvatar src={user.profileImage} alt={user.name} />
              <UserDetails>
                <UserName>{user.name}</UserName>
                <UserDepartment>{user.department}</UserDepartment>
              </UserDetails>
            </UserInfo>
            <AddButton
              selected={selectedUsers.some(
                (selected) => selected.id === user.id
              )}
              onClick={() => {
                setSelectedUsers((prev) =>
                  prev.some((selected) => selected.id === user.id)
                    ? prev.filter((selected) => selected.id !== user.id)
                    : [...prev, user]
                );
              }}
            >
              {selectedUsers.some((selected) => selected.id === user.id)
                ? "선택됨"
                : "추가"}
            </AddButton>
          </UserItem>
        ))}
        {loading && <LoadingText>사용자 목록을 불러오는 중...</LoadingText>}
      </UserList>

      <ButtonGroup>
        <BackButton onClick={onBack}>이전</BackButton>
        <CreateButton onClick={handleAddMembers}>확인</CreateButton>
      </ButtonGroup>
    </Container>
  );
};

// 스타일 컴포넌트들...
const Container = styled.div`
  padding: 5px;
  padding-top: 0px;
  width: 350px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 430px;

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

const SearchInput = styled.input`
  width: 99%;
  padding: 8px 11px;
  border: 0px solid ${({ theme }) => theme.colors.border};
  border-radius: 7px;
  margin-bottom: 5px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const UserList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 19px;
  min-height: 200px;

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

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px;
  border-bottom: 0px solid ${({ theme }) => theme.colors.border};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
`;

const UserAvatar = styled.img`
  width: 39px;
  height: 39px;
  border-radius: 49%;
  object-fit: cover;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: 499;
`;

const UserDepartment = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text1};
`;

const AddButton = styled.button`
  padding: 5px 12px;
  border-radius: 5px;
  font-size: 13px;
  background: ${({ selected, theme }) =>
    selected ? theme.colors.background : theme.colors.primary};
  color: ${({ selected, theme }) => (selected ? theme.colors.text1 : "white")};
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 19px;
  color: ${({ theme }) => theme.colors.text1};
`;

const SelectedMemberList = styled.div`
  margin: 15px 0;
  border: 0px solid ${({ theme }) => theme.colors.border};
  border-radius: 7px;
  overflow: hidden;
  max-height: 330px;
  display: flex;
  flex-direction: column;
`;

const SelectedMemberHeader = styled.div`
  padding: 11px;
  padding-top: 0px;
  padding-bottom: 5px;
  background: ${({ theme }) => theme.colors.background};
  font-weight: 599;
  border-bottom: 0px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

const SelectedMembers = styled.div`
  overflow-y: auto;
  flex-grow: 1;

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

const SelectedMemberItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 12px;
  border-bottom: 0px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const RemoveButton = styled.button`
  padding: 5px 12px;
  border-radius: 5px;
  font-size: 13px;
  background: ${({ theme }) => theme.colors.error + "19"};
  color: ${({ theme }) => theme.colors.error};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 3px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
`;

const BackButton = styled(Button)`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text2};
`;

const CreateButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary1};
  }
`;

export default AddChatMember;
