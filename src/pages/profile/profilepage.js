import React, { useState, useEffect } from "react";

const ProfilePage = () => {
  const [isWorking, setIsWorking] = useState(
    localStorage.getItem("isWorking") === "true"
  );
  const [workStartTime, setWorkStartTime] = useState(
    localStorage.getItem("workStartTime") ? new Date(localStorage.getItem("workStartTime")) : null
  );
  const [workEndTime, setWorkEndTime] = useState(null);
  const [workDuration, setWorkDuration] = useState("");

  useEffect(() => {
    if (workStartTime) {
      const interval = setInterval(() => {
        const now = new Date();
        setWorkDuration(calculateWorkDuration(workStartTime, now));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [workStartTime]);

  // 출근 버튼 클릭 시
  const handleWorkStart = async () => {
    const now = new Date();
    setIsWorking(true);
    setWorkStartTime(now);
    localStorage.setItem("isWorking", "true");
    localStorage.setItem("workStartTime", now.toISOString());

    try {
      const response = await fetch(`${API_BASE_URL}/user-service/api/attitude/checkin`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("ACCESS_TOKEN")}` }
      });
      if (!response.ok) throw new Error("출근 요청 실패");
    } catch (error) {
      console.error(error);
    }
  };

  // 퇴근 버튼 클릭 시
  const handleWorkEnd = async () => {
    const now = new Date();
    setIsWorking(false);
    setWorkEndTime(now);
    localStorage.setItem("isWorking", "false");

    if (workStartTime) {
      setWorkDuration(calculateWorkDuration(workStartTime, now));
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user-service/api/attitude/checkout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("ACCESS_TOKEN")}` }
      });
      if (!response.ok) throw new Error("퇴근 요청 실패");
    } catch (error) {
      console.error(error);
    }
  };

  // 근무 시간 계산 함수
  const calculateWorkDuration = (start, end) => {
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}시간 ${minutes}분`;
  };

  return (
    <div style={styles.profileContainer}>
      <h1 style={styles.profileTitle}>프로필 페이지</h1>
      <p style={{ ...styles.status, ...(isWorking ? styles.working : styles.notWorking) }}>
        현재 상태: {isWorking ? "근무 중" : "퇴근"}
      </p>
      {workStartTime && <p style={styles.time}>출근 시간: {workStartTime.toLocaleTimeString()}</p>}
      {workEndTime && <p style={styles.time}>퇴근 시간: {workEndTime.toLocaleTimeString()}</p>}
      {workDuration && <p style={styles.time}>오늘 근무 시간: {workDuration}</p>}
      
      <div style={styles.buttonContainer}>
        {isWorking ? (
          <button style={styles.endButton} onClick={handleWorkEnd}>퇴근하기</button>
        ) : (
          <button style={styles.startButton} onClick={handleWorkStart}>출근하기</button>
        )}
      </div>
    </div>
  );
};

const styles = {
  profileContainer: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center"
  },
  profileTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333"
  },
  status: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "10px 0"
  },
  working: {
    color: "green"
  },
  notWorking: {
    color: "red"
  },
  time: {
    fontSize: "16px",
    margin: "5px 0",
    color: "#555"
  },
  buttonContainer: {
    marginTop: "20px"
  },
  startButton: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#4caf50",
    color: "white",
    transition: "0.3s ease"
  },
  endButton: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#f44336",
    color: "white",
    transition: "0.3s ease"
  }
};

export default ProfilePage;
