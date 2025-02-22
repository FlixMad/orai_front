import React, { useState } from "react";
import styled from "styled-components";
import axiosInstance from "../../configs/axios-config"; // axios 설정 가져오기
import { API_BASE_URL, USER } from "../../configs/host-config"; // API_BASE_URL과 USER 가져오기
import { useNavigate } from "react-router-dom"; // useNavigate 훅을 사용하여 페이지 이동 처리
import { QRCodeCanvas } from "qrcode.react"; // QR 코드 생성 라이브러리 수정

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [mfaSecret, setMfaSecret] = useState(""); // 실제 MFA 비밀 키
    const [mfaCode, setMfaCode] = useState(""); // MFA 코드 입력 값
    const [isMfaRequired, setIsMfaRequired] = useState(false); // MFA 인증 필요 여부
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleMfaChange = (e) => {
        setMfaCode(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(
                `${API_BASE_URL}${USER}/api/users/login`,
                formData
            );

            console.log("로그인 성공:", response.data);
            const { secret } = response.data.result;

            if (secret) {
                setMfaSecret(secret); // MFA secret 값 설정
                setIsMfaRequired(true); // MFA 인증 필요 상태로 설정

                // QR 코드 생성 (URI를 직접 QR 코드 생성에 사용)
            } else {
                navigate("/"); // MFA 필요 없으면 바로 대시보드로 이동
            }
        } catch (error) {
            console.error("로그인 실패:", error);
            setErrorMessage(
                error.response?.data?.message ||
                    "로그인에 실패했습니다. ID와 PW를 확인해주세요."
            );
        }
    };

    const handleMfaSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(
                `${API_BASE_URL}${USER}/api/users/validate-mfa`,
                null,
                {
                    params: {
                        secret: mfaSecret, // 실제 secret 값
                        code: mfaCode,
                    },
                }
            );

            console.log("MFA 인증 성공:", response.data);
            localStorage.setItem(
                "ACCESS_TOKEN",
                response.data.result.accessToken
            ); // JWT 토큰 저장
            localStorage.setItem("userId", response.data.result.userId);
            localStorage.setItem("userEmail", response.data.result.email);
            localStorage.setItem("userName", response.data.result.name);
            localStorage.setItem(
                "departmentId",
                response.data.result.departmentId
            );
            navigate("/"); // 대시보드로 이동
        } catch (error) {
            console.error("MFA 인증 실패:", error);

            setErrorMessage("MFA 코드가 잘못되었습니다.");
        }
    };

    return (
        <LoginContainer>
            <LoginBox>
                <LogoSection>
                    <LogoImage
                        src="/images/factory-logo.png"
                        alt="Charlie's Factory"
                    />
                    <LogoText>CHARLIE's FACTORY</LogoText>
                </LogoSection>

                {isMfaRequired ? (
                    <Form onSubmit={handleMfaSubmit}>
                        <EmailInfo>
                            연동 해야할 이메일: {formData.email}
                        </EmailInfo>
                        <QRCodeContainer>
                            <QRCodeCanvas
                                value={`otpauth://totp/YourAppName:${formData.email}?secret=${mfaSecret}&issuer=YourAppName`}
                                size={256}
                            />
                            <QRDescription>
                                구글어센티케이터를 실행하고 큐알코드
                                스캔해주십쇼!
                            </QRDescription>
                        </QRCodeContainer>
                        <Input
                            type="text"
                            name="mfaCode"
                            placeholder="이메일과 연동된 6자리 숫자를 입력하세요"
                            value={mfaCode}
                            onChange={handleMfaChange}
                            required
                            maxLength="6"
                        />
                        {errorMessage && (
                            <ErrorMessage>{errorMessage}</ErrorMessage>
                        )}
                        <LoginButton type="submit">MFA 인증</LoginButton>
                    </Form>
                ) : (
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
                        {errorMessage && (
                            <ErrorMessage>{errorMessage}</ErrorMessage>
                        )}
                        <LoginButton type="submit">로그인</LoginButton>
                    </Form>
                )}
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

const EmailInfo = styled.div`
    text-align: center;
    margin-bottom: 20px;
    color: #333;
    font-size: 16px;
    font-weight: 500;
`;

const QRCodeContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
`;

const QRDescription = styled.p`
    text-align: center;
    color: #333;
    font-size: 14px;
    margin: 10px 0 0 0;
`;

export default Login;
