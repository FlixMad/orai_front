import { useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";

const ChatList = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const currentChatId = location.pathname.split("/")[2];

  return (
    <ChatListContainer className={className}>
      <ChatListHeader>
        <HeaderTitle>채팅방</HeaderTitle>
        <SearchBar>
          <img src="/images/icons/search.png" alt="검색" />
          <input
            type="text"
            placeholder="채팅방 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </ChatListHeader>

      <ChatRooms>
        <ChatRoom
          onClick={() => navigate("/chat/1")}
          active={currentChatId === "1"}
        >
          <RoomIcon>
            <img src="/images/icons/factory.png" alt="채팅방 아이콘" />
          </RoomIcon>
          <RoomInfo>
            <RoomTitle>CHARLIE'S FACTORY</RoomTitle>
            <LastMessage>다음 회의는 2시에 하겠습니다.</LastMessage>
          </RoomInfo>
          <UnreadBadge>2</UnreadBadge>
        </ChatRoom>
        <ChatRoom
          onClick={() => navigate("/chat/2")}
          active={currentChatId === "2"}
        >
          <RoomIcon>
            <img src="/images/icons/cloud.png" alt="채팅방 아이콘" />
          </RoomIcon>
          <RoomInfo>
            <RoomTitle>ORAI</RoomTitle>
            <LastMessage>새로운 기능이 추가되었습니다.</LastMessage>
          </RoomInfo>
        </ChatRoom>
      </ChatRooms>
      <NewChatButton onClick={() => navigate("/chat/new")}>
        <img src="/images/icons/plus-circle.png" alt="새 채팅방" />
      </NewChatButton>
    </ChatListContainer>
  );
};

const ChatListContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  position: relative;
`;

const ChatListHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeaderTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text1};
  margin-bottom: 16px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.colors.background2};
  border-radius: 8px;
  transition: all 0.2s ease;

  img {
    width: 16px;
    height: 16px;
    opacity: 0.5;
  }

  input {
    border: none;
    background: none;
    outline: none;
    width: 100%;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text1};

    &::placeholder {
      color: ${({ theme }) => theme.colors.text3};
    }
  }

  &:focus-within {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
`;

const ChatRooms = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }
`;

const ChatRoom = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  background: ${({ active, theme }) =>
    active ? theme.colors.background2 : "transparent"};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background2};
  }
`;

const RoomIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background1};
  flex-shrink: 0;

  img {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }
`;

const RoomInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RoomTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text1};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LastMessage = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text2};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UnreadBadge = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
`;

const NewChatButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  position: absolute;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;

  img {
    width: 24px;
    height: 24px;
    filter: brightness(0) invert(1);
  }

  &:hover {
    transform: scale(1.05);
    background: ${({ theme }) => theme.colors.secondary1};
  }
`;

export default ChatList;
