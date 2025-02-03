import React, { useEffect, useState, createContext } from "react";

// UserContext 생성 (새로운 전역 컨텍스트 생성)

export const UserContext = createContext();

export const AuthContextProvider = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInit, setIsInit] = useState(false); // 초기화 완료 상태 추가
  const [name, setName] = useState("새로운 방문자님");
  const [profile, setProfile] = useState("assets/img/anonymous.jpg");
  const [notificationCount, setNotificationCount] = useState(0);

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
    <UserContext.Provider
      value={{ notificationCount, setNotificationCount, loginHandler }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContext;
