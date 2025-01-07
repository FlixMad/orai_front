export const handleAxiosError = (error, onLogout, navigate) => {
  if (!error.response) {
    console.error('서버 응답이 없습니다:', error);
    return;
  }

  if (error.response?.data?.statusMessage === 'EXPIRED_RT') {
    alert('시간이 경과하여 재 로그인이 필요합니다.');
    onLogout();
    navigate('/');
  } else if (error.response?.data?.message === 'NO_LOGIN') {
    alert('아직 로그인하지 않았습니다. 로그인이 필요합니다.');
    navigate('/');
  } else {
    console.error('API 에러:', error);
    throw error;
  }
};
