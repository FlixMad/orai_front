import { useState, useEffect } from 'react';
import styled from 'styled-components';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, CHAT } from '../../configs/host-config';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/userState';
import { useParams } from 'react-router-dom';

const ChatRoom = () => {
  const { chatRoomId } = useParams();
  const [message, setMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const user = useRecoilValue(userState);

  useEffect(() => {
    fetchMessages();
  }, [chatRoomId]);

  const fetchMessages = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/messageList`
      );
      if (response.status === 200) {
        setMessages(response.data);
        alert('메시지 조회 성공');
        fetchMessages();
      }
    } catch (error) {
      console.error('메시지 조회 실패:', error);
    }
  };

  // STOMP 연결 설정
  useEffect(() => {
    const sock = new SockJS(`${API_BASE_URL}/stomp`);
    const client = Stomp.over(sock);

    // 디버그 로그 비활성화 (수정된 부분)
    client.debug = () => {};

    client.connect({}, () => {
      console.log('STOMP 연결 성공');

      // 채팅방 구독
      client.subscribe(`/sub/${chatRoomId}/chat`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, newMessage]);
        console.log('새 메시지 수신:', newMessage.message);
      });
    });

    setStompClient(client);

    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, [chatRoomId]);

  // 메시지 전송 핸들러
  const handleSendMessage = () => {
    if (!message.trim()) return;

    stompClient.send(
      `/pub/${chatRoomId}/send`,
      {},
      JSON.stringify({
        chatRoomId: chatRoomId,
        content: message,
        userId: user.userId,
      })
    );
    setMessage('');
    fetchMessages();
  };

  // 메시지 수정 핸들러
  const handleEditMessage = async (messageId, newContent) => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/${messageId}/updateMessage`,
        { content: newContent }
      );
      if (response.status === 200) {
        setMessages(
          messages.map((msg) =>
            msg.messageId === messageId ? { ...msg, content: newContent } : msg
          )
        );
        setEditingMessageId(null);
      }
    } catch (error) {
      console.error('메시지 수정 실패:', error);
    }
  };

  // 메시지 삭제 핸들러
  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await axiosInstance.delete(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/${messageId}/deleteMessage`
      );
      if (response.status === 200) {
        setMessages(messages.filter((msg) => msg.messageId !== messageId));
      }
    } catch (error) {
      console.error('메시지 삭제 실패:', error);
    }
  };

  return (
    <ChatRoomContainer>
      <ChatHeader>
        <ParticipantList>
          <Participant>
            <ParticipantAvatar
              src="/images/profile/user-avatar.png"
              alt="프로필"
            />
            <ParticipantName>name</ParticipantName>
          </Participant>
          {/* 더 많은 참여자들... */}
        </ParticipantList>
      </ChatHeader>

      <ChatContent>
        <MessageList>
          {messages &&
            messages.map((msg) => (
              <MessageItem
                key={msg.messageId}
                isMine={msg.senderId === user.userId}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (msg.senderId === user.userId) {
                    setEditingMessageId(msg.messageId);
                    setEditMessage(msg.content);
                  }
                }}
              >
                {editingMessageId === msg.messageId ? (
                  <EditMessageContainer>
                    <EditInput
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                    />
                    <EditButtons>
                      <EditButton
                        onClick={() =>
                          handleEditMessage(msg.messageId, editMessage)
                        }
                      >
                        수정
                      </EditButton>
                      <DeleteButton
                        onClick={() => handleDeleteMessage(msg.messageId)}
                      >
                        삭제
                      </DeleteButton>
                      <CancelButton onClick={() => setEditingMessageId(null)}>
                        취소
                      </CancelButton>
                    </EditButtons>
                  </EditMessageContainer>
                ) : (
                  <MessageContent isMine={msg.senderId === user.userId}>
                    {msg.content}
                  </MessageContent>
                )}
              </MessageItem>
            ))}
        </MessageList>

        <MessageInput>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <SendButton onClick={handleSendMessage}>전송</SendButton>
        </MessageInput>
      </ChatContent>
    </ChatRoomContainer>
  );
};

const ChatRoomContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
`;

const ChatHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: white;
`;

const ParticipantList = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }
`;

const Participant = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const ParticipantAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background2};
`;

const ParticipantName = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text2};
`;

const ChatContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 24px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }
`;

const MessageInput = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  bottom: 0;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SendButton = styled.button`
  padding: 0 24px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 8px;
  font-weight: 500;
`;

const MessageItem = styled.div`
  display: flex;
  justify-content: ${({ isMine }) => (isMine ? 'flex-end' : 'flex-start')};
  margin-bottom: 16px;
`;

const MessageContent = styled.div`
  background: ${({ isMine, theme }) =>
    isMine ? theme.colors.primary : theme.colors.background2};
  color: ${({ isMine }) => (isMine ? 'white' : 'inherit')};
  padding: 8px 16px;
  border-radius: 16px;
  max-width: 70%;
  word-break: break-word;
`;

const EditMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 70%;
`;

const EditInput = styled.input`
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  outline: none;
`;

const EditButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const EditButton = styled.button`
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 4px;
  font-size: 12px;
`;

const DeleteButton = styled(EditButton)`
  background: ${({ theme }) => theme.colors.error};
`;

const CancelButton = styled(EditButton)`
  background: ${({ theme }) => theme.colors.background2};
  color: ${({ theme }) => theme.colors.text};
`;

export default ChatRoom;
