import React from "react";

interface SchedulePreviewProps {
  filterType?: "group" | "teacher" | "room";
  filterValue?: string;
}

export function SchedulePreview({ filterType, filterValue }: SchedulePreviewProps) {
  const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
  const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  
  const scheduleData: Record<string, Record<string, Array<{
    group: string;
    subject: string;
    teacher: string;
    room: string;
    type: string;
  }>>> = {
    "Понедельник": {
      "08:00": [
        { group: "ИС-11", subject: "Математика", teacher: "Иванова Н.П.", room: "302", type: "math" },
        { group: "ПС-11", subject: "История", teacher: "Сидоров К.В.", room: "201", type: "history" }
      ],
      "09:00": [
        { group: "ИС-11", subject: "Литература", teacher: "Петрова М.А.", room: "404", type: "literature" }
      ],
      "10:00": [
        { group: "ИС-11", subject: "История", teacher: "Сидоров К.В.", room: "201", type: "history" }
      ],
      "14:00": [
        { group: "ИС-12", subject: "Физика", teacher: "Николаев П.С.", room: "405", type: "science" }
      ],
    },
    "Вторник": {},
    "Среда": {},
    "Четверг": {},
    "Пятница": {},
    "Суббота": {
      "10:00": [
        { group: "ИС-12", subject: "Проектная деятельность", teacher: "Кузнецов А.И.", room: "311", type: "math" },
        { group: "ПС-11", subject: "Физика", teacher: "Николаев П.С.", room: "405", type: "science" }
      ]
    }
  };

  // Фильтрация занятий по выбранному фильтру
  const filterLesson = (lesson: any) => {
    if (!filterType || !filterValue) return true;
    if (filterType === "group") return lesson.group === filterValue;
    if (filterType === "teacher") return lesson.teacher === filterValue;
    if (filterType === "room") return lesson.room === filterValue;
    return true;
  };

  return (
    <div className="schedule-grid overflow-x-auto">
      <style>
        {`
        .schedule-grid {
          display: grid;
          grid-template-columns: 100px repeat(${days.length}, 1fr);
          gap: 1px;
          background-color: #e5e7eb;
          min-width: 800px;
        }
        .schedule-header {
          background: #3b82f6;
          color: white;
          padding: 12px 8px;
          font-weight: 600;
          text-align: center;
          font-size: 14px;
        }
        .schedule-time {
          background: #f3f4f6;
          padding: 12px 8px;
          font-weight: 600;
          text-align: center;
          font-size: 13px;
          color: #374151;
        }
        .schedule-cell {
          background: white;
          padding: 4px;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .schedule-class {
          padding: 8px;
          border-radius: 6px;
          width: 100%;
          font-size: 12px;
          line-height: 1.3;
        }
        .schedule-class.math {
          background: #dbeafe;
          border-left: 4px solid #3b82f6;
        }
        .schedule-class.literature {
          background: #dcfce7;
          border-left: 4px solid #22c55e;
        }
        .schedule-class.history {
          background: #fed7d7;
          border-left: 4px solid #ef4444;
        }
        .schedule-class.science {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
        }
        .schedule-class.art {
          background: #f3e8ff;
          border-left: 4px solid #8b5cf6;
        }
        `}
      </style>
      
      <div className="schedule-cell"></div>
      {days.map((day) => (
        <div key={day} className="schedule-header">{day}</div>
      ))}
      
      {times.map((time) => (
        <React.Fragment key={time}>
          <div className="schedule-time">{time}</div>
          {days.map((day) => {
            const lessons = (scheduleData[day]?.[time] || []).filter(filterLesson);
            return (
              <div key={`${day}-${time}`} className="schedule-cell">
                {Array.isArray(lessons) && lessons.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', justifyContent: 'center' }}>
                    {lessons.map((lesson, idx) => (
                      <div key={idx} className={`schedule-class ${lesson.type}`} style={{ minWidth: 120, maxWidth: 180 }}>
                        <div className="font-medium">{lesson.subject}</div>
                        <div className="text-xs text-gray-600 mt-1">Группа: {lesson.group}</div>
                        <div className="text-xs text-gray-600">Преп: {lesson.teacher}</div>
                        <div className="text-xs text-gray-600">Ауд: {lesson.room}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
