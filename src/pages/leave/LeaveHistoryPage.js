import { useState, useEffect } from "react";
import styled from "styled-components";
import axiosInstance from "../../configs/axios-config";
import { API_BASE_URL, USER } from "../../configs/host-config";

const LeaveHistoryPage = () => {
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      if (!token) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`${API_BASE_URL}${USER}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(response.data.userId);
      } catch (error) {
        setError("사용자 정보를 가져오는 데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchVacations = async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      try {
        const response = await axiosInstance.get(`${API_BASE_URL}${USER}/api/vacations/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVacations(response.data);
      } catch (err) {
        setError("휴가 내역을 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchVacations();
  }, [userId]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <Container>
      <h2>휴가 내역</h2>
      {vacations.length > 0 ? (
        <ListContainer>
          {vacations.map((vacation) => (
            <VacationCard key={vacation.vacationId}>
              <h3>{vacation.title}</h3>
              <p>상태: {vacation.vacationState}</p>
              <p>기간: {vacation.startDate} - {vacation.endDate}</p>
            </VacationCard>
          ))}
        </ListContainer>
      ) : (
        <p>휴가 내역이 없습니다.</p>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const VacationCard = styled.div`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 16px;
`;

export default LeaveHistoryPage;
