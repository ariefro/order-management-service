# Order Management API

## Overview

This project is a RESTful API built using Express.js, designed to manage products and orders. The API allows for CRUD operations on orders, product management, order item management, and includes features like filtering, and pagination.

##### Technology Stack
- Programming Language: TypeScript
- Framework: [Express.js](https://expressjs.com/)
- Database: PostgreSQL with [Prisma ORM](https://www.prisma.io/)

##### Requirements
- [Node.js](https://nodejs.org/en)
- [PostgreSQL](https://www.postgresql.org/)

##### Design and Features

For an overview of the features to be worked on, see this [Figma](https://www.figma.com/file/6vQxQfE0H9Dg12CM2BR73y/Frontend-Challenge?type=design&t=FumwiczeZ0MnMq3J-6).

The Figma link provides a visual representation and planning of the application's frontend and features.

## Documentation
##### DB Documentation

Access the [DB documentation](https://dbdocs.io/ariefromadhon/Order-Management). Password: `secret`.

## Getting Started
##### Install dependencies
 To run the project in development mode simply just install all the dependencies

```
pnpm install
```

##### Create a Configuration File
Create a file named `.env` in the root directory of your project. This file will be used to define environment variables necessary for the application. In the `.env` file, define the following environment variables:

| Key            | Desc                        |
| -------------- | --------------------------- |
| PORT       | Application Port            |
| ALLOWED_ORIGIN_URL  | Base URL of the allowed frontend for communication with the backend (CORS) |
| DB_URL    | Connection string for your PostgreSQL database           |

##### Database Setup
Run the following command to apply migrations.

```
pnpm db:migrate
```

Seeding to database
```
pnpm db:seed
```

##### Run the Application
Run the following command to run the project.

```
pnpm dev
```
