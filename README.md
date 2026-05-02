# Personal Investments Management System (AMS)

This application is a personal investments management system that allows users to track their investments, transactions, and allocations. It provides a web interface for managing personal financial data with features like adding investments, viewing transaction history, and visualizing asset allocations.

## Technologies Used

### Backend
- **ASP.NET Core Web API**: Framework for building RESTful APIs and web services.
- **Entity Framework Core**: Object-Relational Mapping (ORM) tool for database operations and migrations.
- **C#**: Primary programming language for the backend logic.
- **SQLite**: Lightweight relational database management system.

### Frontend
- **React**: JavaScript library for building dynamic user interfaces with components.
- **Vite**: Fast build tool and development server for modern web projects.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **PostCSS**: Tool for transforming CSS with JavaScript plugins.

### Additional Features
- **Internationalization (i18n)**: Support for multiple languages in the frontend.
- **Database Migrations**: Automated schema updates using Entity Framework Core.
- **Domain-Driven Design**: Organized into Application, Domain, and Infrastructure layers.

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) or later
- [Node.js](https://nodejs.org/) (version 18 or later) and npm

### Backend Setup
1. Navigate to the root directory of the project.
2. Restore NuGet packages:
   ```
   dotnet restore
   ```
3. Build the solution:
   ```
   dotnet build
   ```
4. Run the backend API:
   ```
   dotnet run --project src/WebAPI/WebAPI.csproj
   ```
   The API will start on `http://localhost:5000` (or `https://localhost:5001` if HTTPS is enabled).

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

### Database
The application uses Entity Framework Core with SQLite. On first run, the database will be created and seeded with initial data via migrations. The database file is typically stored locally (e.g., `app.db`). Ensure your connection string is configured in `src/WebAPI/appsettings.json`.

### Building for Production
- **Backend**: Run `dotnet publish src/WebAPI/WebAPI.csproj -c Release` to create a production build.
- **Frontend**: Run `npm run build` in the `frontend` directory to generate optimized assets.