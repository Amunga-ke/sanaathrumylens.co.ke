// src/lib/firebaseAdmin.js

import admin from "firebase-admin";

// Prevent re-initialization during hot reload (important in Next.js)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            // Replace escaped \n with actual new lines
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
    });
}

// Export Firestore database instance
const db = admin.firestore();

export { db };