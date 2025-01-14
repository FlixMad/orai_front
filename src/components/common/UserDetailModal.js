import styled from "styled-components";
import Modal from "./Modal";

const UserDetailModal = ({ isOpen, onClose, user }) => {
    if (!user) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="사용자 정보"
            confirmText="확인"
            cancelText={null}
            onConfirm={onClose}
        >
            <UserDetailContainer>
                <ProfileSection>
                    <ProfileImage src={user.profileImage} alt={user.name} />
                    <UserName>{user.name}</UserName>
                    <StatusBadge status={user.status}>
                        {user.status}
                    </StatusBadge>
                </ProfileSection>
                <InfoSection>
                    <InfoItem>
                        <Label>이메일</Label>
                        <Value>{user.email}</Value>
                    </InfoItem>
                    <InfoItem>
                        <Label>부서</Label>
                        <Value>{user.department}</Value>
                    </InfoItem>
                    <InfoItem>
                        <Label>직책</Label>
                        <Value>{user.position}</Value>
                    </InfoItem>
                    <InfoItem>
                        <Label>연락처</Label>
                        <Value>{user.phoneNum || "미등록"}</Value>
                    </InfoItem>
                </InfoSection>
            </UserDetailContainer>
        </Modal>
    );
};

const UserDetailContainer = styled.div`
    padding: 20px 0;
`;

const ProfileSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
`;

const ProfileImage = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 16px;
`;

const UserName = styled.h3`
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: ${({ theme }) => theme.colors.text1};
`;

const StatusBadge = styled.span`
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    background-color: ${({ status, theme }) =>
        status === "재직중"
            ? theme.colors.status1 + "20"
            : theme.colors.status2 + "20"};
    color: ${({ status, theme }) =>
        status === "재직중" ? theme.colors.status1 : theme.colors.status2};
`;

const InfoSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
`;

const Label = styled.span`
    width: 80px;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text2};
`;

const Value = styled.span`
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text1};
`;

export default UserDetailModal;
