import { useState, useEffect } from 'react';
import styled from 'styled-components';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, CHAT } from '../../configs/host-config';
import { useNavigate, useLocation } from 'react-router-dom';

const ChatList = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const currentChatId = location.pathname.split('/')[2];
  const [chatRooms, setChatRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editRoomName, setEditRoomName] = useState('');

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CHAT}/chatRoomList`
      );
      if (response.status === 200) {
        setChatRooms(response.data.result);
      }
    } catch (error) {
      console.error('채팅방 목록 조회 실패: ', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setName(''); // 입력창 초기화
  };

  const handleCreateRoom = async () => {
    try {
      // 채팅방 이름이 비어있는지 확인
      if (!name.trim()) {
        setName('');
        alert('채팅방 이름을 입력해주세요.');
        document.querySelector('input').focus();
        return;
      }

      const response = await axiosInstance.post(
        `${API_BASE_URL}${CHAT}/createChatRoom`,
        name
      );

      if (response.status === 200) {
        const { result } = response.data;
        setName('');
        alert('채팅방이 생성되었습니다.');
        setIsModalOpen(false);
        console.log('생성된 채팅방 정보:', result);
        fetchChatRooms();
        // TODO: 필요한 경우 채팅방 목록을 새로고침하거나 새로 생성된 채팅방으로 이동
      }
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      setName('');
      alert('채팅방 생성에 실패했습니다. 다시 시도해주세요.');
      document.querySelector('input').focus();
    }
  };

  // 채팅방 수정 함수
  const handleUpdateRoom = async () => {
    try {
      if (!editRoomName.trim()) {
        setName('');
        alert('새로운 채팅방 이름을 입력해주세요.');
        return;
      }

      // 기존 이름과 새 이름이 같은지 확인
      if (editRoomName === selectedRoom.name) {
        alert('채팅방 이름에 변화가 없습니다.');
        return;
      }

      const response = await axiosInstance.put(
        `${API_BASE_URL}${CHAT}/${selectedRoom.chatRoomId}/updateChatRoom`,
        editRoomName
      );

      if (response.status === 200) {
        alert('채팅방 이름이 수정되었습니다.');
        setName('');
        setIsManageModalOpen(false);
        fetchChatRooms();
      }
    } catch (error) {
      setName('');
      console.error('채팅방 수정 실패:', error);
      alert('채팅방 수정에 실패했습니다.');
    }
  };

  // 채팅방 삭제 함수
  const handleDeleteRoom = async () => {
    try {
      const response = await axiosInstance.delete(
        `${API_BASE_URL}${CHAT}/${selectedRoom.chatRoomId}/deleteChatRoom`
      );

      if (response.status === 200) {
        alert('채팅방이 삭제되었습니다.');
        setIsDeleteConfirmOpen(false);
        setIsManageModalOpen(false);
        fetchChatRooms();
      }
    } catch (error) {
      console.error('채팅방 삭제 실패:', error);
      alert('채팅방 삭제에 실패했습니다.');
    }
  };

  return (
    <ChatListContainer className={className}>
      <ChatListHeader>
        <HeaderTitle>채팅방 목록</HeaderTitle>
        <SearchBar>
          <img src="/images/icons/search.png" alt="검색" />
          <input
            type="text"
            placeholder="채팅방 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </ChatListHeader>

      <ChatRooms>
        {chatRooms.map((room) => (
          <ChatRoom
            onClick={() => navigate(`/chat/${room.chatRoomId}`)}
            active={currentChatId === `${room.chatRoomId}`}
          >
            <RoomIcon
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRoom(room);
                setEditRoomName(room.name);
                setIsManageModalOpen(true);
              }}
            >
              <img src="/images/icons/factory.png" alt="채팅방 아이콘" />
            </RoomIcon>
            <RoomInfo>
              <RoomTitle>{room.name}</RoomTitle>
              <CreatedAt>{room.createdAt}</CreatedAt>
            </RoomInfo>
            <ChatRoomId>{room.chatRoomId}</ChatRoomId>
          </ChatRoom>
        ))}
      </ChatRooms>
      <NewChatButton onClick={() => setIsModalOpen(true)}>
        <img src="/images/icons/plus-circle.png" alt="새 채팅방" />
      </NewChatButton>

      {/* 새채팅방 생성 모달 */}
      {isModalOpen && (
        <Modal>
          <ModalContent>
            <ModalTitle>새 채팅방 만들기</ModalTitle>
            <Input
              type="text"
              placeholder="채팅방 이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <ButtonGroup>
              <CancelButton onClick={handleCloseModal}>취소</CancelButton>
              <ConfirmButton onClick={handleCreateRoom}>생성</ConfirmButton>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {/* 채팅방 관리 모달 */}
      {isManageModalOpen && (
        <Modal onClick={() => setIsManageModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>채팅방 관리</ModalTitle>
            <Input
              type="text"
              value={editRoomName}
              onChange={(e) => setEditRoomName(e.target.value)}
              placeholder="새로운 채팅방 이름"
            />
            <ButtonGroup>
              <UpdateButton onClick={handleUpdateRoom}>수정</UpdateButton>
              <DeleteButton onClick={() => setIsDeleteConfirmOpen(true)}>
                삭제
              </DeleteButton>
              <CancelButton onClick={() => setIsManageModalOpen(false)}>
                취소
              </CancelButton>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteConfirmOpen && (
        <Modal onClick={() => setIsDeleteConfirmOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>채팅방 삭제</ModalTitle>
            <ModalText>정말로 이 채팅방을 삭제하시겠습니까?</ModalText>
            <ButtonGroup>
              <DeleteButton onClick={handleDeleteRoom}>삭제</DeleteButton>
              <CancelButton onClick={() => setIsDeleteConfirmOpen(false)}>
                취소
              </CancelButton>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </ChatListContainer>
  );
};

const ChatListContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  position: relative;
`;

const ChatListHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeaderTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text1};
  margin-bottom: 16px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.colors.background2};
  border-radius: 8px;
  transition: all 0.2s ease;

  img {
    width: 16px;
    height: 16px;
    opacity: 0.5;
  }

  input {
    border: none;
    background: none;
    outline: none;
    width: 100%;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text1};

    &::placeholder {
      color: ${({ theme }) => theme.colors.text3};
    }
  }

  &:focus-within {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
`;

const ChatRooms = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }
`;

const ChatRoom = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  background: ${({ active, theme }) =>
    active ? theme.colors.background2 : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background2};
  }
`;

const RoomIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background1};
  flex-shrink: 0;

  img {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }
`;

const RoomInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RoomTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text1};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CreatedAt = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text2};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatRoomId = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
`;

const NewChatButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  position: absolute;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;

  img {
    width: 24px;
    height: 24px;
    filter: brightness(0) invert(1);
  }

  &:hover {
    transform: scale(1.05);
    background: ${({ theme }) => theme.colors.secondary1};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 400px;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.text1};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
`;

const CancelButton = styled(Button)`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text2};
`;

const ConfirmButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary1};
  }
`;

const ModalText = styled.p`
  margin: 20px 0;
  color: ${({ theme }) => theme.colors.text2};
`;

const UpdateButton = styled(Button)`
  background: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.status1};
  &:hover {
    background: ${({ theme }) => theme.colors.background1};
  }
`;

const DeleteButton = styled(Button)`
  background: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.status3};
  &:hover {
    background: ${({ theme }) => theme.colors.background1};
  }
`;

export default ChatList;
