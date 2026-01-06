# CRM Application

A modern, full-stack Customer Relationship Management (CRM) application built with React, Node.js, Express, and MongoDB.

## Features

- 📊 **Modern Dashboard** - Overview of customer statistics and analytics
- 👥 **Customer Management** - Complete CRUD operations for customer records
- 🔍 **Advanced Search & Filtering** - Search customers by multiple criteria
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 📈 **Data Visualization** - Charts and graphs for better insights
- 🚀 **Fast Performance** - Optimized queries and pagination
- 🔒 **Data Validation** - Comprehensive form validation and error handling

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **CSV Parser** - For importing CSV data

### Frontend
- **React 18** - Frontend library
- **Material-UI (MUI)** - UI component library
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **React Router** - Navigation
- **Recharts** - Data visualization

## Project Structure

```
crm-app/
├── backend/
│   ├── models/
│   │   └── Customer.js
│   ├── routes/
│   │   └── customers.js
│   ├── scripts/
│   │   └── importCSV.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── customers/
    │   │   │   ├── CustomerList.jsx
    │   │   │   ├── CustomerDetail.jsx
    │   │   │   └── CustomerForm.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── Layout.jsx
    │   ├── hooks/
    │   │   └── useCustomers.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Clone and Navigate

```bash
cd crm-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start MongoDB (make sure MongoDB is running on localhost:27017)
# You can use MongoDB Compass or command line

# Import CSV data
npm run import-csv

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Environment Variables

Backend `.env` file (already created):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crmdb
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

## Usage

### Dashboard
- View summary statistics of all customers
- See charts showing customer distribution by state
- Quick access to recent customers

### Customer Management
- **List View**: Browse all customers with pagination, search, and filters
- **Add Customer**: Create new customer records with comprehensive form validation
- **Edit Customer**: Update existing customer information
- **View Details**: See complete customer profile with organized sections
- **Delete**: Remove customers (with confirmation)
- **Bulk Operations**: Select and delete multiple customers

### Search & Filter Features
- Search by name, email, phone, loan ID, city, or state
- Filter by status (Active, NPA, Closed, Inactive)
- Filter by state and city
- Sort by any column
- Pagination with customizable page sizes

## API Endpoints

### Customer Routes
- `GET /api/customers` - Get all customers (with pagination, search, filters)
- `GET /api/customers/:id` - Get customer by ID
- `GET /api/customers/loan/:loanId` - Get customer by loan ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `DELETE /api/customers` - Bulk delete customers
- `GET /api/customers/stats/dashboard` - Get dashboard statistics

### Health Check
- `GET /api/health` - API health status

## Data Import

The application includes a CSV import script that:
- Parses the FULL_DUMP.csv file
- Maps CSV columns to the database schema
- Handles data type conversions
- Provides detailed import progress
- Handles duplicate records gracefully

To import data:
```bash
cd backend
npm run import-csv
```

## Database Schema

The Customer model includes:
- **Personal Info**: Name, DOB, Gender, PAN, Aadhaar, Nationality
- **Contact Info**: Phone, Mobile, Email, Address, City, State, PIN
- **Employment**: Occupation, Profession, Employer details
- **Loan Details**: Amounts, EMI, Tenure, Interest Rate, Dates
- **Financial Status**: Overdue amounts, NPA status
- **System Fields**: Created/Updated timestamps, Status

## Performance Features

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Server-side pagination for large datasets
- **Caching**: React Query for intelligent data caching
- **Lazy Loading**: Components load only when needed
- **Debounced Search**: Prevents excessive API calls
- **Compressed Responses**: Gzip compression for faster loading

## Security Features

- **Input Validation**: Comprehensive validation on both client and server
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configured for specific origins
- **Helmet.js**: Security headers
- **Data Sanitization**: Protection against injection attacks

## Responsive Design

- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface
- Collapsible sidebar navigation
- Optimized data tables for mobile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Happy CRM-ing! 🚀**