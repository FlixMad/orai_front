import { useState, useEffect } from 'react';
import styled from 'styled-components';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, CHAT } from '../../configs/host-config';
import AddChatMember from './AddChatMember';
import { Client } from '@stomp/stompjs';
import { useRecoilValue } from 'recoil';
import { userState } from '../../atoms/userState';

const CreateChatRoom = ({ onChatRoomCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: 기본 정보, 2: 멤버 선택
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const currentUser = useRecoilValue(userState);

  useEffect(() => {
    const client = new Client({
      brokerURL: `${API_BASE_URL}/stomp`,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`,
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setStompClient(client);
    };

    client.activate();

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [currentUser.id]);

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
        window.location.href = `/chat/${chatRoomId}`;
      }
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      alert('채팅방 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Container>
      <EmptyStateImage src="/images/icons/chat-plus.png" alt="새 채팅방" />
      <Title>새로운 채팅방 만들기</Title>
      <Description>
        새로운 채팅방을 만들어 팀원들과 대화를 시작해보세요.
      </Description>
      <CreateButton onClick={() => setIsModalOpen(true)}>
        <img src="/images/icons/plus-circle.png" alt="생성" />
        채팅방 만들기
      </CreateButton>

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
                      <img src="/images/icons/factory.png" alt="기본 이미지" />
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
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: white;
`;

const EmptyStateImage = styled.img`
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  opacity: 0.7;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text1};
  margin-bottom: 12px;
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text2};
  margin-bottom: 32px;
  text-align: center;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;

  img {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.secondary1};
    transform: translateY(-1px);
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
  margin-bottom: 15px;
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

const ImageInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

const ImagePreview = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
  border: 2px solid ${({ theme }) => theme.colors.border};

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

export default CreateChatRoom;
