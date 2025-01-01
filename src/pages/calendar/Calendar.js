import { useState } from "react";
import styled from "styled-components";

const Calendar = () => {
  const [viewType, setViewType] = useState("month"); // month or week
  // const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <CalendarContainer>
      <CalendarHeader>
        <ViewControls>
          <ViewButton
            active={viewType === "month"}
            onClick={() => setViewType("month")}
          >
            월간
          </ViewButton>
          <ViewButton
            active={viewType === "week"}
            onClick={() => setViewType("week")}
          >
            주간
          </ViewButton>
        </ViewControls>
        <DateControls>
          <ControlButton>
            <img src="/images/icons/arrow-left.png" alt="이전" />
          </ControlButton>
          <CurrentDate>2024년 3월</CurrentDate>
          <ControlButton>
            <img src="/images/icons/arrow-right.png" alt="다음" />
          </ControlButton>
        </DateControls>
        <ActionButton>
          <img src="/images/icons/plus.png" alt="일정 추가" />
          일정 추가
        </ActionButton>
      </CalendarHeader>

      <CalendarGrid>
        <WeekDays>
          <WeekDay>일</WeekDay>
          <WeekDay>월</WeekDay>
          <WeekDay>화</WeekDay>
          <WeekDay>수</WeekDay>
          <WeekDay>목</WeekDay>
          <WeekDay>금</WeekDay>
          <WeekDay>토</WeekDay>
        </WeekDays>
        <DaysGrid>{/* 날짜 그리드가 여기에 들어갑니다 */}</DaysGrid>
      </CalendarGrid>
    </CalendarContainer>
  );
};

const CalendarContainer = styled.div`
  padding: 24px;
  height: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ViewControls = styled.div`
  display: flex;
  gap: 8px;
`;

const ViewButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  background: ${({ active, theme }) =>
    active ? theme.colors.primary : "transparent"};
  color: ${({ active, theme }) => (active ? "white" : theme.colors.text2)};
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active, theme }) =>
      active ? theme.colors.primary : theme.colors.background1};
  }
`;

const DateControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ControlButton = styled.button`
  padding: 8px;
  border-radius: 8px;

  img {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.background1};
  }
`;

const CurrentDate = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text1};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;

  img {
    width: 16px;
    height: 16px;
  }

  &:hover {
    opacity: 0.9;
  }
`;

const CalendarGrid = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
`;

const WeekDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: ${({ theme }) => theme.colors.background2};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const WeekDay = styled.div`
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text2};
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, auto);
`;

export default Calendar;
