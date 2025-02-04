import styled from 'styled-components';
import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, CHAT } from '../../configs/host-config';
import PropTypes from 'prop-types';
import { GiQueenCrown } from 'react-icons/gi';

const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 24px;
  padding: 15px;

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
  justify-content: ${({ $isMine, $isSystem }) =>
    $isSystem ? 'center' : $isMine ? 'flex-end' : 'flex-start'};
  margin-bottom: ${({ $isFirstMessage }) => ($isFirstMessage ? '16px' : '4px')};
  align-items: flex-start;
  padding-left: ${({ $isMine, $isSystem, $isDeleted }) =>
    $isMine || $isSystem || $isDeleted ? '44px' : '0'};
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isMine, $isSystem, $isDeleted }) =>
    $isSystem || $isDeleted ? 'center' : $isMine ? 'flex-end' : 'flex-start'};
  gap: 4px;
  margin-left: ${({ $isMine, $isSystem, $isDeleted }) =>
    !$isMine && !$isSystem && !$isDeleted ? '8px' : '0'};
`;

const MessageContent = styled.div`
  background: ${({ $isMine, $isSystem, $isDeleted, theme }) =>
    $isDeleted
      ? theme.colors.background2
      : $isSystem
      ? theme.colors.background0
      : $isMine
      ? theme.colors.primary
      : theme.colors.background2};
  color: ${({ $isMine, $isSystem, $isDeleted, theme }) =>
    $isDeleted
      ? theme.colors.text3
      : $isSystem
      ? theme.colors.text2
      : $isMine
      ? 'white'
      : theme.colors.text1};
  text-align: ${({ $isSystem, $isDeleted }) =>
    $isSystem || $isDeleted ? 'center' : 'left'};
  padding: 8px 16px;
  border-radius: 16px;
  max-width: ${({ $isSystem }) => ($isSystem ? '100%' : '260px')};
  min-width: fit-content;
  min-height: ${({ $isSystem }) => ($isSystem ? 'auto' : '40px')};
  word-break: break-word;
  position: relative;
  cursor: ${({ $isDeleted }) => ($isDeleted ? 'default' : 'pointer')};
  font-style: ${({ $isDeleted }) => ($isDeleted ? 'italic' : 'normal')};
  margin: ${({ $isSystem }) => ($isSystem ? '8px auto' : '0')};
`;

const MessageTime = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text3};
  margin: 0 4px;
`;

const SenderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const SenderName = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text2};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SenderImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const EmptySpace = styled.div`
  width: 36px;
  flex-shrink: 0;
`;

const EditButtons = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 4px;

  button {
    padding: 4px 8px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    background: ${({ theme }) => theme.colors.primary};
    color: white;

    &:last-child {
      background: ${({ theme }) => theme.colors.background2};
      color: ${({ theme }) => theme.colors.text1};
    }
  }
`;

const ContextMenu = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 4px;
  justify-content: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};

  button {
    padding: 4px 8px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;

    &:first-child {
      background: ${({ theme }) => theme.colors.primary};
      color: white;

      &:hover {
        background: ${({ theme }) => theme.colors.primaryDark || '#0056b3'};
      }
    }

    &:last-child {
      background: ${({ theme }) => theme.colors.background2};
      color: ${({ theme }) => theme.colors.text1};

      &:hover {
        background: ${({ theme }) => theme.colors.danger || '#dc3545'};
        color: white;
      }
    }
  }
`;

const EditInput = styled.input`
  width: 100%;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
`;

const EditedMark = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text3};
  margin-left: 4px;
