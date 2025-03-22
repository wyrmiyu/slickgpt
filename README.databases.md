# Database Configuration for SlickGPT

This document provides an overview of the different storage options available for SlickGPT, along with configuration instructions, setup examples, and security considerations.

## Storage Options

SlickGPT supports the following storage options:
1. Firebase
2. MongoDB
3. Self-hosted Database
4. Local Storage (IndexedDB)

### 1. Firebase

Firebase is a cloud-based platform that provides a real-time NoSQL database. It is suitable for applications that require real-time data synchronization and sharing.

#### Configuration

To use Firebase, set the following environment variables in your `.env` file:

```
STORAGE_TYPE=firebase
FIREBASE_APIKEY=your_firebase_api_key
FIREBASE_AUTHDOMAIN=your_firebase_auth_domain
FIREBASE_DATABASEURL=your_firebase_database_url
FIREBASE_PROJECTID=your_firebase_project_id
FIREBASE_STORAGEBUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGINGSENDERID=your_firebase_messaging_sender_id
FIREBASE_APPID=your_firebase_app_id
```

#### Setup Example

1. Create a Firebase project in the Firebase Console.
2. Obtain the necessary credentials and set them in the `.env` file as shown above.
3. Ensure that the Firebase Realtime Database is enabled in your Firebase project.

#### Security Considerations

- Ensure that your Firebase credentials are kept secure and not exposed in the client-side code.
- Use Firebase security rules to control access to your database.

### 2. MongoDB

MongoDB is a NoSQL database that stores data in JSON-like documents. It is suitable for users who prefer to manage their own database infrastructure.

#### Configuration

To use MongoDB, set the following environment variables in your `.env` file:

```
STORAGE_TYPE=mongodb
DATABASE_URL=your_mongodb_connection_string
```

#### Setup Example

1. Install MongoDB on your server or use a managed MongoDB service like MongoDB Atlas.
2. Obtain the connection string for your MongoDB instance and set it in the `.env` file as shown above.
3. Ensure that the MongoDB server is running and accessible from your application.

#### Security Considerations

- Use strong authentication and authorization mechanisms to secure access to your MongoDB database.
- Ensure that your MongoDB connection string is kept secure and not exposed in the client-side code.
- Regularly back up your MongoDB data to prevent data loss.

### 3. Self-hosted Database

A self-hosted database is suitable for users who prefer to use their own database infrastructure with a REST API. SlickGPT can interact with any self-hosted database that provides a REST API without knowing the backend details.

#### Configuration

To use a self-hosted database, set the following environment variables in your `.env` file:

```
STORAGE_TYPE=selfhosted
DATABASE_URL=your_self_hosted_database_api_url
```

#### Setup Example

1. Set up your self-hosted database and ensure it provides a REST API.
2. Obtain the API URL for your self-hosted database and set it in the `.env` file as shown above.
3. Ensure that the self-hosted database is running and accessible from your application.

#### Security Considerations

- Use strong authentication and authorization mechanisms to secure access to your self-hosted database.
- Ensure that your self-hosted database API URL is kept secure and not exposed in the client-side code.
- Regularly back up your self-hosted database data to prevent data loss.

### 4. Local Storage (IndexedDB)

IndexedDB is a client-side storage solution suitable for users running the application locally. It provides a way to store data persistently in the user's browser.

#### Configuration

To use IndexedDB, set the following environment variable in your `.env` file:

```
STORAGE_TYPE=local
```

#### Setup Example

1. No additional setup is required for IndexedDB. It is automatically used when the `STORAGE_TYPE` is set to `local`.

#### Security Considerations

- Ensure that sensitive data is encrypted before storing it in IndexedDB.
- Be aware that data stored in IndexedDB is accessible to the user and can be cleared by the user.
