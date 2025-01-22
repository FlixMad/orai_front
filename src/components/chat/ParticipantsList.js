import styled from 'styled-components';

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
  object-fit: cover;
`;

const ParticipantName = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text2};
`;

const DepartmentInfo = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text3};
  margin-top: 2px;
`;

const ParticipantsList = ({ participants }) => {
  return (
    <ParticipantList>
      {participants.map((participant) => (
        <Participant key={participant.userId}>
          <ParticipantAvatar
            src={participant.profileImage || '/default-avatar.png'}
            alt={participant.name}
          />
          <ParticipantName>
            {participant.name}
            <DepartmentInfo>
              {participant.departmentId} • {participant.position}
            </DepartmentInfo>
          </ParticipantName>
        </Participant>
      ))}
    </ParticipantList>
  );
};

export default ParticipantsList;
