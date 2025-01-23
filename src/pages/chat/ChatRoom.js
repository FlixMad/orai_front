import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, CHAT } from '../../configs/host-config';
import styled from 'styled-components';
import ParticipantsList from '../../components/chat/ParticipantsList';
import MessageList from '../../components/chat/MessageList';
import { useParams } from 'react-router-dom';
import AddChatMember from './AddChatMember';

const ChatRoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ChatRoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  position: relative;
`;

const ChatRoomImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const ChatRoomName = styled.h2`
  margin: 0;
  font-size: 1.1rem;
`;

const ParticipantsCount = styled.span`
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const ChatContent = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
`;

const MessageInput = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SendButton = styled.button`
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const InviteButton = styled.button`
  padding: 8px 16px;
  margin-bottom: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 100%;
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 16px;
`;

const ChatRoom = () => {
  const { chatRoomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatRoomInfo, setChatRoomInfo] = useState({ name: '', imageUrl: '' });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    console.log('현재 채팅방 ID:', chatRoomId);
  }, [chatRoomId]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/stomp`),
      connectHeaders: {},
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setStompClient(client);

      // 채팅방 메시지 구독
      client.subscribe(`/sub/${chatRoomId}/chat`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prev) => [
          ...prev,
          {
            ...newMessage,
            createdAt: new Date(newMessage.createdAt),
          },
        ]);
      });
    };

    client.activate();

    // 초기 데이터 로드
    fetchParticipants();
    fetchMessages();

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [chatRoomId]);

  useEffect(() => {
    // 채팅방 정보 가져오기
    const fetchChatRoomInfo = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${CHAT}/${chatRoomId}/chatRoom`
        );
        if (response && response.data) {
          setChatRoomInfo(response.data);
        }
      } catch (error) {
        console.error('채팅방 정보를 불러오는데 실패했습니다:', error);
      }
    };

    fetchChatRoomInfo();
  }, [chatRoomId]);

  const fetchParticipants = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/users`
      );
      if (response && response.data) {
        setParticipants(response.data);
      }
    } catch (error) {
      console.error('참가자 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/messageList`
      );
      if (response && response.data) {
        const formattedMessages = response.data.map((message) => {
          const sender = participants.find(
            (p) => p.userId === message.senderId
          );
          return {
            ...message,
            senderName: sender?.name || '알 수 없음',
            createdAt: new Date(message.createdAt.replace(' ', 'T')),
          };
        });
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('메시지 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSendMessage = () => {
    if (!messageContent.trim() || !stompClient) return;

    // 웹소켓을 통한 메시지 브로드캐스트
    stompClient.publish({
      destination: `/pub/${chatRoomId}/send`,
      body: messageContent,
    });

    // REST API를 통한 메시지 저장
    axiosInstance
      .post(`${API_BASE_URL}${CHAT}/${chatRoomId}/saveMessage`, {
        content: messageContent,
      })
      .catch((error) => {
        console.error('메시지 저장 중 오류가 발생했습니다:', error);
      });

    setMessageContent('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showParticipants && !event.target.closest('.participants-trigger')) {
        setShowParticipants(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showParticipants]);

  const handleSelectedUsers = (users) => {
    setSelectedUsers(users);
  };

  const handleInvite = async (selectedUserIds) => {
    try {
      if (selectedUserIds.length === 0) {
        alert('초대할 멤버를 선택해주세요.');
        return;
      }

      const formData = new FormData();
      formData.append('inviteeIds', selectedUserIds);

      const response = await axiosInstance.post(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/invite`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        alert('멤버 초대가 완료되었습니다.');
        setShowInviteModal(false);
        setSelectedUsers([]);
        fetchParticipants(); // 참가자 목록 새로고침
      }
    } catch (error) {
      console.error('멤버 초대 중 오류 발생:', error);
      alert('멤버 초대에 실패했습니다.');
    }
  };

  return (
    <ChatRoomContainer>
      <ChatHeader>
        <ChatRoomInfo>
          <ChatRoomImage
            src={chatRoomInfo.image || '/default-chat-room.png'}
            alt={chatRoomInfo.name}
          />
          <ChatRoomName>{chatRoomInfo.name}</ChatRoomName>
          <ParticipantsCount
            className="participants-trigger"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            ({participants.length})
          </ParticipantsCount>
          <InviteButton onClick={() => setShowInviteModal(true)}>
            멤버초대
          </InviteButton>
          {showParticipants && <ParticipantsList participants={participants} />}
        </ChatRoomInfo>
      </ChatHeader>
      <ChatContent>
        <MessageList messages={messages} formatDate={formatDate} />
      </ChatContent>
      <MessageInput>
        <Input
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
        />
        <SendButton onClick={handleSendMessage}>전송</SendButton>
      </MessageInput>

      {showInviteModal && (
        <Modal>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>멤버 초대하기</ModalTitle>
            <AddChatMember
              onSubmit={handleInvite}
              onBack={() => {
                setShowInviteModal(false);
                setSelectedUsers([]);
              }}
              selectedUsers={selectedUsers}
              onSelectedUsersChange={handleSelectedUsers}
            />
          </ModalContent>
        </Modal>
      )}
    </ChatRoomContainer>
  );
};

export default ChatRoom;
