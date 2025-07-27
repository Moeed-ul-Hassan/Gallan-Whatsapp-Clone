# Connext - Modern Messaging App

![Connext Banner](assets/banner-dark.png)

Connext is a modern, feature-rich messaging application designed for seamless communication.  
The name **Connext** is a blend of *connect* and *next*, symbolizing the future of conversations and meaningful digital interactions.  
It also echoes the spirit of *Gallan*, a Punjabi word for conversations — keeping the roots of real talk alive.

> ⚡ A full WhatsApp clone with sleek animations, real-time messaging, and a desktop app built with Electron.

---

## ✨ Preview

https://github.com/yourusername/connext/assets/preview-chat-demo.gif  
*Instant messaging in action — with smooth delivery ticks and clean UI*

![Chat UI Demo](assets/chat-preview.gif)

---

## 🔥 Features

- ✅ **Real-Time Messaging** – Powered by WebSockets (or long-polling fallback)
- 🌑 **WhatsApp-like UI** – Authentic dark theme, polished layout
- 📱 **Responsive** – Optimized for mobile, tablet, and desktop
- 📤 **Message Status Tracking** – Sent, delivered, and read indicators
- 💾 **Data Persistence** – MongoDB + In-Memory fallback
- 🌀 **Pop-in Animations** – Snappy transitions across screens
- 🖥️ **Desktop App Support** – Electron-based installable app

---

## ⚙️ Tech Stack

| Layer        | Tech                                                  |
|--------------|--------------------------------------------------------|
| **Frontend** | React (TypeScript), Tailwind CSS, ShadCN UI            |
| **State**    | React Query                                            |
| **Forms**    | React Hook Form + Zod                                  |
| **Routing**  | Wouter                                                 |
| **Backend**  | Express.js REST API                                    |
| **Database** | MongoDB (via Mongoose)                                 |
| **Desktop**  | Electron.js                                            |

---

## 🚀 Getting Started

### Web Version

```bash
git clone https://github.com/Moeed-ul-Hassan/connext.git
cd connext
npm install
npm run dev