`;

const MessageList = ({ messages, setMessages, formatDate, chatRoomId }) => {
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const currentUserId = localStorage.getItem('userId');
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 컴포넌트가 마운트될 때(채팅방 입장 시) 마지막 메시지 읽음 처리
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.messageId) {
        axiosInstance
          .post(`${API_BASE_URL}${CHAT}/rooms/${chatRoomId}/read`, {
            messageId: lastMessage.messageId,
          })
          .catch((error) => {
            console.error('메시지 읽음 처리 실패:', error);
          });
      }
    }
  }, [chatRoomId]); // chatRoomId가 변경될 때만 실행

  useEffect(() => {
    // 메시지 목록이 업데이트될 때마다 마지막 메시지 읽음 처리
    if (messages.length > 0 && document.hasFocus()) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.messageId) {
        axiosInstance
          .post(`${API_BASE_URL}${CHAT}/rooms/${chatRoomId}/read`, {
            messageId: lastMessage.messageId,
          })
          .catch((error) => {
            console.error('메시지 읽음 처리 실패:', error);
          });
      }
    }
  }, [messages, chatRoomId]);

  const handleMessageClick = (e, message) => {
    e.preventDefault();
    if (message.senderId === currentUserId) {
      setSelectedMessageId(
        selectedMessageId === message.messageId ? null : message.messageId
      );
    }
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setEditContent(message.content);
    setSelectedMessageId(null);
  };

  const handleSaveEdit = async () => {
    try {
      await axiosInstance.put(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/${editingMessage.messageId}/updateMessage`,
        { content: editContent }
      );
      setEditingMessage(null);
      setEditContent('');
    } catch (error) {
      console.error('메시지 수정 실패:', error);
      alert('메시지 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    try {
      const confirmed = window.confirm('정말 이 메시지를 삭제하시겠습니까?');
      if (!confirmed) {
        setSelectedMessageId(null);
        return;
      }

      await axiosInstance.delete(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/${selectedMessageId}/deleteMessage`
      );
      setSelectedMessageId(null);
    } catch (error) {
      console.error('메시지 삭제 실패:', error);
      alert('메시지 삭제에 실패했습니다.');
    }
  };

  return (
    <MessageListContainer ref={containerRef}>
      {messages.map((message, index) => {
        const isMine = message.senderId === currentUserId;
        const isSystem = message.type === 'SYSTEM';
        const isDeleted = message.type === 'DELETE';

        const previousMessage = index > 0 ? messages[index - 1] : null;
        const isFirstMessage =
          !previousMessage ||
          previousMessage.senderId !== message.senderId ||
          isSystem ||
          previousMessage.type === 'SYSTEM' ||
          isDeleted ||
          previousMessage.type === 'DELETE' ||
          new Date(message.createdAt) - new Date(previousMessage.createdAt) >
            5 * 60 * 1000;

        return (
          <MessageItem
            key={`${message.messageId}-${
              message.updatedAt || message.createdAt
            }`}
            $isMine={isMine}
            $isSystem={isSystem}
            $isDeleted={isDeleted}
            $isFirstMessage={isFirstMessage}
          >
            {!isMine && !isSystem && !isDeleted ? (
              isFirstMessage ? (
                <SenderImage
                  src={message.senderImage || '/default-profile.png'}
                  alt={message.senderName}
                  onError={(e) => {
                    e.target.src = '/default-profile.png';
                  }}
                />
              ) : (
                <EmptySpace />
              )
            ) : null}
            <MessageWrapper
              $isMine={isMine}
              $isSystem={isSystem}
              $isDeleted={isDeleted}
            >
              {!isMine && !isSystem && !isDeleted && isFirstMessage && (
                <SenderName>
                  {message.senderId === message.creatorId && (
                    <GiQueenCrown style={{ color: '#FFD700' }} />
                  )}
                  {message.senderName || '알 수 없음'}
                </SenderName>
              )}
              <MessageContent
                $isMine={isMine}
                $isSystem={isSystem}
                $isDeleted={isDeleted}
                onClick={(e) =>
                  !isSystem && !isDeleted && handleMessageClick(e, message)
                }
                style={{
                  cursor: isMine && !isDeleted ? 'pointer' : 'default',
                }}
              >
                {editingMessage?.messageId === message.messageId ? (
                  <div>
                    <EditInput
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                    />
                    <EditButtons>
                      <button onClick={handleSaveEdit}>저장</button>
                      <button onClick={() => setEditingMessage(null)}>
                        취소
                      </button>
                    </EditButtons>
                  </div>
                ) : (
                  <>
                    {message.content}
                    {message.type === 'EDIT' && !isDeleted && (
                      <EditedMark>(수정됨)</EditedMark>
                    )}
                  </>
                )}
              </MessageContent>
              {selectedMessageId === message.messageId &&
                isMine &&
                !isDeleted && (
                  <ContextMenu $isMine={isMine}>
                    <button onClick={() => handleEdit(message)}>수정</button>
                    <button onClick={handleDelete}>삭제</button>
                  </ContextMenu>
                )}
              {!isSystem && !isDeleted && (
                <MessageTime>{formatDate(message.createdAt)}</MessageTime>
              )}
            </MessageWrapper>
          </MessageItem>
        );
      })}
    </MessageListContainer>
  );
};

MessageList.propTypes = {
  messages: PropTypes.array.isRequired,
  setMessages: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  chatRoomId: PropTypes.string.isRequired,
};

export default MessageList;
