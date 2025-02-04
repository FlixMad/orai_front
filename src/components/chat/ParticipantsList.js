import styled from 'styled-components';
import { API_BASE_URL, CHAT } from '../../configs/host-config';
import { GiQueenCrown } from 'react-icons/gi';

const ParticipantsOverlay = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: ${({ theme }) => theme.colors.background2};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  width: 240px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 150;
  margin-top: 12px;
  max-height: 170px;
  overflow-y: auto;

  // 스크롤바 스타일링
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.border}dd;
  }

  // 말풍선 화살표
  &::before,
  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 65px;
    top: -16px;
    width: 0;
    height: 0;
    border-style: solid;
    pointer-events: none;
    z-index: 150;
  }

  &::before {
    border-width: 0 8px 8px 8px;
    border-color: transparent transparent ${({ theme }) => theme.colors.border}
      transparent;
  }

  &::after {
    top: -14px;
    border-width: 0 7px 7px 7px;
    border-color: transparent transparent
      ${({ theme }) => theme.colors.background2} transparent;
  }
`;

const ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ParticipantImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const ParticipantName = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text1};
`;

const RemoveButton = styled.button`
  padding: 4px 8px;
  background-color: ${({ theme }) => theme.colors.danger || '#ff4444'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-left: auto;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerHover || '#ff6666'};
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h3`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text1};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text2};
  cursor: pointer;
  padding: 4px;
  font-size: 16px;

  &:hover {
    color: ${({ theme }) => theme.colors.text1};
  }
`;

const ParticipantsList = ({
  participants,
  chatRoomId,
  isCreator,
  onRemoveUser,
  onClose,
}) => {
  const handleRemoveUser = async (userId) => {
    if (!window.confirm('정말 이 멤버를 채팅방에서 내보내시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}${CHAT}/${chatRoomId}/${userId}/deleteUser`
      );

      if (response.status === 204) {
        alert('사용자를 내보냈습니다.');
      }
      onRemoveUser?.(userId);
    } catch (error) {
      console.error('Error removing user:', error);
      alert('사용자를 내보내는데 실패했습니다.');
    }
  };

  return (
    <ParticipantsOverlay onClick={(e) => e.stopPropagation()}>
      <HeaderContainer>
        <Title>참가자 목록</Title>
        <CloseButton onClick={onClose}>&times;</CloseButton>
      </HeaderContainer>
      {participants.map((participant) => (
        <ParticipantItem key={participant.userId}>
          <ParticipantImage
            src={participant.profileImage || '/default-profile.png'}
            alt={participant.name}
          />
          <ParticipantName>
            {participant.userId === participant.creatorId && (
              <GiQueenCrown style={{ marginRight: '4px', color: '#FFD700' }} />
            )}
            {participant.name.length > 3
              ? `${participant.name.slice(0, 3)}...`
              : participant.name}
          </ParticipantName>
          {isCreator && participant.userId !== participant.creatorId && (
            <RemoveButton onClick={() => handleRemoveUser(participant.userId)}>
              내보내기
            </RemoveButton>
          )}
        </ParticipantItem>
      ))}
    </ParticipantsOverlay>
  );
};

export default ParticipantsList;
