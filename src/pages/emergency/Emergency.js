import { useState, useEffect } from "react";
import styled from "styled-components";
import axiosInstance from "../../configs/axios-config";
import { API_BASE_URL, CALENDAR, USER } from "../../configs/host-config";
import { BsTelephone, BsSearch } from "react-icons/bs";
import { MdEmail } from "react-icons/md";

const Emergency = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [departments, setDepartments] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${CALENDAR}/api/departments/map`
        );
        const data = await response.data;
        setDepartments(data);
      } catch (error) {
        console.error("부서 정보를 불러오는데 실패했습니다:", error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (selectedDepartment === "all") {
          const response = await axiosInstance.get(
            `${API_BASE_URL}${USER}/api/admin/users/list`
          );
          setUsers(response.data.result || []);
        } else {
          const departmentId = Object.entries(departments).find(
            ([key, value]) => value === selectedDepartment
          )?.[0];

          if (departmentId) {
            const response = await axiosInstance.get(
              `${API_BASE_URL}${USER}/api/admin/users/list?departmentId=${departmentId}`
            );
            setUsers(response.data.result || []);
          }
        }
      } catch (error) {
        console.error("사용자 정보를 불러오는데 실패했습니다:", error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [selectedDepartment, departments]);

  return (
    <EmergencyContainer>
      <EmergencyHeader>
        <SearchSection>
          <DepartmentSelect
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="all">전체 부서</option>
            {Object.entries(departments).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </DepartmentSelect>
          <SearchBar>
            <BsSearch size={20} opacity={0.7} />
            <input
              type="text"
              placeholder="이름, 직책으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
        </SearchSection>
      </EmergencyHeader>

      <ContactList>
        {users
          .filter(
            (user) =>
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.position.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((user) => (
            <ContactCard key={user.userId}>
              <ProfileImage
                src={
                  user.profileImage && user.profileImage.trim() !== " "
                    ? user.profileImage
                    : "/images/profile/user-avatar.png"
                }
                alt="프로필"
              />
              <ContactInfo>
                <Name>{user.name}</Name>
                <Position>
                  {user.position} | {user.departmentName}
                </Position>
                <ContactDetails>
                  <Detail>
                    <BsTelephone size={14} opacity={0.7} />
                    {user.phoneNum}
                  </Detail>
                  <Detail>
                    <MdEmail size={14} opacity={0.7} />
                    {user.email}
                  </Detail>
                </ContactDetails>
              </ContactInfo>
            </ContactCard>
          ))}
      </ContactList>
    </EmergencyContainer>
  );
};

const EmergencyContainer = styled.div`
  padding: 24px;
  height: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const EmergencyHeader = styled.div`
  margin-bottom: 24px;
`;

const SearchSection = styled.div`
  display: flex;
  gap: 16px;
`;

const DepartmentSelect = styled.select`
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: white;
  color: ${({ theme }) => theme.colors.text1};
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.background2};
  border-radius: 8px;
  flex: 1;

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
      color: ${({ theme }) => theme.colors.text2};
    }
  }
`;

const ContactList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const ContactCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background2};
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProfileImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text1};
`;

const Position = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text2};
  margin-bottom: 8px;
`;

const ContactDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Detail = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text1};
`;

export default Emergency;
