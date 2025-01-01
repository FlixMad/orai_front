import React, { useState } from "react";
import styled from "styled-components";

const Login = () => {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 로그인 로직 구현
    console.log("로그인 시도:", formData);
  };

  return (
    <LoginContainer>
      <LoginBox>
        <LogoSection>
          <LogoImage src="/images/orai-logo.png" alt="Charlie's Factory" />
          <LogoText>CHARLIE's FACTORY</LogoText>
        </LogoSection>

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="id"
            placeholder="ID"
            value={formData.id}
            onChange={handleChange}
          />
          <Input
            type="password"
            name="password"
            placeholder="PW"
            value={formData.password}
            onChange={handleChange}
          />
          <ForgotPassword>비밀번호를 잊어버렸어요.</ForgotPassword>
          <LoginButton type="submit">로그인</LoginButton>
        </Form>
      </LoginBox>
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #dae5da;
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
`;

const LogoText = styled.h1`
  font-size: 24px;
  color: #333;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: #9cb99c;
  }
`;

const ForgotPassword = styled.p`
  text-align: center;
  color: #666;
  font-size: 14px;
  margin: 10px 0;
  cursor: pointer;
`;

const LoginButton = styled.button`
  padding: 15px;
  background-color: #9cb99c;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #8aa98a;
  }
`;

const LogoImage = styled.img`
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
`;

export default Login;
