# Gallan - Modern Messaging App

Gallan is a modern, feature-rich messaging application designed for seamless communication. The name "Gallan" is derived from a Punjabi term that means "conversations" or "to talk," reflecting the app's core purpose of fostering meaningful interactions. The application is a WhatsApp clone with most of the features of the original app.

## Features

- **Real-Time Messaging**: Send and receive messages instantly
- **Beautiful WhatsApp-like UI**: Authentic dark theme design with smooth animations and transitions
- **Responsive Layout**: Works perfectly on both mobile and desktop devices
- **Message Status Tracking**: See when messages are sent, delivered, and read
- **Data Persistence**: Supports both in-memory storage and MongoDB database
- **Pop-in/Pop-out Animations**: Engaging and dynamic user experience
- **Desktop Application**: Available as both web and desktop application

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with ShadCN UI components
- **State Management**: React Query for data fetching and caching
- **Form Validation**: React Hook Form with Zod
- **Routing**: Wouter for lightweight routing
- **Backend**: Express.js server with RESTful API
- **Database**: MongoDB integration for persistent storage
- **Desktop Support**: Electron.js for cross-platform desktop application

## Getting Started

### Web Version
1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Navigate to the provided local URL
5. Login with the demo user (username: `demo-user`, password: `password123`)

### Desktop Version
1. Build the desktop application with `bash build-electron-app.sh`
2. Find the executable in the `releases` directory
3. Install and run the application
4. Login with the demo user (username: `demo-user`, password: `password123`)

### MongoDB Configuration
To use MongoDB for persistent storage:
1. Set up a MongoDB database (MongoDB Atlas or local)
2. Add your MongoDB connection string as the `MONGODB_URI` environment variable
3. Restart the application to use MongoDB instead of in-memory storage

## Usage

1. Register a new account or login with existing credentials
2. Start new conversations from the "New Chat" option
3. Send messages and track their delivery status
4. View and update your profile settings
5. Access additional options from the menu

## UI Features

- Official WhatsApp dark theme with authentic color scheme (#00a884 green)
- Smooth animations for user interactions
- Consistent design language matching WhatsApp Web
- Responsive design that works on mobile, tablet, and desktop
- Interactive elements with visual feedback

## Demo Account

A demo user is automatically created for testing purposes:
- **Username**: demo-user
- **Password**: password123

Additional contacts with Arabic status messages are also included.

## Credits

Made by Zylox, Coded by Moeed Mirza

## License

This project is licensed under the MIT License - see the LICENSE file for details.