import React, { useEffect, useState, useCallback, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axiosInstance from "../../configs/axios-config";
import { API_BASE_URL, CHAT } from "../../configs/host-config";
import styled from "styled-components";
import ParticipantsList from "../../components/chat/ParticipantsList";
import MessageList from "../../components/chat/MessageList";
import { useParams, useNavigate } from "react-router-dom";
import AddChatMember from "./AddChatMember";

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
  justify-content: space-between;
`;

const ChatRoomInfoLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ExitButton = styled(InviteButton)`
  background: ${({ theme }) => theme.colors.danger || "#dc3545"};

  &:hover {
    background: ${({ theme }) => theme.colors.dangerDark || "#bd2130"};
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

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.text2};
`;

const ChatRoom = () => {
  const { chatRoomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatRoomInfo, setChatRoomInfo] = useState({ name: "", imageUrl: "" });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();
  const [currentUserId] = useState(localStorage.getItem("userId"));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("현재 채팅방 ID:", chatRoomId);
  }, [chatRoomId]);

  useEffect(() => {
    // chatRoomId가 변경될 때 메시지 상태 초기화
    setMessages([]);
  }, [chatRoomId]);

  const handleNewMessage = useCallback((receivedMessage) => {
    setMessages((prevMessages) => {
      if (
        prevMessages.some((msg) => msg.messageId === receivedMessage.messageId)
      ) {
        if (
          receivedMessage.type === "EDIT" ||
          receivedMessage.type === "DELETE"
        ) {
          return prevMessages.map((msg) =>
            msg.messageId === receivedMessage.messageId
              ? {
                  ...receivedMessage,
                  createdAt: new Date(receivedMessage.createdAt),
                }
              : msg
          );
        }
        return prevMessages;
      }

      if (receivedMessage.type === "ERROR") {
        return prevMessages;
      }

      return [
        ...prevMessages,
        {
          ...receivedMessage,
          createdAt: new Date(receivedMessage.createdAt),
        },
      ];
    });
  }, []);

  // 초기 메시지 로드 수정
  const loadInitialMessages = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/messageList`
      );

      if (response.data.length > 0) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("초기 메시지 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${API_BASE_URL}/stomp`, null, {
          transports: ["websocket"],
          secure: true,
        }),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
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
      client.subscribe(`/sub/${chatRoomId}/chat`, (message) => {
        try {
          const receivedMessage = JSON.parse(message.body);
          // 시스템 메시지이고 채팅방 수정 메시지일 경우
          if (
            receivedMessage.type === 'SYSTEM' &&
            receivedMessage.content === '채팅방 정보가 수정되었습니다.'
          ) {
            // 채팅방 정보 새로 조회
            fetchChatRoomInfo();
          }
          if (receivedMessage.type === 'ERROR') return;

          // 메시지를 받았을 때 읽음 처리
          if (document.hasFocus()) {
            markMessageAsRead(receivedMessage.messageId);
          }

          handleNewMessage(receivedMessage);
        } catch (error) {
          console.error("메시지 처리 실패:", error);
        }
      });

      client.subscribe(`/queue/queue`, (notification) => {
        const data = JSON.parse(notification.body);
        if (data.chatRoomId === chatRoomId) {
          navigate("/chat");
        }
      });
    };

    const fetchChatRoomInfo = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${CHAT}/${chatRoomId}/chatRoom`
        );
        if (response && response.data) {
          setChatRoomInfo({
            ...response.data,
            image: response.data.image,
            name: response.data.name,
          });
        }
      } catch (error) {
        console.error('채팅방 정보를 불러오는데 실패했습니다:', error);
      }
    };

    client.activate();

    // 채팅방 입장 시 초기 데이터 로드
    const loadInitialData = async () => {
      try {
        await fetchParticipants();
        await loadInitialMessages();

        // 채팅방 입장 시 마지막 메시지 읽음 처리 추가
        const response = await axiosInstance.get(
          `${API_BASE_URL}${CHAT}/${chatRoomId}/messageList`
        );

        if (response.data.length > 0) {
          const lastMessage = response.data[response.data.length - 1];
          await axiosInstance.post(
            `${API_BASE_URL}${CHAT}/rooms/${chatRoomId}/read`,
            { messageId: lastMessage.messageId }
          );
        }
      } catch (error) {
        console.error("초기 데이터 로드 실패:", error);
      }
    };

    loadInitialData();

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
          setChatRoomInfo({
            ...response.data,
            image: response.data.image, // 이미지 URL 업데이트
            name: response.data.name, // 이름 업데이트
          });
        }
      } catch (error) {
        console.error("채팅방 정보를 불러오는데 실패했습니다:", error);
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
      console.error("참가자 목록을 불러오는데 실패했습니다:", error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = useCallback(async () => {
    if (!messageContent.trim()) return;

    try {
      if (stompClient && stompClient.connected) {
        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("userName");

        stompClient.publish({
          destination: `/pub/${chatRoomId}/send`,
          headers: {
            userId: userId,
            userName: userName,
          },
          body: messageContent,
        });

        setMessageContent("");
      }
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      alert("메시지 전송에 실패했습니다.");
    }
  }, [messageContent, stompClient, chatRoomId]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSelectedUsers = (users) => {
    setSelectedUsers(users);
  };

  const handleInvite = async (selectedUserIds) => {
    try {
      if (selectedUserIds.length === 0) {
        alert("초대할 멤버를 선택해주세요.");
        return;
      }

      const formData = new FormData();
      formData.append("inviteeIds", selectedUserIds);

      const response = await axiosInstance.post(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/invite`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        alert("멤버 초대가 완료되었습니다.");
        setShowInviteModal(false);
        setSelectedUsers([]);
        fetchParticipants(); // 참가자 목록 새로고침
      }
    } catch (error) {
      console.error("멤버 초대 중 오류 발생:", error);
      alert("멤버 초대에 실패했습니다.");
    }
  };

  const handleExitChatRoom = async () => {
    if (window.confirm("정말로 채팅방을 나가시겠습니까?")) {
      try {
        const response = await axiosInstance.delete(
          `${API_BASE_URL}${CHAT}/${chatRoomId}/disconnect`
        );

        if (response.status === 204) {
          alert("채팅방을 나갔습니다.");
          navigate("/chat"); // 채팅방 목록으로 이동
        }
      } catch (error) {
        console.error("채팅방 나가기 실패:", error);
        if (error?.response?.status === 500) {
          alert("방장은 채팅방을 나갈 수 없습니다.");
        } else if (error?.response?.status === 404) {
          alert("존재하지 않는 채팅방입니다.");
        } else {
          alert("방장은 채팅방을 나갈 수 없습니다.");
          navigate(`/chat/${chatRoomId}`);
        }
      }
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await axiosInstance.delete(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/${userId}/deleteUser`
      );

      if (userId === chatRoomInfo.creatorId) {
        alert('방장은 내보낼 수 없습니다.');
        return;
      }

      // 참가자 목록 새로고침
      fetchParticipants();
    } catch (error) {
      console.error("사용자 내보내기 실패:", error);
      if (error.response?.status === 403) {
        alert('방장만 사용자를 내보낼 수 있습니다.');
      } else {
        alert("사용자를 내보내는데 실패했습니다.");
      }
    }
  };

  // 메시지 읽음 처리 함수
  const markMessageAsRead = async (messageId) => {
    try {
      await axiosInstance.post(
        `${API_BASE_URL}${CHAT}/rooms/${chatRoomId}/read`,
        { messageId }
      );
    } catch (error) {
      console.error("메시지 읽음 처리 실패:", error);
    }
  };

  // 창이 포커스를 받았을 때 마지막 메시지 읽음 처리
  useEffect(() => {
    const handleFocus = () => {
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        markMessageAsRead(lastMessage.messageId);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [messages, chatRoomId]);

  return (
    <ChatRoomContainer>
      <ChatHeader>
        <ChatRoomInfo>
          <ChatRoomInfoLeft>
            <ChatRoomImage
              src={chatRoomInfo.image || "/default-chat-room.png"}
              alt={chatRoomInfo.name}
            />
            <ChatRoomName>{chatRoomInfo.name}</ChatRoomName>
            <ParticipantsCount
              onClick={() => setShowParticipants(!showParticipants)}
            >
              ({participants.length})
            </ParticipantsCount>
            {showParticipants && (
              <ParticipantsList
                participants={participants}
                chatRoomId={chatRoomId}
                isCreator={currentUserId === chatRoomInfo.creatorId}
                onRemoveUser={handleRemoveUser}
                onClose={() => setShowParticipants(false)}
              />
            )}
          </ChatRoomInfoLeft>
          <ButtonGroup>
            <InviteButton onClick={() => setShowInviteModal(true)}>
              멤버초대
            </InviteButton>
            <ExitButton onClick={handleExitChatRoom}>채팅방 나가기</ExitButton>
          </ButtonGroup>
        </ChatRoomInfo>
      </ChatHeader>
      <ChatContent>
        {isLoading && (
          <LoadingIndicator>메시지를 불러오는 중...</LoadingIndicator>
        )}
        <MessageList
          messages={messages}
          setMessages={setMessages}
          formatDate={formatDate}
          chatRoomId={chatRoomId}
        />
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
              currentParticipants={participants}
            />
          </ModalContent>
        </Modal>
      )}
    </ChatRoomContainer>
  );
};

export default ChatRoom;
