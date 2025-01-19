import { useState } from 'react';
import styled from 'styled-components';
// roomId를 나중에 사용할 예정이므로 주석 처리
// import { useParams } from "react-router-dom";

const ChatRoom = () => {
  // const { roomId } = useParams();  // 나중에 사용할 예정
  const [message, setMessage] = useState('');

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
        <MessageList>{/* 메시지들이 여기에 표시됩니다 */}</MessageList>

        <MessageInput>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
          />
          <SendButton>전송</SendButton>
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

export default ChatRoom;
