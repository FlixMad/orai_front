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

  // TEAM 타입 일정
  .fc-event.schedule-type-team {
    background: ${({ theme }) => theme.colors.secondary1};
    border-color: ${({ theme }) => theme.colors.secondary1};
    cursor: pointer;
  }

  // DIVISION 타입 일정
  .fc-event.schedule-type-division {
    background: ${({ theme }) => theme.colors.secondary2};
    border-color: ${({ theme }) => theme.colors.secondary2};
    cursor: pointer;
  }

  // GROUP 타입 일정
  .fc-event.schedule-type-group {
    background: ${({ theme }) => theme.colors.secondary3};
    border-color: ${({ theme }) => theme.colors.secondary3};
    cursor: pointer;
  }

  // 토요일
  .fc-day-sat .fc-daygrid-day-number {
    color: #ff4444;
  }

  // 일요일
  .fc-day-sun .fc-daygrid-day-number {
    color: #ff4444;
  }

  // 공휴일 (holidays에 해당하는 날짜)
  .fc-daygrid-day.holiday .fc-daygrid-day-number {
    color: #ff4444; /* 공휴일 폰트 색상 */
    font-weight: bold; /* 강조 */
  }

  .holiday-event {
    color: #ff4444;
    font-weight: bold;
    font-size: 0.85em;
    margin-top: 0; /* 기존 여백 제거 */
    padding: 0; /* 기존 패딩 제거 */
    height: 100%; /* 셀의 전체 높이를 차지하도록 설정 */
    display: flex; /* 플렉스 박스 사용 */
    align-items: center; /* 수직 중앙 정렬 */
    justify-content: center; /* 수평 중앙 정렬 */
    text-align: center; /* 텍스트 정렬 */
    box-sizing: border-box; /* 내부 여백 포함 */
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  max-width: 90%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text1};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.text2};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text1};
  }
