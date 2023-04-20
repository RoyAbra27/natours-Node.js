# Natours 

Welcome to Natours, 
This is a Node.js web application for a tour company. Its a RESTful API for managing tours, users, bookings, authenthication and payment.

https://natours-travel.up.railway.app/

## Technologies Used

This project utilizes the following technologies, middleware packages, APIs, and templating engine:

- Node.js
- Express.js
- Pug (templating engine) for creating the front-end views
- MongoDB (with Mongoose) for database management
- JSON Web Tokens (JWT) for user authentication
- Multer for handling file uploads
- Sharp for image processing
- TomTom API for geocoding and map services
- Stripe for payment processing
- SendGrid for email notifications
- Helmet for securing HTTP headers
- RateLimiter for rate limiting requests
- HPP (HTTP Parameter Pollution) for protecting against parameter pollution attacks
- ExpressMongoSanitize for sanitizing MongoDB queries to prevent SQL injection attacks

## Getting Started

To get started with the Natours Node.js project, follow these steps:

1. Clone the repository: `git clone https://github.com/RoyAbra27/natours-Node.js.git`
2. Install the dependencies: `npm install`
3. Set up the environment variables as described in the [Environment Variables](#environment-variables) section.
4. Start the development server: `npm run dev`
5. Open your web browser and navigate to `http://localhost:3000` to access the Natours API.

## Environment Variables

The Natours Node.js project requires the following environment variables to be configured:

- `NODE_ENV`: The environment in which the application is running (e.g., `development`, `production`, `test`).
- `PORT`: The port number on which the application should listen for incoming requests.
- `DATABASE`: The connection string for MongoDB database.
- `DATABASE_PASSWORD`: The password for the MongoDB database.
- `JWT_SECRET`: The secret key for JWT authentication.
- `JWT_EXPIRES_IN`: The expiration time for JWT tokens.
- `JWT_COOKIE_EXPIRES_IN`: The expiration time for JWT cookies.
- `EMAIL_FROM`: The email address for sending emails.
- `SENDGRID_SERVER`: The SMTP server for SendGrid.
- `SENDGRID_USERNAME`: The API key for SendGrid.
- `SENDGRID_PASSWORD`: The password for SendGrid.
- `STRIPE_SECRET_KEY`: The secret key for Stripe.

Please make sure to set these environment variables in a secure manner, such as using a `.env` file or a configuration management tool, and do not include sensitive information in your codebase or public repositories.

