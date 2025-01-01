import { useState } from "react";
import styled from "styled-components";

const PasswordChange = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // API 호출: 비밀번호 변경
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>비밀번호 변경</Title>
        <InputGroup>
          <Label>현재 비밀번호</Label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호를 입력하세요"
          />
        </InputGroup>
        <InputGroup>
          <Label>새 비밀번호</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호를 입력하세요"
          />
        </InputGroup>
        <InputGroup>
          <Label>새 비밀번호 확인</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="새 비밀번호를 다시 입력하세요"
          />
        </InputGroup>
        <SubmitButton type="submit">비밀번호 변경</SubmitButton>
      </Form>
    </Container>
  );
};

const Container = styled.div`
  padding: 24px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.text1};
  text-align: center;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text2};
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 8px;
  font-weight: 500;
  margin-top: 24px;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

export default PasswordChange;
