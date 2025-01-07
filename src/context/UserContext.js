import React, { useEffect, useState } from "react";

// UserContext 생성 (새로운 전역 컨텍스트 생성)

export const login = React.createContext({
  isLoggedIn: false, // 로그인 했는지의 여부
  onLogin: () => {},
  onLogout: () => {},
  name: "",
  profile: "",
  isInit: false,
});

// 위에서 생성한 Context 제공하는 Provider 선언.
// 이 Provider를 통해 자식 컴포넌트(consumer)에게 인증 상태와 관련된 값, 함수를 전달할 수 있음.
export const AuthContextProvider = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInit, setIsInit] = useState(false); // 초기화 완료 상태 추가
  const [nickName, setNickName] = useState("새로운 방문자님");
  const [loginMethod, setLoginMethod] = useState("UNKNOWN");
  const [profile, setProfile] = useState("assets/img/anonymous.jpg");

  useEffect(() => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
      setIsLoggedIn(true);
      setName(localStorage.getItem("NAME"));
      setProfile(localStorage.getItem("PROFILE"));
    }
    setIsInit(true);
  }, [isLoggedIn]);

  // 로그인 핸들러
  const loginHandler = (token, id, nickName, loginMethod, profile) => {
    // 백엔드가 응답한 JSON 인증 정보를 클라이언트쪽에 보관하자.
    localStorage.setItem("ACCESS_TOKEN", token);
    localStorage.setItem("USER_ID", id);
    localStorage.setItem("NICKNAME", nickName);
    localStorage.setItem("LOGIN_METHOD", loginMethod);
    localStorage.setItem("PROFILE", profile || "assets/img/anonymous.jpg");

    setIsLoggedIn(true);
  };

  // 로그아웃 핸들러
  const logoutHandler = () => {
    localStorage.clear(); // 로컬스토리지 내용 전체 삭제
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (localStorage.getItem("ACCESS_TOKEN")) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <login.Provider
      value={{
        isLoggedIn,
        onLogin: loginHandler,
        onLogout: logoutHandler,
        isInit,
        nickName,
        loginMethod,
        profile,
      }}
    >
      {props.children}
    </login.Provider>
  );
};

export default login;