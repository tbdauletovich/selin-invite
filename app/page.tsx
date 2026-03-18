"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// ===== НАСТРОЙКИ TELEGRAM =====
// Важно: на Vercel эти переменные должны быть добавлены как NEXT_PUBLIC_...
const TELEGRAM_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "";

// ===== ФОТО =====
const photos = [
  "/selin1.jpg", "/selin2.jpg", "/selin3.jpg", "/selin4.jpg", "/selin5.jpg",
  "/selin6.jpg", "/selin7.jpg", "/selin8.jpg", "/selin9.jpg", "/selin10.jpg",
  "/selin11.jpg", "/selin12.jpg", "/selin13.jpg", "/selin14.jpg", "/selin15.jpg",
  "/selin16.jpg", "/selin17.jpg",
];

const eventDate = new Date("2026-04-01T18:00:00");

export default function Home() {
  const [bgIndex, setBgIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [coming, setComing] = useState<null | boolean>(null);
  const [name, setName] = useState("");
  const [companion, setCompanion] = useState("");
  const [kids, setKids] = useState("");
  const [errors, setErrors] = useState({ name: false, companion: false, kids: false });
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);

  // Предзагрузка изображений
  useEffect(() => {
    photos.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Инициализация аудио
  useEffect(() => {
    const audioEl = new Audio("/music.mp3");
    audioEl.loop = true;
    setAudio(audioEl);
    return () => {
      audioEl.pause();
    };
  }, []);

  // Смена фона каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Таймер обратного отсчёта (исправлено!)
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = eventDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Отслеживание ширины окна
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Функция отправки в Telegram
  const sendToTelegram = async (response: "Приду" | "Не приду") => {
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn("Telegram token or chat ID missing");
      return;
    }

    const message = `
Новый ответ на приглашение:
👤 Имя: ${name.trim() || "не указано"}
👥 Спутники: ${companion.trim() || "не указано"}
👶 Дети: ${kids.trim() || "не указано"}
📌 Ответ: ${response}
    `.trim();

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
      });
      console.log('Сообщение отправлено в Telegram');
    } catch (error) {
      console.error('Ошибка отправки в Telegram:', error);
    }
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {
      name: !name.trim(),
      companion: !companion.trim(),
      kids: !kids.trim(),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleYes = () => {
    if (validateForm()) {
      sendToTelegram("Приду");
      setComing(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleNo = () => {
    if (!name.trim()) {
      setErrors({ name: true, companion: false, kids: false });
    } else {
      sendToTelegram("Не приду");
      setComing(false);
      new Audio("/sad.mp3").play().catch(() => {});
    }
  };

  const toggleMusic = () => {
    if (!audio) return;
    if (musicPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setMusicPlaying(!musicPlaying);
  };

  // Адаптивные размеры
  const getNameFontSize = () => {
    if (windowWidth > 768) return "25rem";
    if (windowWidth > 480) return "15rem";
    return "10rem";
  };
  const getSubtitleFontSize = () => {
    if (windowWidth > 768) return "3rem";
    if (windowWidth > 480) return "2.5rem";
    return "2rem";
  };
  const getDateFontSize = () => {
    if (windowWidth > 768) return "2.8rem";
    if (windowWidth > 480) return "2.2rem";
    return "1.8rem";
  };

  return (
    <>
      <div
        className="bg-layer"
        style={{
          backgroundImage: `url(${photos[bgIndex]})`,
          transition: 'background-image 1.5s ease-in-out',
        }}
      />
      <div className="overlay" />

      <main className="main">
        <section className="hero">
          <motion.h1
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              fontSize: getNameFontSize(),
              lineHeight: 1,
              margin: 0,
              color: "#f0f0f0",
              textShadow: "0 0 30px rgba(255,200,220,0.4)",
              fontFamily: "inherit",
            }}
          >
            Селин
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            style={{
              fontSize: getSubtitleFontSize(),
              margin: "20px 0",
              fontFamily: "inherit",
            }}
          >
            Приглашает Вас отметить
            <br />
            <span style={{ fontWeight: 700 }}>Свой первый день рождения</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{
              fontSize: getDateFontSize(),
              opacity: 0.9,
              marginTop: "30px",
              fontFamily: "inherit",
            }}
          >
            Среда • 1 Апреля • 18:00 • Алматы
          </motion.div>
        </section>

        <section className="countdown">
          <h2>До праздника осталось</h2>
          <div className="timer">
            <div className="timer-item">
              <span className="timer-number">{timeLeft.days}</span>
              <span className="timer-label">дней</span>
            </div>
            <div className="timer-item">
              <span className="timer-number">{timeLeft.hours}</span>
              <span className="timer-label">часов</span>
            </div>
            <div className="timer-item">
              <span className="timer-number">{timeLeft.minutes}</span>
              <span className="timer-label">минут</span>
            </div>
          </div>
        </section>

        <section className="experience">
          <h2>Что вас ждёт</h2>
          <div className="cards">
            <div className="card">
              <h3>Тұсау кесер</h3>
              <p>Традиционная церемония — важный и красивый момент.</p>
            </div>
            <div className="card">
              <h3>Камерный формат</h3>
              <p>Уютная атмосфера, национальная кухня, живая домбра, ведущий с лёгкой развлекательной программой.</p>
            </div>
            <div className="card">
              <h3>Развлечения</h3>
              <p>Candy bar, аниматоры и подарки для маленьких гостей.</p>
            </div>
          </div>
        </section>

        <section className="location">
          <h2>Локация</h2>
          <div className="map-container premium-map">
            <div id="map" style={{ width: '100%', height: '450px', borderRadius: '30px' }}></div>
          </div>
          <a
            id="map-link"
            href="https://2gis.kz/almaty/geo/70000001080937725/76.841214,43.213781"
            target="_blank"
            rel="noopener noreferrer"
          >
            Открыть в 2ГИС
          </a>
        </section>

        <section className="rsvp">
          <h2>Подтверждение</h2>
          {coming === null && (
            <div className="rsvp-form">
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Ваше Имя"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: false }));
                  }}
                  className={errors.name ? "input-error" : ""}
                />
                <AnimatePresence>
                  {errors.name && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="error-message"
                    >
                      Пожалуйста, укажите Ваше имя
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Кто будет с вами?"
                  value={companion}
                  onChange={(e) => {
                    setCompanion(e.target.value);
                    setErrors((prev) => ({ ...prev, companion: false }));
                  }}
                  className={errors.companion ? "input-error" : ""}
                />
                <AnimatePresence>
                  {errors.companion && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="error-message"
                    >
                      Укажите, кто идёт с вами
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Сколько детей будет с вами?"
                  value={kids}
                  onChange={(e) => {
                    setKids(e.target.value);
                    setErrors((prev) => ({ ...prev, kids: false }));
                  }}
                  className={errors.kids ? "input-error" : ""}
                />
                <AnimatePresence>
                  {errors.kids && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="error-message"
                    >
                      Укажите количество детей
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="rsvp-buttons">
                <button onClick={handleYes} className="btn-yes">Я приду</button>
                <button onClick={handleNo} className="btn-no">Я не приду</button>
              </div>
            </div>
          )}
          {coming === true && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rsvp-yes"
            >
              <p className="rsvp-yes-title">Ждём Вас!</p>
              <p className="rsvp-yes-name">
                {name}{companion ? ` и ${companion}` : ''}, до встречи!
              </p>
            </motion.div>
          )}
          {coming === false && (
            <div className="rsvp-no">
              <p>Нам будет вас не хватать</p>
            </div>
          )}
        </section>

        <footer>
          <p>С Любовью и Уважением,</p>
          <p>Бейбарс, Мереке, Селин</p>
        </footer>

        <button className="music-button" onClick={toggleMusic}>
          {musicPlaying ? "🔊" : "🔇"}
        </button>

        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const lat = 43.213781;
              const lon = 76.841214;
              const placeName = "Ресторан Орта";

              if (!window.DG) {
                const script = document.createElement('script');
                script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
                script.onload = initMap;
                document.head.appendChild(script);
              } else {
                initMap();
              }

              function initMap() {
                window.DG.then(function() {
                  const map = window.DG.map('map', {
                    center: [lat, lon],
                    zoom: 17,
                    zoomControl: true,
                    fullscreenControl: true,
                    theme: 'light'
                  });

                  const marker = window.DG.marker([lat, lon]).addTo(map);
                  marker.bindPopup(placeName).openPopup();

                  const link = document.getElementById('map-link');
                  if (link) {
                    link.href = \`https://2gis.kz/almaty/geo/70000001080937725/\${lon},\${lat}\`;
                  }
                });
              }
            })();
          `
        }} />
      </main>

      <style jsx>{`
        .bg-layer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          transition: background-image 1.5s ease-in-out;
          z-index: -2;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          z-index: -1;
        }

        .main {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          color: white;
          font-family: 'DisneyPark', serif;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        section {
          width: 100%;
          margin: 60px 0;
          text-align: center;
        }

        h2 {
          font-size: 3rem;
          font-weight: 300;
          margin-bottom: 40px;
          letter-spacing: 2px;
        }

        .timer {
          display: flex;
          justify-content: center;
          gap: 50px;
          flex-wrap: wrap;
        }
        .timer-item {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 30px 40px;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .timer-number {
          display: block;
          font-size: 5rem;
          font-weight: 700;
          line-height: 1;
          color: #f9a8d4;
        }
        .timer-label {
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          opacity: 0.8;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-top: 20px;
        }
        .card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 40px 20px;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          transition: transform 0.3s;
        }
        .card:hover {
          transform: translateY(-10px);
        }
        .card h3 {
          font-size: 2.5rem;
          margin-bottom: 15px;
          color: #f9a8d4;
        }
        .card p {
          font-size: 1.8rem;
          line-height: 1.5;
          opacity: 0.9;
        }

        .map-container {
          max-width: 800px;
          margin: 0 auto;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .premium-map {
          border: 2px solid rgba(255,255,255,0.2);
          transition: box-shadow 0.3s ease;
        }
        .premium-map:hover {
          box-shadow: 0 30px 60px rgba(236,72,153,0.2);
        }
        .location a {
          display: inline-block;
          margin-top: 20px;
          color: #f9a8d4;
          font-size: 1.8rem;
          text-decoration: underline;
        }

        .rsvp-form {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 35px;
        }
        .input-wrapper {
          position: relative;
        }
        input {
          width: 100%;
          font-size: 1.5rem;
          padding: 18px 28px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(5px);
          color: white;
          outline: none;
          transition: border 0.2s;
        }
        input::placeholder {
          color: rgba(255,255,255,0.7);
        }
        input:focus {
          border-color: #f9a8d4;
          background: rgba(255,255,255,0.2);
        }
        .input-error {
          border-color: #ff6b6b;
        }
        .error-message {
          position: absolute;
          bottom: -30px;
          left: 20px;
          font-size: 2rem;
          color: #ff8787;
          text-shadow: none;
          background: rgba(0,0,0,0.5);
          padding: 4px 12px;
          border-radius: 20px;
          backdrop-filter: blur(4px);
          white-space: nowrap;
        }
        .rsvp-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 10px;
        }
        button {
          padding: 16px 40px;
          border-radius: 50px;
          border: none;
          font-size: 1.6rem;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }
        .btn-yes {
          background: #ec4899;
          color: white;
          box-shadow: 0 10px 20px rgba(236,72,153,0.3);
        }
        .btn-yes:hover {
          background: #db2777;
          transform: scale(1.05);
        }
        .btn-no {
          background: rgba(255,255,255,0.2);
          color: white;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255,255,255,0.3);
        }
        .btn-no:hover {
          background: rgba(255,255,255,0.3);
        }
        .rsvp-yes, .rsvp-no {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 50px;
          border-radius: 40px;
          max-width: 500px;
          margin: 0 auto;
        }
        .rsvp-yes-title {
          font-size: 5rem;
          margin-bottom: 20px;
        }
        .rsvp-yes-name {
          font-size: 2rem;
        }
        .rsvp-no p {
          font-size: 2rem;
        }

        footer {
          margin-top: 80px;
          font-size: 1.8rem;
          opacity: 0.8;
          text-align: center;
        }
        footer p {
          margin: 5px 0;
        }

        .music-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          font-size: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
          transition: 0.3s;
          padding: 0;
        }
        .music-button:hover {
          background: rgba(255,255,255,0.3);
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          h2 { font-size: 2.5rem; }
          .timer-item { padding: 20px 25px; }
          .timer-number { font-size: 3.5rem; }
          .card h3 { font-size: 2.2rem; }
          .card p { font-size: 1.5rem; }
          .location a { font-size: 1.5rem; }
          .error-message { font-size: 1.6rem; bottom: -28px; }
          footer { font-size: 1.5rem; }
        }

        @media (max-width: 480px) {
          h2 { font-size: 2rem; }
          .timer-item { padding: 15px 15px; }
          .timer-number { font-size: 2.5rem; }
          .card h3 { font-size: 1.8rem; }
          .card p { font-size: 1.2rem; }
          .location a { font-size: 1.2rem; }
          input { font-size: 1.2rem; padding: 14px 20px; }
          .rsvp-buttons { flex-direction: column; gap: 10px; }
          button { font-size: 1.4rem; padding: 14px; }
          .error-message { font-size: 1.3rem; bottom: -25px; left: 10px; }
          .rsvp-yes-title { font-size: 3.5rem; }
          .rsvp-yes-name { font-size: 1.5rem; }
          .rsvp-no p { font-size: 1.5rem; }
          footer { font-size: 1.2rem; }
        }
      `}</style>
    </>
  );
}