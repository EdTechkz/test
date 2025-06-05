# Генератор расписания колледжа

Это веб-приложение для автоматизации составления и управления расписанием колледжа. Проект объединяет backend на Express и frontend на React (Vite), поддерживает работу с реальными данными, мгновенное обновление через WebSocket и полностью локализован на казахский язык.

## Возможности
- CRUD для преподавателей, групп, аудиторий, предметов и расписания
- Хранение данных в JSON-файлах (локально)
- Мгновенное обновление данных на всех вкладках через WebSocket
- Экспорт расписания в CSV и Excel (xlsx)
- Печать расписания
- Полная локализация интерфейса (казахский язык)
- Современный UI (React + shadcn/ui)

## Быстрый старт

### 1. Клонирование репозитория
```bash
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ>
cd <ПАПКА_ПРОЕКТА>
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Сборка frontend
```bash
npm run build
```

### 4. Запуск сервера
```bash
node server.js
```

- Сервер стартует на порту 3000: http://localhost:3000
- Если порт занят, завершите процессы на 3000 порту или измените порт в server.js

### 5. Использование
- Откройте браузер и перейдите по адресу http://localhost:3000
- Все данные (преподаватели, группы, аудитории, предметы, расписание) хранятся в папке `data/` в формате JSON
- Все изменения сразу видны на всех открытых вкладках (WebSocket)
- Для экспорта используйте кнопки "Экспорт" (CSV, Excel)
- Для печати используйте кнопку "Басып шығару"

## Структура проекта
- `server.js` — основной backend (Express + WebSocket)
- `src/` — исходный код frontend (React + Vite)
- `data/` — все данные приложения (JSON-файлы)
- `dist/` — собранный frontend (автоматически создаётся после `npm run build`)

## Примечания
- Все интерфейсы и подписи на казахском языке
- Для разработки используйте `npm run dev` (Vite)
- Для production используйте `npm run build` и `node server.js`
- Для смены порта измените значение в server.js

## Требования
- Node.js 18+
- npm 9+

## Возможные проблемы
- **Порт 3000 занят**: завершите процессы через `lsof -ti tcp:3000 | xargs kill -9`
- **Нет файла dist/index.html**: выполните `npm run build` перед запуском сервера
- **Данные не обновляются**: убедитесь, что WebSocket не блокируется брандмауэром

## Пример: Подключение Ollama (или другого OpenAI-совместимого API) к вашему Node.js backend

// Если Node.js < 18, раскомментируйте следующую строку:
// import fetch from "node-fetch";

async function askOllama(prompt) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3', // или ваша модель
      prompt: prompt,
      stream: false
    })
  });
  const data = await response.json();
  return data.response || data.message || '';
}

app.post("/api/schedule-bot/message", async (req, res) => {
  const { text } = req.body;
  const llmReply = await askOllama(text);
  return res.json({ reply: llmReply });
  // Если хотите оставить fallback на старую логику, закомментируйте return и добавьте старую логику ниже.
});