`;

const ModalBody = styled.div`
  margin-bottom: 24px;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text1};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  background: ${({ theme, $danger }) =>
    $danger ? theme.colors.status3 : theme.colors.primary};
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Calendar = () => {
  const [events, setEvents] = useState([]); // 일정 목록
  const [selectedEvent, setSelectedEvent] = useState(null); // 선택된 일정
  const [scheduleId, setScheduleId] = useState(null); // 선택된 일정 ID
  const [showModal, setShowModal] = useState(false); // 모달 표시 여부
  const [showCreateModal, setShowCreateModal] = useState(false); // 생성 모달 표시 여부
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    team: "",
    type: "TEAM",
    scheduleStatus: "PENDING", // 기본값을 PENDING으로 설정
  });
  const navigate = useNavigate();

  // 공휴일 데이터
  const holidays = {
    "2025-01-01": ["1월 1일"],
    "2025-01-28": ["설날 전날"],
    "2025-01-29": ["설날"],
    "2025-01-30": ["설날 다음 날"],
    "2025-03-01": ["3ㆍ1절"],
    "2025-03-03": ["대체공휴일(3ㆍ1절)"],
    "2025-05-05": ["어린이날", "부처님 오신 날"],
    "2025-05-06": ["대체공휴일(부처님 오신 날)"],
    "2025-06-06": ["현충일"],
    "2025-08-15": ["광복절"],
    "2025-10-03": ["개천절"],
    "2025-10-05": ["추석 전날"],
    "2025-10-06": ["추석"],
    "2025-10-07": ["추석 다음 날"],
    "2025-10-08": ["대체공휴일(추석)"],
    "2025-10-09": ["한글날"],
    "2025-12-25": ["크리스마스"],
  };

  // 공휴일을 이벤트 형식으로 변환
  const holidayEvents = Object.entries(holidays).map(([date, titles]) => {
    const eventDate = new Date(date);
    eventDate.setDate(eventDate.getDate());

    return {
      title: titles.join(", "),
      start: eventDate.toISOString().split("T")[0],
      end: eventDate.toISOString().split("T")[0],
      display: "background",
      className: "holiday",
    };
  });

  // 일정 타입 옵션
  const TYPE_OPTIONS = [
    { value: "TEAM", label: "팀 일정" },
    { value: "DIVISION", label: "부서 일정" },
    { value: "GROUP", label: "그룹 일정" },
  ];

  // 일정 상태 옵션
  const STATUS_OPTIONS = [
    { value: "UPCOMING", label: "예정" },
    { value: "IN_PROGRESS", label: "진행 중" },
    { value: "COMPLETED", label: "완료" },
  ];

  // 일정 목록 조회
  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${CALENDAR}/api/schedules`,
        {
          responseType: "json",
        }
      );
      console.log("[fetchEvents] 서버 응답:", response.data);

      if (response && response.data) {
        const formattedEvents = response.data.map((event) => {
          console.log("[fetchEvents] 각 이벤트 데이터:", event);
          return {
            id: event.scheduleId,
            title: event.title,
            description: event.description,
            start: event.start,
            end: event.end,
            extendedProps: {
              description: event.description,
              type: event.type,
              scheduleStatus: event.scheduleStatus,
            },
            className: `schedule-type-${event.type.toLowerCase()} status-${event.scheduleStatus.toLowerCase()}`,
          };
        });
        console.log("[fetchEvents] 변환된 이벤트 데이터:", formattedEvents);
        setEvents([...formattedEvents, ...holidayEvents]);
      } else {
        console.error("Invalid response format:", response);
      }
    } catch (error) {
      handleAxiosError(
        error,
        () => {
          localStorage.clear();
        },
        navigate
      );
    }
  };

  // 일정 추가를 위한 모달 표시
  const handleDateSelect = (selectInfo) => {
    setNewEvent({
      title: "",
      description: "",
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
    setShowCreateModal(true);
  };

  // 일정 생성
  const handleCreateEvent = async () => {
    if (!newEvent.title) {
      alert("제목을 입력해주세요.");
      return;
    }

    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}${CALENDAR}/api/schedules/create-schedule`,
        newEvent
      );

      if (response && response.data) {
        setScheduleId(response.data.scheduleId);
        setEvents([
          ...events,
          {
            id: response.data.scheduleId,
            title: response.data.title,
            description: response.data.description,
            start: response.data.start,
            end: response.data.end,
            extendedProps: {
              description: response.data.description,
              type: response.data.type,
              scheduleStatus: response.data.scheduleStatus,
            },
            className: `schedule-type-${response.data.type.toLowerCase()} status-${response.data.scheduleStatus.toLowerCase()}`,
          },
        ]);
        setShowCreateModal(false);
      } else {
        console.error("Invalid create response:", response);
      }
    } catch (error) {
      handleAxiosError(error, () => {}, navigate);
    }
  };

  // 일정 클릭 시 모달 표시
  const handleEventClick = (clickInfo) => {
    if (!clickInfo.event.id) {
      console.error("Event ID is missing. Cannot set selectedEvent.");
      return;
    }

    console.log("[handleEventClick] 클릭된 이벤트 전체 정보:", clickInfo.event);
    console.log(
      "[handleEventClick] extendedProps:",
      clickInfo.event.extendedProps
    );
    console.log(
      "[handleEventClick] description:",
      clickInfo.event.extendedProps.description
    );

    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps.description || "",
      type: clickInfo.event.extendedProps.type || "TEAM",
      scheduleStatus: clickInfo.event.extendedProps.scheduleStatus || "PENDING",
      start: clickInfo.event.startStr.split("T")[0],
      end: clickInfo.event.endStr.split("T")[0],
    });

    console.log("[handleEventClick] 설정된 selectedEvent:", {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps.description || "",
      start: clickInfo.event.startStr.split("T")[0],
      end: clickInfo.event.endStr.split("T")[0],
    });

    setScheduleId(clickInfo.event.id);
    setShowModal(true);
  };

  // 일정 수정
  const handleEventUpdate = async () => {
    if (!selectedEvent || !scheduleId) return;

    try {
      const updatedEvent = {
        title: selectedEvent.title,
        description: selectedEvent.description,
        start: selectedEvent.start,
        end: selectedEvent.end,
        type: selectedEvent.type,
        scheduleStatus: selectedEvent.scheduleStatus,
      };

      console.log("[handleEventUpdate] 업데이트 요청 데이터:", updatedEvent);

      const response = await axiosInstance.put(
        `${API_BASE_URL}${CALENDAR}/api/schedules/modify-schedule/${scheduleId}`,
        updatedEvent
      );

      console.log("[handleEventUpdate] 서버 응답:", response.data);

      if (response && response.data && response.data.scheduleId) {
        setEvents(
          events.map((event) =>
            event.id === scheduleId
              ? {
                  id: scheduleId,
                  title: response.data.title,
                  description: response.data.description,
                  start: response.data.start,
                  end: response.data.end,
                  extendedProps: {
                    description: response.data.description,
                    type: response.data.type,
                    scheduleStatus: response.data.scheduleStatus,
                  },
                  className: `schedule-type-${response.data.type.toLowerCase()} status-${response.data.scheduleStatus.toLowerCase()}`,
                }
              : event
          )
        );
        setShowModal(false);
      } else {
        console.error("Invalid update response:", response);
      }
    } catch (error) {
      handleAxiosError(error, () => {}, navigate);
    }
  };

  // 일정 삭제
  const handleEventDelete = async () => {
    if (!scheduleId) return;

    if (window.confirm("이 일정을 삭제하시겠습니까?")) {
      try {
        await axiosInstance.delete(
          `${API_BASE_URL}${CALENDAR}/api/schedules/delete-schedule?scheduleId=${scheduleId}`
        );

        setEvents(events.filter((event) => event.id !== scheduleId));
        setShowModal(false);
      } catch (error) {
        handleAxiosError(error, () => {}, navigate);
      }
    }
  };

  // 날짜 셀이 마운트될 때 공휴일 처리
  const handleDayCellDidMount = (arg) => {
    const date = arg.date.toLocaleDateString("en-CA"); // YYYY-MM-DD 형식 반환 (로컬 시간 기준)
    if (holidays[date]) {
      const dateNumber = arg.el.querySelector(".fc-daygrid-day-number");
      if (dateNumber) {
        dateNumber.style.color = "#FF4444";
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
        eventContent={renderEventContent}
        dayCellDidMount={handleDayCellDidMount}
      />

      {/* 일정 생성 모달 */}
      {showCreateModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>새 일정 추가</h3>
              <CloseButton onClick={() => setShowCreateModal(false)}>
                ✕
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <InputGroup>
                <Label>제목</Label>
                <Input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      title: e.target.value,
                    })
                  }
                />
              </InputGroup>
              <InputGroup>
                <Label>설명</Label>
                <Input
                  type="text"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      description: e.target.value,
                    })
                  }
                />
              </InputGroup>
              <InputGroup>
                <Label>일정 상태</Label>
                <Select
                  value={newEvent.scheduleStatus}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      scheduleStatus: e.target.value,
                    })
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </InputGroup>
              <InputGroup>
                <Label>시작 날짜</Label>
                <Input
                  type="date"
                  value={newEvent.start.split("T")[0]}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      start: e.target.value,
                    })
                  }
                />
              </InputGroup>
              <InputGroup>
                <Label>종료 날짜</Label>
                <Input
                  type="date"
                  value={newEvent.end.split("T")[0]}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      end: e.target.value,
                    })
                  }
                />
              </InputGroup>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setShowCreateModal(false)} $danger>
                취소
              </Button>
              <Button onClick={handleCreateEvent}>추가</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>일정 수정</h3>
              <CloseButton onClick={() => setShowModal(false)}>✕</CloseButton>
            </ModalHeader>
            <ModalBody>
              <InputGroup>
                <Label>제목</Label>
                <Input
                  type="text"
                  value={selectedEvent.title}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      title: e.target.value,
                    })
                  }
                />
              </InputGroup>
              <InputGroup>
                <Label>설명</Label>
                <Input
                  type="text"
                  value={selectedEvent.description}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      description: e.target.value,
                    })
                  }
                />
              </InputGroup>
              <InputGroup>
                <Label>일정 상태</Label>
                <Select
                  value={selectedEvent.scheduleStatus}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      scheduleStatus: e.target.value,
                    })
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </InputGroup>
              <InputGroup>
                <Label>시작 날짜</Label>
                <Input
                  type="date"
                  value={selectedEvent.start}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      start: e.target.value,
                    })
                  }
                />
              </InputGroup>
              <InputGroup>
                <Label>종료 날짜</Label>
                <Input
                  type="date"
                  value={selectedEvent.end}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      end: e.target.value,
                    })
                  }
                />
              </InputGroup>
            </ModalBody>
            <ModalFooter>
              <Button onClick={handleEventDelete} $danger>
                삭제
              </Button>
              <Button onClick={handleEventUpdate}>수정</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </CalendarContainer>
  );
};

// 이벤트 렌더링 커스터마이징
const renderEventContent = (eventInfo) => {
  // 공휴일인 경우
  if (eventInfo.event.display === "background") {
    return <div className="holiday-event">{eventInfo.event.title}</div>;
  }
  // 일반 일정인 경우
  return <div>{eventInfo.event.title}</div>;
};

export default Calendar;
