# BulkBro 🏋️‍♂️

BulkBro is a premium, high-performance gym logging and fitness tracking application designed for serious athletes and fitness enthusiasts. Built with a modern tech stack, it provides a seamless experience for tracking workouts, monitoring progress, and visualizing gains.

![BulkBro Preview](https://via.placeholder.com/1200x600.png?text=BulkBro+Premium+Fitness+Tracker)

## ✨ Key Features

- **🔥 Real-time Workout Logging**: Intuitive interface to track sets, reps, and weights as you train.
- **📊 Dynamic Progress Insights**: Beautifully rendered charts powered by Chart.js to visualize your strength and weight trends over time.
- **🛠️ Custom Template Engine**: Build and save your own workout programs with a powerful drag-and-drop editor.
- **📈 Comprehensive History**: A detailed log of all past sessions, allowing you to compare performance across weeks and months.
- **⚖️ Body Metrics Tracking**: Monitor body weight and body fat percentages with dedicated logging tools.
- **📄 Professional PDF Exports**: Generate and download detailed PDF reports of your workout history and progress.
- **🌙 Premium UI/UX**: Sleek, responsive design with full Dark/Light mode support tailored for the gym environment.
- **🔒 Secure Data**: Real-time cloud sync and authentication powered by Firebase.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Vanilla CSS (Premium Custom Theme)
- **State & Logic**: Context API, Custom Hooks
- **Backend/DB**: Firebase (Firestore, Auth, Storage)
- **Visuals**: Lucide Icons, Chart.js, React-Chartjs-2
- **Utilities**: Date-fns, JsPDF, Hello-Pangea/DND

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/arunvk405/gymLog.git
   cd gymLog
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Firebase Configuration**:
   The project uses Firebase for backend services. Ensure your configuration in `src/firebase.js` is set up correctly (pre-configured for this repo).

### Running Locally

To start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready bundle:
```bash
npm run build
```

## 📱 Mobile First

BulkBro is designed with a **mobile-first approach**, ensuring that logging your sets mid-workout is as fast and efficient as possible on any device.

## 📄 License

This project is licensed under the MIT License.

## 🔐 Firebase Security Rules

For the app to function correctly, ensure your Firestore rules allow access to the collections. Here is a recommended configuration:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Exercises: Publicly readable, admin writeable
    match /exercises/{exercise} {
      allow read: if true;
      allow write: if false; // Only via Firebase Console
    }
    
    // User Data: Read/Write only by owner
    match /workouts/{workout} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /templates/{template} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /weight_history/{entry} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

