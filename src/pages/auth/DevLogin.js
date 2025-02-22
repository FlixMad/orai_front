import React, { useState } from "react";
import styled from "styled-components";
import axiosInstance from "../../configs/axios-config";
import { API_BASE_URL, USER } from "../../configs/host-config";
import { useNavigate } from "react-router-dom";

const DevLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}${USER}/api/users/devLogin`,
        formData
      );

      console.log("로그인 성공:", response.data);
      const { token, userId, email, name, departmentId } = response.data.result;

      localStorage.setItem("ACCESS_TOKEN", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);
      localStorage.setItem("departmentId", departmentId);

      navigate("/");
    } catch (error) {
      console.error("로그인 실패:", error);

      if (error.response) {
        setErrorMessage(
          error.response.data.message ||
            "로그인에 실패했습니다. ID와 PW를 확인해주세요."
        );
      } else {
        setErrorMessage("서버와의 통신에 문제가 발생했습니다.");
      }
    }
  };

  return (
    <LoginContainer>
      <LoginBox>
        <LogoSection>
          <LogoImage src="/images/factory-logo.png" alt="Charlie's Factory" />
          <LogoText>CHARLIE's FACTORY</LogoText>
        </LogoSection>

        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
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
  background-color: #f7f9f9;
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px 20px;
  background-color: #cddecb;
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

const LoginButton = styled.button`
  padding: 15px;
  background-color: #9cc97f;
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
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
  font-size: 14px;
  margin: -10px 0 10px 0;
`;

export default DevLogin;
