import { useState, useEffect } from 'react';
import styled from 'styled-components';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, CHAT } from '../../configs/host-config';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useRecoilValue } from 'recoil';
import { userState } from '../../atoms/userState';
import { useNavigate, useLocation } from 'react-router-dom';
import AddChatMember from './AddChatMember';
import { FaRegImage } from 'react-icons/fa6';
import { IoMdSearch } from 'react-icons/io';
import { GiQueenCrown } from 'react-icons/gi';

const ChatRoomList = ({ onChatRoomCreated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChatRooms, setFilteredChatRooms] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const currentChatId = location.pathname.split('/')[2];
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomImage, setEditRoomImage] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const currentUser = useRecoilValue(userState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (chatRooms) {
        const filtered = chatRooms.filter((room) =>
          room.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredChatRooms(filtered);
      }
    }, 300); // 300ms 디바운스

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, chatRooms]);

  useEffect(() => {
    fetchChatRooms();

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${API_BASE_URL}/stomp`, null, {
          transports: ['websocket'],
          secure: true,
        }),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`,
      },
      debug: function () {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setStompClient(client);

      // 모든 채팅방의 메시지를 구독
      chatRooms.forEach((room) => {
        client.subscribe(`/sub/${room.chatRoomId}/chat`, (message) => {
          const messageData = JSON.parse(message.body);
          const currentUserId = localStorage.getItem('userId');

          // 채팅방 목록 업데이트 (마지막 메시지, unreadCount)
          setChatRooms((prevRooms) => {
            return prevRooms.map((room) => {
              if (room.chatRoomId === messageData.chatRoomId) {
                return {
                  ...room,
                  lastMessage: messageData.content,
                  // 현재 채팅방이 아니고, 메시지 발신자가 자신이 아닐 경우에만 unreadCount 증가
                  unreadCount:
                    currentChatId !== `${room.chatRoomId}` &&
                    messageData.senderId !== currentUserId
                      ? (room.unreadCount || 0) + 1
                      : room.unreadCount,
                };
              }
              return room;
            });
          });

          // 필터링된 채팅방 목록도 동일하게 업데이트
          setFilteredChatRooms((prevRooms) => {
            return prevRooms.map((room) => {
              if (room.chatRoomId === messageData.chatRoomId) {
                return {
                  ...room,
                  lastMessage: messageData.content,
                  unreadCount:
                    currentChatId !== `${room.chatRoomId}` &&
                    messageData.senderId !== currentUserId
                      ? (room.unreadCount || 0) + 1
                      : room.unreadCount,
                };
              }
              return room;
            });
          });
        });
      });

      // 채팅방 업데이트 구독 (새로운 채팅방 생성, 멤버 초대 등)
      client.subscribe(`/queue/queue`, (notification) => {
        const data = JSON.parse(notification.body);
        alert(data.message);
        fetchChatRooms(); // 채팅방 목록 새로고침
      });
    };

    client.activate();

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [currentUser.id, currentChatId, chatRooms]);

  const fetchChatRooms = async () => {
    try {
      // 기본 채팅방 정보 조회 (이미지, 이름)
      const basicResponse = await axiosInstance.get(
        `${API_BASE_URL}${CHAT}/chatRoomList`
      );

      // 읽지 않은 메시지 수와 마지막 메시지 조회
      const unreadResponse = await axiosInstance.get(
        `${API_BASE_URL}${CHAT}/rooms/unread`
      );

      if (basicResponse.status === 200 && unreadResponse.status === 200) {
        // 두 응답의 데이터를 병합
        const mergedRooms = basicResponse.data.map((basicRoom) => {
          const unreadInfo = unreadResponse.data.find(
            (unreadRoom) => unreadRoom.chatRoomId === basicRoom.chatRoomId
          );
          return {
            ...basicRoom,
            lastMessage: unreadInfo?.lastMessage,
            unreadCount: unreadInfo?.unreadCount || 0,
          };
        });

        setChatRooms(mergedRooms);
        setFilteredChatRooms(mergedRooms);
      }
    } catch (error) {
      console.error('채팅방 목록 조회 실패: ', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setName('');
    setImage(null);
    setCurrentStep(1);
    setSelectedUsers([]);
  };

  const handleNext = () => {
    if (!name.trim() && !image) {
      alert('채팅방 이름과 이미지를 입력해주세요.');
      return;
    }

    if (!name.trim()) {
      alert('채팅방 이름을 입력해주세요.');
      return;
    }
    if (!image) {
      alert('채팅방 이미지를 선택해주세요.');
      return;
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSelectedUsers = (users) => {
    setSelectedUsers(users);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB 제한
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      setImage(file);
    }
  };

  const handleCreateRoom = async (selectedUserIds) => {
    try {
      if (!name.trim()) {
        setName('');
        alert('채팅방 이름을 입력해주세요.');
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      if (image) {
        formData.append('image', image);
      }
      formData.append('userIds', selectedUserIds);

      const response = await axiosInstance.post(
        `${API_BASE_URL}${CHAT}/createChatRoom`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        const chatRoomData = response.data;
        const chatRoomId = chatRoomData.chatRoomDto.chatRoomId;

        alert('채팅방이 생성되었습니다.');
        handleCloseModal();
        onChatRoomCreated?.(chatRoomData);
        fetchChatRooms();
        navigate(`/chat/${chatRoomId}`);
      }
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      alert('채팅방 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 채팅방 수정 함수
  const handleUpdateRoom = async () => {
    try {
      if (!editRoomName.trim()) {
        setEditRoomName(selectedRoom.name);
        setEditRoomImage(selectedRoom.image);
        alert('채팅방 제목이 너무 짧습니다.');
        return;
      }

      if (
        editRoomName === selectedRoom.name &&
        editRoomImage === selectedRoom.image
      ) {
        setEditRoomName(selectedRoom.name);
        setEditRoomImage(selectedRoom.image);
        alert('변경된 내용이 없습니다.');
        return;
      }

      const formData = new FormData();
      formData.append('name', editRoomName.trim() || selectedRoom.name);

      if (editRoomImage && typeof editRoomImage !== 'string') {
        formData.append('image', editRoomImage);
      } else {
        formData.append('image', selectedRoom.image);
      }

      const response = await axiosInstance.put(
        `${API_BASE_URL}${CHAT}/${selectedRoom.chatRoomId}/updateChatRoom`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        alert('채팅방이 수정되었습니다.');
        setIsManageModalOpen(false);
        setEditRoomName(editRoomName);
        setEditRoomImage(editRoomImage);
        fetchChatRooms();
      }
    } catch (error) {
      if (error?.response?.status === 500) {
        alert('채팅방 수정 권한이 없습니다.');
      } else if (error?.response?.status === 404) {
        alert('변경된 내용이 없거나 잘못된 요청입니다.');
      } else {
        alert('채팅방 수정 권한이 없습니다.');
      }
    }
  };

  // 채팅방 삭제 함수
  const handleDeleteRoom = async () => {
    try {
      const response = await axiosInstance.delete(
        `${API_BASE_URL}${CHAT}/${selectedRoom.chatRoomId}/deleteChatRoom`
      );

      if (response.status === 204) {
        // noContent() 응답이므로 204 상태코드 확인
        alert('채팅방이 삭제되었습니다.');
        setIsDeleteConfirmOpen(false);
        setIsManageModalOpen(false);

        if (currentChatId === `${selectedRoom.chatRoomId}`) {
          navigate('/chat');
        }

        fetchChatRooms();
      }
    } catch (error) {
      console.error('채팅방 삭제 실패:', error);
      if (error?.response?.status === 500) {
        alert('채팅방 삭제 권한이 없습니다.');
      } else if (error?.response?.status === 404) {
        alert('존재하지 않는 채팅방입니다.');
        fetchChatRooms();
      } else {
        alert('채팅방 삭제 권한이 없습니다.');
      }
    }
  };

  // 채팅방을 클릭했을 때 해당 채팅방의 unreadCount를 0으로 초기화하고 서버에 읽음 처리 요청
  const handleChatRoomClick = async (chatRoomId) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/chatRoom`
      );

      // 마지막 메시지 ID를 서버에 전송하여 읽음 처리
      if (response.data.lastMessageId) {
        await axiosInstance.post(
          `${API_BASE_URL}${CHAT}/rooms/${chatRoomId}/read`,
          {
            messageId: response.data.lastMessageId,
          }
        );
      }

      // 채팅방 목록에서 해당 채팅방의 unreadCount 초기화
      const updateRooms = (prevRooms) =>
        prevRooms.map((room) =>
          room.chatRoomId === chatRoomId ? { ...room, unreadCount: 0 } : room
        );

      setChatRooms(updateRooms);
      setFilteredChatRooms(updateRooms);

      navigate(`/chat/${chatRoomId}`);
    } catch (error) {
      if (error.response?.status === 400) {
        alert('해당 채팅방에 참여할 권한이 없습니다.');
      } else {
        alert('채팅방에 입장할 수 없습니다.');
      }
    }
  };

  return (
    <ChatListContainer>
      <ChatListHeader>
        <HeaderTitleWrapper>
          <HeaderTitle>채팅방 목록</HeaderTitle>
          <NewChatButton onClick={() => setIsModalOpen(true)}>
            새채팅방
          </NewChatButton>
        </HeaderTitleWrapper>
        <SearchBar>
          <IoMdSearch size={20} opacity={0.5} />
          <input
            type="text"
            placeholder="채팅방 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </ChatListHeader>
      <ChatRooms>
        {chatRooms &&
          filteredChatRooms.map((room) => (
            <ChatRoom
              key={room.chatRoomId}
              onClick={() => handleChatRoomClick(room.chatRoomId)}
              $active={currentChatId === `${room.chatRoomId}`}
            >
              <RoomIcon
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRoom(room);
                  setEditRoomName(room.name);
                  setEditRoomImage(room.image);
                  setIsManageModalOpen(true);
                }}
              >
                {room.image ? (
                  <img src={room.image} alt="채팅방 아이콘" />
                ) : (
                  <img
                    src="/images/icons/factory.png"
                    alt="기본 채팅방 아이콘"
                  />
                )}
              </RoomIcon>
              <RoomInfo>
                <RoomTitle>
                  {room.name}
                  {room.creatorId === localStorage.getItem('userId') && (
                    <GiQueenCrown
                      style={{ marginLeft: '4px', color: '#FFD700' }}
                    />
                  )}
                </RoomTitle>
                <LastMessage>
                  {(room.lastMessage || '새로운 채팅방입니다.').length > 25
                    ? `${(room.lastMessage || '새로운 채팅방입니다.').slice(
                        0,
                        20
                      )}...`
                    : room.lastMessage || '새로운 채팅방입니다.'}
                </LastMessage>
              </RoomInfo>
              {room.unreadCount > 0 && (
                <UnreadBadge>{room.unreadCount}</UnreadBadge>
              )}
            </ChatRoom>
          ))}
      </ChatRooms>
      {isModalOpen && (
        <Modal>
          <ModalContent>
            <ModalTitle>새 채팅방 만들기</ModalTitle>
            {currentStep === 1 ? (
              <>
                <ImageInputWrapper>
                  <ImagePreview>
                    {image ? (
                      <img
                        src={URL.createObjectURL(image)}
                        alt="채팅방 이미지 미리보기"
                      />
                    ) : (
                      <FaRegImage size={90} opacity={0.5} />
                    )}
                  </ImagePreview>
                  <ImageInput
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="createRoomImage"
                  />
                  <ImageLabel htmlFor="createRoomImage">이미지 선택</ImageLabel>
                </ImageInputWrapper>
                <Input
                  type="text"
                  placeholder="채팅방 이름을 입력하세요"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <ButtonGroup>
                  <CancelButton onClick={handleCloseModal}>취소</CancelButton>
                  <ConfirmButton onClick={handleNext}>다음</ConfirmButton>
                </ButtonGroup>
              </>
            ) : (
              <>
                <AddChatMember
                  onSubmit={handleCreateRoom}
                  onBack={handleBack}
                  selectedUsers={selectedUsers}
                  onSelectedUsersChange={handleSelectedUsers}
                />
              </>
            )}
          </ModalContent>
        </Modal>
      )}
      {/* 채팅방 관리 모달 */}
      {isManageModalOpen && (
        <Modal onClick={() => setIsManageModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>채팅방 관리</ModalTitle>
            <ImageInputWrapper>
              <ImagePreview>
                {editRoomImage ? (
                  typeof editRoomImage === 'string' ? (
                    <img src={editRoomImage} alt="채팅방 이미지" />
                  ) : (
                    <img
                      src={URL.createObjectURL(editRoomImage)}
                      alt="채팅방 이미지 미리보기"
                    />
                  )
                ) : (
                  <img src="/images/icons/factory.png" alt="기본 이미지" />
                )}
              </ImagePreview>
              <ImageInput
                type="file"
                accept="image/*"
                onChange={(e) => setEditRoomImage(e.target.files[0])}
                id="createRoomImage"
              />
              <ImageLabel htmlFor="createRoomImage">이미지 선택</ImageLabel>
            </ImageInputWrapper>
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
            <ModalText>
              채팅방을 삭제하면 채팅방 구독자들이 자동으로 채팅방에서 퇴장하게
              되며 모든 데이터가 사라집니다. 정말로 이 채팅방을
              삭제하시겠습니까?
            </ModalText>
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
  padding-top: 9px;
  padding-bottom: 5.2px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeaderTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const HeaderTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text1};
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
  background: ${({ $active, theme }) =>
    $active ? theme.colors.background2 : 'transparent'};
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
  cursor: pointer;

  label {
    width: 100%;
    height: 100%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    opacity: 0.8;
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

const LastMessage = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text2};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UnreadBadge = styled.div`
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
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  border-radius: 5px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;

  img {
    width: 16px;
    height: 16px;
    filter: brightness(0) invert(1);
  }

  &:hover {
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
  width: 90%;
  max-width: 400px;

  h3 {
    margin-bottom: 20px;
    text-align: center;
    font-weight: 600;
  }
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

const ModalText = styled.p`
  margin: 20px 0;
  color: ${({ theme }) => theme.colors.text2};
`;

const ImageInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

const ImagePreview = styled.div`
  width: 100px;
  height: 100px;
  overflow: hidden;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImageInput = styled.input`
  display: none;
`;

const ImageLabel = styled.label`
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.background2};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text1};

  &:hover {
    background: ${({ theme }) => theme.colors.background1};
  }
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

const ConfirmButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary1};
  }
`;

export default ChatRoomList;
