import styled from 'styled-components';
import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, CHAT } from '../../configs/host-config';
import PropTypes from 'prop-types';
import _ from 'lodash';

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
  max-width: 70%;
  word-break: break-word;
  position: relative;
  cursor: ${({ $isDeleted }) => ($isDeleted ? 'default' : 'pointer')};
  font-style: ${({ $isDeleted }) => ($isDeleted ? 'italic' : 'normal')};
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

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 10px;
  color: ${({ theme }) => theme.colors.text2};
`;

const MessageList = ({
  messages,
  setMessages,
  formatDate,
  chatRoomId,
  stompClient,
}) => {
  const currentUserId = localStorage.getItem('userId');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  useEffect(() => {
    // 채팅방이 변경될 때 상태 초기화
    setMessages([]);
    setPage(1);
    setHasMore(true);
    setIsInitialLoad(true);
  }, [chatRoomId]);

  // 메시지가 변경될 때마다 스크롤 위치 조정
  useEffect(() => {
    if (!containerRef.current) return;

    // 초기 로드 시 또는 본인이 보낸 메시지일 경우 항상 맨 아래로 스크롤
    if (
      isInitialLoad ||
      messages[messages.length - 1]?.senderId === currentUserId
    ) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setIsInitialLoad(false);
    }
  }, [messages, isInitialLoad, currentUserId]);

  const loadMoreMessages = useCallback(async () => {
    if (loading || !hasMore || page < 0) return;

    try {
      setLoading(true);
      setPrevScrollHeight(containerRef.current?.scrollHeight || 0);

      const response = await axiosInstance.get(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/messageList`,
        {
          params: {
            page: page,
            size: 30,
          },
        }
      );

      if (response?.data) {
        // 데이터가 비어있으면 더 이상 로드할 메시지가 없음
        if (response.data.length === 0) {
          setHasMore(false);
          return;
        }

        setPage((prev) => prev + 1);

        // 메시지 추가 로직 개선
        setMessages((prevMessages) => {
          const newMessages = response.data.filter(
            (newMsg) =>
              !prevMessages.some((msg) => msg.messageId === newMsg.messageId)
          );
          // 백엔드에서 이미 createdAt 기준 오름차순 정렬되어 오므로
          // 새 메시지를 뒤쪽에 추가
          return [...prevMessages, ...newMessages];
        });
      }
    } catch (error) {
      console.error('메시지 로딩 실패:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, chatRoomId]);

  // 스크롤 이벤트 핸들러 개선
  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || !hasMore) return;

    const { scrollTop } = containerRef.current;

    // 스크롤이 하단에 가까워졌을 때 다음 페이지 로드
    if (scrollTop < 100) {
      loadMoreMessages();
    }
  }, [loadMoreMessages, loading, hasMore]);

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const throttledScroll = _.throttle(handleScroll, 200);
      container.addEventListener('scroll', throttledScroll);
      return () => {
        container.removeEventListener('scroll', throttledScroll);
        throttledScroll.cancel();
      };
    }
  }, [handleScroll]);

  const formatMessageDate = (date) => {
    // date가 문자열인 경우에만 변환
    if (typeof date === 'string') {
      return formatDate(new Date(date.replace(' ', 'T')));
    }
    // 이미 Date 객체인 경우 바로 사용
    return formatDate(date);
  };

  const handleMessageClick = (e, message) => {
    // 현재 사용자의 메시지들만 필터링
    const userMessages = messages.filter(
      (msg) => msg.senderId === currentUserId
    );

    // 사용자의 마지막 메시지의 ID를 가져옴
    const lastUserMessageId = userMessages[userMessages.length - 1]?.messageId;

    // 클릭한 메시지가 현재 사용자의 마지막 메시지인 경우에만 수정/삭제 메뉴 표시
    if (
      message.senderId === currentUserId &&
      message.messageId === lastUserMessageId
    ) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedMessageId(message.messageId);
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

      // 메시지 수정 후 즉시 상태 업데이트
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.messageId === editingMessage.messageId
            ? { ...msg, content: editContent }
            : msg
        )
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

      // 메시지 삭제 후 즉시 상태 업데이트
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.messageId === selectedMessageId
            ? { ...msg, content: '메시지가 삭제되었습니다.', type: 'DELETE' }
            : msg
        )
      );

      setSelectedMessageId(null);
    } catch (error) {
      console.error('메시지 삭제 실패:', error);
      alert('메시지 삭제에 실패했습니다.');
    }
  };

  // ChatRoom 컴포넌트에서 메시지 전송 후 즉시 상태 업데이트를 위한 함수
  const handleNewMessage = useCallback((message) => {
    setMessages((prevMessages) => {
      // 중복 메시지 체크
      if (prevMessages.some((msg) => msg.messageId === message.messageId)) {
        return prevMessages;
      }
      return [
        ...prevMessages,
        {
          ...message,
          createdAt: new Date(message.createdAt),
        },
      ];
    });
  }, []);

  // 클릭 이벤트 리스너 추가
  useEffect(() => {
    const handleClickOutside = () => setSelectedMessageId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  console.log('받은 메시지:', messages);

  return (
    <MessageListContainer ref={containerRef}>
      {loading && <LoadingIndicator>로딩 중...</LoadingIndicator>}
      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          메시지가 없습니다.
        </div>
      ) : null}
      {messages.map((message) => {
        const isMine = message.senderId === currentUserId;
        const isSystem = message.type === 'SYSTEM';
        const isDeleted = message.type === 'DELETE';
        const userMessages = messages.filter(
          (msg) => msg.senderId === currentUserId
        );
        const lastUserMessageId =
          userMessages[userMessages.length - 1]?.messageId;
        const isLastMessage = message.messageId === lastUserMessageId;

        return (
          <MessageItem
            key={`${message.messageId}-${message.createdAt}`}
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
                ) : isDeleted ? (
                  '메시지가 삭제되었습니다.'
                ) : (
                  message.content
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
                <MessageTime>
                  {formatMessageDate(message.createdAt)}
                </MessageTime>
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
  stompClient: PropTypes.object,
};

export default MessageList;
