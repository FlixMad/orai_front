import styled from "styled-components";
import Modal from "./Modal";
import { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-config";
import { API_BASE_URL, USER } from "../../configs/host-config";
import { format } from "date-fns";

const AttitudeModal = ({ isOpen, onClose, user }) => {
    const [attitudes, setAttitudes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttitudes = async () => {
            try {
                const response = await axiosInstance.get(
                    `${API_BASE_URL}${USER}/api/admin/attitudes`,
                    {
                        params: { userId: user.id },
                    }
                );
                setAttitudes(response.data.result);
            } catch (error) {
                console.error("근태 정보 조회 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && user) {
            fetchAttitudes();
        }
    }, [isOpen, user]);

    const formatTime = (dateString) => {
        return format(new Date(dateString), "HH:mm");
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), "yyyy-MM-dd");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${user?.name}님의 근태 기록`}
            size="large"
            confirmText=""
            cancelText=""
        >
            <Container>
                {loading ? (
                    <LoadingMessage>근태 정보를 불러오는 중...</LoadingMessage>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>날짜</th>
                                <th>출근 시간</th>
                                <th>퇴근 시간</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attitudes.map((attitude) => (
                                <tr key={attitude.attitudeId}>
                                    <td>{formatDate(attitude.createdAt)}</td>
                                    <td>{formatTime(attitude.checkInTime)}</td>
                                    <td>{formatTime(attitude.checkOutTime)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Container>
        </Modal>
    );
};

const Container = styled.div`
    padding: 20px;
    max-height: 500px;
    overflow-y: auto;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;

    th,
    td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    }

    th {
        font-weight: 600;
        color: ${({ theme }) => theme.colors.text2};
        background-color: ${({ theme }) => theme.colors.background2};
    }

    td {
        color: ${({ theme }) => theme.colors.text1};
    }
`;

const LoadingMessage = styled.div`
    text-align: center;
    padding: 20px;
    color: ${({ theme }) => theme.colors.text2};
`;

export default AttitudeModal;
