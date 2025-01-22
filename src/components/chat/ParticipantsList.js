import styled from 'styled-components';

const ParticipantsOverlay = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: ${({ theme }) => theme.colors.background2};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  width: 200px;
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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  position: relative;
  z-index: 1001;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.text1};
`;

const ParticipantsList = ({ participants }) => {
  return (
    <ParticipantsOverlay>
      {participants.map((participant) => (
        <ParticipantItem key={participant.userId}>
          <ParticipantImage
            src={participant.profileImage || '/default-profile.png'}
            alt={participant.name}
          />
          <ParticipantName>{participant.name}</ParticipantName>
        </ParticipantItem>
      ))}
    </ParticipantsOverlay>
  );
};

export default ParticipantsList;
