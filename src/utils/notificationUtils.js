import axiosInstance from "../configs/axios-config";
import { API_BASE_URL, ETC } from "../configs/host-config";

export const fetchNotificationCount = async () => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (!token) return;

  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}${ETC}/api/notifications/count`
    );

    if (response.status === 200) {
      return response.data.result;
    }
  } catch (error) {
    console.error("알림 개수 조회 중 오류:", error);
    return 0;
  }
};
