import styled from 'styled-components';

const MessageListContainer = styled.div`
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

const MessageItem = styled.div`
  display: flex;
  justify-content: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  margin-bottom: 16px;
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  gap: 4px;
`;

const MessageContent = styled.div`
  background: ${({ $isMine, theme }) =>
    $isMine ? theme.colors.primary : theme.colors.background2};
  color: ${({ $isMine }) => ($isMine ? 'white' : 'inherit')};
  padding: 8px 16px;
  border-radius: 16px;
  max-width: 70%;
  word-break: break-word;
`;

const MessageTime = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text3};
  margin: 0 4px;
`;

const SenderName = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text2};
  margin-bottom: 4px;
`;

const MessageList = ({ messages, formatDate }) => {
  const currentUserId = localStorage.getItem('userId');

  const formatMessageDate = (date) => {
    // date가 문자열인 경우에만 변환
    if (typeof date === 'string') {
      return formatDate(new Date(date.replace(' ', 'T')));
    }
    // 이미 Date 객체인 경우 바로 사용
    return formatDate(date);
  };

  return (
    <MessageListContainer>
      {messages.map((message) => {
        const isMine = message.senderId === currentUserId;

        return (
          <MessageItem key={message.messageId} $isMine={isMine}>
            <MessageWrapper $isMine={isMine}>
              {!isMine && <SenderName>{message.senderId}</SenderName>}
              <MessageContent $isMine={isMine}>
                {message.content}
              </MessageContent>
              <MessageTime>{formatMessageDate(message.createdAt)}</MessageTime>
            </MessageWrapper>
          </MessageItem>
        );
      })}
    </MessageListContainer>
  );
};

export default MessageList;
