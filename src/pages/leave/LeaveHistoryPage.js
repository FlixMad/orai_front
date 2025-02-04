import React, { useState, useEffect } from "react";
import axios from "axios";

const LeaveHistoryPage = () => {
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 현재 로그인된 사용자의 ID를 가져오는 방법을 고려 (예: JWT에서 추출, context 등)
  const userId = "user-id"; // 실제로 로그인된 사용자 ID를 여기에 설정

  useEffect(() => {
    const fetchVacations = async () => {
      try {
        // 백엔드 API 호출하여 휴가 내역 조회
        const response = await axios.get(`/api/vacations/${userId}`);
        setVacations(response.data); // 데이터를 state에 저장
      } catch (err) {
        setError("휴가 내역을 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchVacations();
  }, [userId]); // userId가 바뀔 때마다 다시 호출

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>휴가 내역</h2>
      {vacations.length > 0 ? (
        <ul>
          {vacations.map((vacation) => (
            <li key={vacation.vacationId}>
              <h3>{vacation.title}</h3>
              <p>상태: {vacation.vacationState}</p>
              <p>기간: {vacation.startDate} - {vacation.endDate}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>휴가 내역이 없습니다.</p>
      )}
    </div>
  );
};

export default LeaveHistoryPage;
