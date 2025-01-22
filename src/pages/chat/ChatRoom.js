import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, CHAT } from '../../configs/host-config';
import styled from 'styled-components';
import ParticipantsList from '../../components/chat/ParticipantsList';
import MessageList from '../../components/chat/MessageList';
import { useParams } from 'react-router-dom';

const ChatRoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
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

const ChatRoom = () => {
  const { chatRoomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const messageListRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

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

    stompClient.publish({
      destination: `/pub/${chatRoomId}/send`,
      body: messageContent,
    });

    setMessageContent('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <ChatRoomContainer>
      <ChatHeader>
        <ParticipantsList participants={participants} />
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
    </ChatRoomContainer>
  );
};

export default ChatRoom;
