import { useState, useEffect } from "react";
import styled from "styled-components";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axiosInstance from "../../configs/axios-config";
import { API_BASE_URL, CALENDAR } from "../../configs/host-config";
import { handleAxiosError } from "../../configs/HandleAxiosError";
import { useNavigate } from "react-router-dom";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  // 일정 목록 조회
  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CALENDAR}/api/schedules`
      );
      setEvents(response.data);
    } catch (error) {
      handleAxiosError(error, () => {
        localStorage.clear(); // 로그아웃 시 로컬 스토리지 클리어
      }, navigate);
    }
  };

  // 일정 추가
  const handleDateSelect = async (selectInfo) => {
    const title = prompt("일정을 입력하세요:");
    if (title) {
      try {
        const newEvent = {
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
        };

        const response = await axiosInstance.post(
          `${API_BASE_URL}${CALENDAR}/api/schedules/create-schedule`,
          newEvent
        );

        setEvents([...events, response.data]);
      } catch (error) {
        handleAxiosError(error, () => {}, navigate);
      }
    }
  };

  // 일정 삭제
  const handleEventClick = async (clickInfo) => {
    if (window.confirm("이 일정을 삭제하시겠습니까?")) {
      try {
        await axiosInstance.delete(
          `${API_BASE_URL}${CALENDAR}/api/schedules/delete-schedule/${clickInfo.event.id}`
        );

        setEvents(events.filter((event) => event.id !== clickInfo.event.id));
      } catch (error) {
        handleAxiosError(error, () => {}, navigate);
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <CalendarContainer>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale="ko"
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="100%"
      />
    </CalendarContainer>
  );
};

const CalendarContainer = styled.div`
  height: 100%;
  padding: 20px;
  background: white;
  border-radius: 12px;

  .fc {
    height: 100%;
  }

  .fc-toolbar-title {
    font-size: 1.2em !important;
    font-weight: 600;
  }

  .fc-button {
    background: ${({ theme }) => theme.colors.primary} !important;
    border-color: ${({ theme }) => theme.colors.primary} !important;
  }

  .fc-event {
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }
`;

export default Calendar;
