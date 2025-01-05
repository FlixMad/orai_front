import React, { useState } from "react";
import styled from "styled-components";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaBuilding,
  FaBriefcase,
  FaImage,
} from "react-icons/fa";

const AddUserForm = ({ onBack }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phoneNum: "",
    departmentId: "",
    position: "EMPLOYEE",
    profileImage: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 사용자 추가 로직 구현
    console.log(formData);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <BackButton onClick={onBack}>이전</BackButton>
      <FormField>
        <FaEnvelope />
        <Input
          type="email"
          name="email"
          placeholder="이메일"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </FormField>
      <FormField>
        <FaLock />
        <Input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </FormField>
      <FormField>
        <FaUser />
        <Input
          type="text"
          name="name"
          placeholder="이름"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </FormField>
      <FormField>
        <FaPhone />
        <Input
          type="text"
          name="phoneNum"
          placeholder="전화번호"
          value={formData.phoneNum}
          onChange={handleChange}
        />
      </FormField>
      <FormField>
        <FaBuilding />
        <Input
          type="text"
          name="departmentId"
          placeholder="부서 ID"
          value={formData.departmentId}
          onChange={handleChange}
        />
      </FormField>
      <FormField>
        <FaBriefcase />
        <Select
          name="position"
          value={formData.position}
          onChange={handleChange}
        >
          <option value="EMPLOYEE">사원</option>
          <option value="TEAM_LEADER">팀장</option>
          <option value="MANAGER">매니저</option>
          <option value="CEO">CEO</option>
        </Select>
      </FormField>
      <FormField>
        <FaImage />
        <Input type="file" name="profileImage" onChange={handleChange} />
      </FormField>
      <SubmitButton type="submit">사용자 추가</SubmitButton>
    </FormContainer>
  );
};

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  background-color: #f9f9f9;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FormField = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Input = styled.input`
  flex: 1;
  border: none;
  font-size: 14px;

  &:focus {
    outline: none;
  }
`;

const Select = styled.select`
  flex: 1;
  border: none;
  font-size: 14px;
  background-color: transparent;

  &:focus {
    outline: none;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  align-self: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary1};
  }
`;

const BackButton = styled.button`
  align-self: flex-start;
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.colors.secondary1};
  color: white;
  border-radius: 8px;
  font-weight: 500;
  margin-bottom: 16px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary2};
  }
`;

export default AddUserForm;
