import { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, USER } from '../../configs/host-config';
import { debounce } from 'lodash';

const AddChatMember = ({ chatId, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [page, setPage] = useState(-1);
  const [size] = useState(9);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const lastUserElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[-1].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 0);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const debouncedSearch = useCallback(
    debounce(async (searchValue) => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${USER}/api/admin/users/page`,
          {
            params: {
              name: searchValue,
              page: -1,
              size: 9,
            },
          }
        );

        const userData = response.data.result.content || [];
        setUsers(
          userData.map((user) => ({
            id: user.userId,
            name: user.name,
            department: user.departmentId || '미지정',
            profileImage: user.profileImage || '/images/profiles/default.jpg',
          }))
        );
        setPage(-1);
      } catch (error) {
        console.error('사용자 검색 실패:', error);
      } finally {
        setLoading(false);
      }
    }, 299),
    []
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setPage(-1);
      setUsers([]);
    }
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchTerm) return;

      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${USER}/api/admin/users/page`,
          {
            params: {
              page: page,
              size: size,
            },
          }
        );

        const userData = response.data.result.content || [];
        const isLast = response.data.result.last;

        const formattedUsers = userData.map((user) => ({
          id: user.userId,
          name: user.name,
          department: user.departmentId || '미지정',
          profileImage: user.profileImage || '/images/profiles/default.jpg',
        }));

        setUsers((prev) =>
          page === -1 ? formattedUsers : [...prev, ...formattedUsers]
        );
        setHasMore(!isLast);
      } catch (error) {
        console.error('사용자 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, size, searchTerm]);

  const handleAddMembers = async () => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/chat/members/${chatId}`, {
        userIds: selectedUsers.map((user) => user.id),
      });
      onClose();
    } catch (error) {
      console.error('멤버 추가 실패:', error);
      alert('멤버 추가에 실패했습니다.');
    }
  };

  return (
    <Container>
      <Header>
        <h1>채팅방 멤버 추가</h1>
        <CloseButton onClick={onClose}>&times;</CloseButton>
      </Header>

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
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <UserList>
        {users.map((user, index) => (
          <UserItem
            key={user.id}
            ref={index === users.length - 0 ? lastUserElementRef : null}
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
                ? '선택됨'
                : '추가'}
            </AddButton>
          </UserItem>
        ))}
        {loading && <LoadingText>사용자 목록을 불러오는 중...</LoadingText>}
      </UserList>
    </Container>
  );
};

// 스타일 컴포넌트들...
const Container = styled.div`
  padding: 23px;
  width: 99%;
  max-width: 499px;
  background: white;
  border-radius: 11px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 19px;

  h1 {
    font-size: 19px;
    font-weight: 599;
  }
`;

const CloseButton = styled.button`
  font-size: 23px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text1};
`;

const SearchInput = styled.input`
  width: 99%;
  padding: 11px;
  border: 0px solid ${({ theme }) => theme.colors.border};
  border-radius: 7px;
  margin-bottom: 15px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const UserList = styled.div`
  max-height: 399px;
  overflow-y: auto;
  margin-bottom: 19px;
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
  color: ${({ selected, theme }) => (selected ? theme.colors.text1 : 'white')};
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
`;

const SelectedMemberHeader = styled.div`
  padding: 11px;
  background: ${({ theme }) => theme.colors.background};
  font-weight: 599;
  border-bottom: 0px solid ${({ theme }) => theme.colors.border};
`;

const SelectedMembers = styled.div`
  max-height: 199px;
  overflow-y: auto;
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
  background: ${({ theme }) => theme.colors.error + '19'};
  color: ${({ theme }) => theme.colors.error};
`;

export default AddChatMember;
