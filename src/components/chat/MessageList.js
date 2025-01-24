import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useState, forwardRef } from 'react';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, CHAT } from '../../configs/host-config';
import PropTypes from 'prop-types';

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
  margin-bottom: 16px;
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isMine, $isSystem }) =>
    $isSystem ? 'center' : $isMine ? 'flex-end' : 'flex-start'};
  gap: 4px;
`;

const MessageContent = styled.div`
  background: ${({ $isMine, $isSystem, $isDeleted, theme }) =>
    $isDeleted
      ? theme.colors.background2
      : $isSystem
      ? theme.colors.background2
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

const SenderName = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text2};
  margin-bottom: 4px;
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
  const messagesEndRef = useRef(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const currentUserId = localStorage.getItem('userId');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    <MessageListContainer>
      {messages.map((message) => {
        const isMine = message.senderId === currentUserId;
        const isSystem = message.type === 'SYSTEM';
        const isDeleted = message.type === 'DELETE';
        const isEdited = message.type === 'EDIT';
        const userMessages = messages.filter(
          (msg) => msg.senderId === currentUserId && msg.type === 'CHAT'
        );
        const lastUserMessageId =
          userMessages[userMessages.length - 1]?.messageId;
        const isLastMessage = message.messageId === lastUserMessageId;

        return (
          <MessageItem
            key={`${message.messageId}-${
              message.updatedAt || message.createdAt
            }`}
            $isMine={isMine}
            $isSystem={isSystem}
          >
            <MessageWrapper $isMine={isMine} $isSystem={isSystem}>
              {!isMine && !isSystem && !isDeleted && (
                <SenderName>{message.senderName || '알 수 없음'}</SenderName>
              )}
              <MessageContent
                $isMine={isMine}
                $isSystem={isSystem}
                $isDeleted={isDeleted}
                onClick={(e) =>
                  !isSystem && !isDeleted && handleMessageClick(e, message)
                }
                style={{
                  cursor:
                    isMine && isLastMessage && !isDeleted
                      ? 'pointer'
                      : 'default',
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
                    {isEdited && !isDeleted && (
                      <EditedMark>(수정됨)</EditedMark>
                    )}
                  </>
                )}
              </MessageContent>
              {selectedMessageId === message.messageId &&
                isMine &&
                isLastMessage &&
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
      <div ref={messagesEndRef} />
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
