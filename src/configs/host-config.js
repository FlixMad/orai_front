const clientHostName = window.location.hostname;
let backendHostName;

if (clientHostName === "localhost") {
  backendHostName = "http://localhost:8181"; // 로컬 backend 서버 주소
} else if (clientHostName === "orai.store") {
  backendHostName = "https://api.orai.store"; // 배포 backend 서버 주소 추후 변경 필요
}

export const API_BASE_URL = backendHostName;
export const USER = "/user-service";
export const CALENDAR = "/calendar-service";
export const CHAT = "/chat-service";
export const ETC = "/etc-service";
