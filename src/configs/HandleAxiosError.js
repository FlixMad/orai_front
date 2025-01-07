export const handleAxiosError = (error, onLogout, navigate) => {
  console.error("handleAxiosError - 전체 에러 객체:", error); // 전체 에러 로그

  // 응답 객체가 있는지 확인
  if (error.response) {
    console.log("handleAxiosError - 응답 상태 코드:", error.response.status);
    console.log(
      "handleAxiosError - 응답 데이터:",
      error.response.data || "데이터 없음"
    );

    // 응답 데이터가 정의된 경우 처리
    if (error.response.data?.statusMessage === "EXPIRED_RT") {
      console.warn("handleAxiosError - 토큰 만료 상태 발생");
      alert("시간이 경과하여 재 로그인이 필요합니다.");
      onLogout();
      navigate("/");
    } else if (error.response.data?.message === "NO_LOGIN") {
      console.warn("handleAxiosError - 로그인하지 않은 상태에서 요청 발생");
      alert("아예 로그인을 하지 않아서 재발급 요청 들어갈 수 없음!");
      navigate("/");
    } else {
      console.warn("handleAxiosError - 알 수 없는 응답 에러 발생");
      throw error;
    }
  } else if (error.request) {
    // 요청 객체만 존재하는 경우
    console.error(
      "handleAxiosError - 요청 객체만 존재, 응답 없음:",
      error.request
    );
    alert("서버로부터 응답을 받을 수 없습니다. 네트워크 상태를 확인하세요.");
  } else {
    // 기타 에러 처리
    console.error("handleAxiosError - 설정 또는 기타 에러:", error.message);
    alert(`예기치 못한 오류가 발생했습니다: ${error.message}`);
  }
};
