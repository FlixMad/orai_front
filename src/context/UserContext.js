import React, { createContext, useState, useEffect } from "react";

export const login = createContext({
  isLoggedIn: false, // 로그인 했는지의 여부
  onLogin: () => {},
  onLogout: () => {},
  name: "",
  profile: "",
  isInit: false,
});

export const AuthContextProvider = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInit, setIsInit] = useState(false); // 초기화 완료 상태 추가
  const [name, setName] = useState("사용자"); // 기본 name 설정
  const [profile, setProfile] = useState("/images/profile/user-avatar.png"); // 기본 profile 설정

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
  const loginHandler = (token, id, name, profile) => {
    localStorage.setItem("ACCESS_TOKEN", token);
    localStorage.setItem("USER_ID", id);
    localStorage.setItem("NAME", name);
    localStorage.setItem("PROFILE", profile || "/images/profile/user-avatar.png");

    setIsLoggedIn(true);
  };

  // 로그아웃 핸들러
  const logoutHandler = () => {
    localStorage.clear();
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
        name,
        profile,
      }}
    >
      {props.children}
    </login.Provider>
  );
};

export default login;
