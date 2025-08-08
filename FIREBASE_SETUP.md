# Firebase Setup Guide for Toasty's Study Buddy

## 🚀 Quick Setup

Your Firebase project is already configured! The app is ready to use with your Firebase project settings.

## 📋 Current Configuration

Your Firebase project is configured with:

- **Project ID**: `toasty-study-buddy`
- **Auth Domain**: `toasty-study-buddy.firebaseapp.com`
- **Storage Bucket**: `toasty-study-buddy.firebasestorage.app`
- **API Key**: `AIzaSyB5mcj3qNQi9InlIYruvNaDXx2V1Dw6NmY`

## 🔧 Firebase Console Setup

### 1. Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `toasty-study-buddy` project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Email/Password** authentication
5. Optionally enable **Email verification**

### 2. Set up Firestore Database

1. Go to **Firestore Database** in the Firebase Console
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location (choose the closest to your users)
5. Click **Done**

### 3. Set up Security Rules (Optional)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Decks belong to users
    match /decks/{deckId} {
      allow read, write: if request.auth != null &&
        (resource.data.ownerId == request.auth.uid ||
         resource.data.visibility == 'public');
    }

    // Cards belong to decks
    match /cards/{cardId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/decks/$(resource.data.deckId)) &&
        get(/databases/$(database)/documents/decks/$(resource.data.deckId)).data.ownerId == request.auth.uid;
    }
  }
}
```

## 🎯 Features Available

### ✅ Ready to Use

- **User Registration**: Users can create accounts with email/password
- **User Login**: Secure authentication with Firebase Auth
- **User Profiles**: Stored in Firestore with settings
- **Real-time Updates**: Automatic sync with Firestore
- **Secure Data**: User data is protected by Firebase security rules

### 🔄 Next Steps

1. **Test Authentication**: Try registering and logging in
2. **Add OpenAI Key**: Get an API key from [OpenAI](https://platform.openai.com/)
3. **Test OCR**: Upload an image to test the OCR functionality
4. **Create Decks**: Start building your flashcard decks

## 🔑 Environment Variables

Update your `.env.local` file with your OpenAI API key:

```env
# OpenAI Configuration (Required for Q/A generation)
OPENAI_API_KEY=your_openai_api_key_here

# Other settings (optional for development)
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
TESSERACT_LANG=eng
```

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

## 🔍 Troubleshooting

### Common Issues

1. **Authentication not working**

   - Check if Email/Password auth is enabled in Firebase Console
   - Verify your Firebase config in `src/lib/firebase/config.ts`

2. **Database errors**

   - Ensure Firestore is created in your Firebase project
   - Check security rules if you're getting permission errors

3. **OCR not working**

   - Make sure you have an OpenAI API key
   - Check the browser console for errors

4. **Build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that all environment variables are set

## 📞 Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your Firebase project settings
3. Ensure all environment variables are correctly set
4. Check the Firebase Console for any service issues

## 🎉 Ready to Go!

Your Toasty Study Buddy app is now configured with Firebase and ready to use! Users can:

- Register and login securely
- Upload notes and convert them to flashcards
- Study with spaced repetition
- Track their progress

Happy learning! 🧠⚡
