# NIT Jamshedpur - Class Routine Management System

A robust, real-time MERN stack application designed to streamline the scheduling and management of academic timetables for the National Institute of Technology Jamshedpur. 

This system provides an intuitive drag-and-drop-style builder to manage classes, faculties, subjects, and batches while automatically preventing scheduling conflicts (e.g., double-booking a professor or a room).

## ✨ Features

- **Routine Builder:** An interactive grid to assign subjects, faculties, and rooms to specific time slots and days.
- **Real-Time Conflict Checking:** Automatically checks for and prevents double-booking of faculties and rooms across different batches in real-time.
- **Auto-Save:** All routine modifications are silently debounced and auto-saved to the database, ensuring zero data loss and real-time syncing.
- **Export to PDF & Word:** Generate officially formatted timetables complete with the NIT Jamshedpur logo and headers in both PDF and DOCX formats.
- **Faculty & Batch Management:** Full CRUD (Create, Read, Update, Delete) capabilities for Faculties, Subjects, and Batches.
- **Personalized Faculty Routines:** Dedicated views for faculties to see their specific teaching schedules across all batches.

## 🚀 Tech Stack

- **Frontend:** React.js, Vite, CSS (Glassmorphism design), Lucide React (Icons), jsPDF & Docx (Exporting).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (via Mongoose).

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Running locally or via MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/abhishekkr2652/routine_maker.git
cd routine_maker
```

### 2. Setup the Backend
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add your MongoDB connection string and Port:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/nitjsr-routine
```
Start the backend server:
```bash
npm start
```
*(The backend runs on `http://localhost:5000`)*

### 3. Setup the Frontend
Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```
*(The frontend runs on `http://localhost:5173`)*

## 💡 How to Use

1. **Setup Core Data:** Start by navigating to the **Manage Subjects**, **Manage Faculties**, and **Manage Batches** pages. Add all the required academic data here. You can edit or delete entries anytime.
2. **Build a Routine:** Navigate to the **Routine Builder**. Select a batch from the dropdown. Click the `+` button on any free slot in the grid to schedule a class. The system will alert you if the selected room or faculty is already booked for that specific time!
3. **Exporting:** Once a routine is built, use the "Export PDF" or "Export Word" buttons to download a formalized copy.
4. **Faculty View:** Navigate to the **Faculty Timetable** and select a faculty member to see their personalized class schedule.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).