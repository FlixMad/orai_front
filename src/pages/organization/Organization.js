import styled from "styled-components";

const Organization = () => {
  return (
    <Container>
      <OrgChart>
        <Department>
          <DepartmentHeader>
            <Title>개발팀</Title>
            <Count>12명</Count>
          </DepartmentHeader>
          <MemberList>
            <MemberCard>
              <ProfileImage
                src="/images/profile/user-avatar.png"
                alt="프로필"
              />
              <Info>
                <Name>오승준</Name>
                <Position>팀장</Position>
              </Info>
            </MemberCard>
          </MemberList>
        </Department>
      </OrgChart>
    </Container>
  );
};

const Container = styled.div`
  padding: 24px;
  height: 100%;
`;

const OrgChart = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const Department = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const DepartmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.text1};
  font-weight: 600;
`;

const Count = styled.span`
  color: ${({ theme }) => theme.colors.text2};
  font-size: 14px;
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MemberCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background2};
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
`;

const Info = styled.div``;

const Name = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text1};
`;

const Position = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text2};
`;

export default Organization;
