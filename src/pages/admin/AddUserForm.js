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
import axiosInstance from "../../configs/axios-config";
import { API_BASE_URL, USER } from "../../configs/host-config";
import { handleAxiosError } from "../../configs/HandleAxiosError";
import { useNavigate } from "react-router-dom";

const AddUserForm = ({ onBack, editUser = null }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: editUser?.email || "",
        password: "",
        name: editUser?.name || "",
        phoneNum: editUser?.phoneNum || "",
        departmentId: editUser?.department || "",
        position: editUser?.position || "EMPLOYEE",
        profileImage: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();

            // FormData에 값들을 추가 (비어있지 않은 값만)
            Object.keys(formData).forEach((key) => {
                if (
                    formData[key] !== null &&
                    formData[key] !== "" &&
                    key !== "password"
                ) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (editUser) {
                // 수정 요청
                formDataToSend.append("userId", editUser.id); // 사용자 ID 추가

                await axiosInstance.put(
                    `${API_BASE_URL}${USER}/api/admin/users/info`,
                    formDataToSend,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                alert("사용자 정보가 성공적으로 수정되었습니다.");
            } else {
                // 추가 요청
                await axiosInstance.post(
                    `${API_BASE_URL}${USER}/api/admin/users`,
                    formDataToSend,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                alert("사용자가 성공적으로 추가되었습니다.");
            }
            onBack(); // 모달 닫기
        } catch (err) {
            handleAxiosError(err, () => {}, navigate);
            alert(
                editUser
                    ? "사용자 수정에 실패했습니다."
                    : "사용자 추가에 실패했습니다."
            );
        }
    };

    return (
        <ModalOverlay onClick={onBack}>
            <FormContainer
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <BackButton onClick={onBack}>&times;</BackButton>
                <h2>{editUser ? "사용자 수정" : "사용자 추가"}</h2>
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
                {!editUser && (
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
                )}
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
                    <Input
                        type="file"
                        name="profileImage"
                        onChange={handleChange}
                    />
                </FormField>
                <SubmitButton type="submit">
                    {editUser ? "수정하기" : "추가하기"}
                </SubmitButton>
            </FormContainer>
        </ModalOverlay>
    );
};

const FormContainer = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: white;
    padding: 32px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 500px;
    max-width: 90vw;
    position: relative;
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
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 8px;
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.text2};
    font-size: 20px;
    cursor: pointer;

    &:hover {
        color: ${({ theme }) => theme.colors.primary};
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export default AddUserForm;
