import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, getAuth } from '../utils/firebase';
import { generateToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

/**
 * Register a new user with onboarding questionnaire details
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name, usageType, currentManagementMethod } = req.body;
    const db = getDb();

    // Check if email already exists in Firestore
    const emailQuery = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (!emailQuery.empty) {
      res.status(409).json({
        status: 'error',
        message: 'A user with this email address already exists.',
      });
      return;
    }

    // Hash the password with bcrypt (10 rounds)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create unique doc reference in users collection
    const userDocRef = db.collection('users').doc();
    const userId = userDocRef.id;

    const newUser = {
      id: userId,
      email,
      passwordHash,
      name,
      googleId: null,
      facebookId: null,
      usageType,
      currentManagementMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save document to Firestore
    await userDocRef.set(newUser);

    // Generate JWT token
    const token = generateToken({ userId });

    // Respond with user details (never send passwordHash back!)
    res.status(201).json({
      status: 'success',
      message: 'Registration successful!',
      data: {
        token,
        user: {
          id: userId,
          name,
          email,
          usageType,
          currentManagementMethod,
          createdAt: newUser.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Authenticate existing user with email and password
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const db = getDb();

    // Find user by email in Firestore
    const emailQuery = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (emailQuery.empty) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
      return;
    }

    // Get document snapshot and data
    const userDocSnapshot = emailQuery.docs[0];
    const user: any = userDocSnapshot.data();

    // Verify if user created account with email/password
    if (!user.passwordHash) {
      res.status(401).json({
        status: 'error',
        message: 'This email is associated with a social login. Please sign in using Google or Facebook.',
      });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id });

    res.status(200).json({
      status: 'success',
      message: 'Login successful!',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          usageType: user.usageType,
          currentManagementMethod: user.currentManagementMethod,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle social login (Google or Facebook)
 * Decodes client-provided social token, matches/creates user in the DB
 */
export async function socialLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { provider, token: socialToken, name: clientProvidedName, email: clientProvidedEmail, usageType, currentManagementMethod } = req.body;
    const db = getDb();
    const auth = getAuth();

    let socialId = '';
    let email = clientProvidedEmail;
    let name = clientProvidedName;

    // Verify token using Firebase Auth
    if (socialToken.startsWith('mock_')) {
      // Developer Mode: Simulated token validation
      socialId = `${provider.toLowerCase()}_user_id_${Buffer.from(name).toString('hex').slice(0, 10)}`;
    } else {
      // Real Mode: Verify the actual Firebase ID Token
      try {
        const decodedToken = await auth.verifyIdToken(socialToken);
        socialId = decodedToken.uid;
        if (decodedToken.email) {
          email = decodedToken.email;
        }
        if (decodedToken.name) {
          name = decodedToken.name;
        }
      } catch (err: any) {
        console.error('Firebase Token Verification failed:', err.message);
        res.status(401).json({
          status: 'error',
          message: 'Firebase token verification failed. The provided authentication token is invalid or expired.',
        });
        return;
      }
    }

    // Search for user by social credential in Firestore
    const providerField = provider === 'GOOGLE' ? 'googleId' : 'facebookId';
    const socialQuery = await db
      .collection('users')
      .where(providerField, '==', socialId)
      .get();

    let user: any = null;
    let userDocRef: any = null;

    if (!socialQuery.empty) {
      const userDocSnapshot = socialQuery.docs[0];
      user = userDocSnapshot.data();
      userDocRef = userDocSnapshot.ref;
    } else if (email) {
      // Fallback: search if user exists with the same email address
      const emailQuery = await db
        .collection('users')
        .where('email', '==', email)
        .get();

      if (!emailQuery.empty) {
        const userDocSnapshot = emailQuery.docs[0];
        user = userDocSnapshot.data();
        userDocRef = userDocSnapshot.ref;

        // Link the social provider using set (fully mock-compatible)
        user[providerField] = socialId;
        await userDocRef.set(user);
      }
    }

    if (!user) {
      // User does not exist, perform automatic signup (onboarding is included in this request)
      userDocRef = db.collection('users').doc();
      const userId = userDocRef.id;

      user = {
        id: userId,
        email: email || null,
        name,
        googleId: provider === 'GOOGLE' ? socialId : null,
        facebookId: provider === 'FACEBOOK' ? socialId : null,
        usageType: usageType || 'OWN',
        currentManagementMethod: currentManagementMethod || 'PAPER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await userDocRef.set(user);
    }

    // Generate JWT token
    const jwtToken = generateToken({ userId: user.id });

    res.status(200).json({
      status: 'success',
      message: `${provider} authentication successful!`,
      data: {
        token: jwtToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          usageType: user.usageType,
          currentManagementMethod: user.currentManagementMethod,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve current user profile based on JWT token
 */
export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const db = getDb();

    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authorized.',
      });
      return;
    }

    const userDocSnapshot = await db
      .collection('users')
      .doc(userId)
      .get();

    if (!userDocSnapshot.exists) {
      res.status(404).json({
        status: 'error',
        message: 'User profile not found.',
      });
      return;
    }

    const user: any = userDocSnapshot.data();

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          usageType: user.usageType,
          currentManagementMethod: user.currentManagementMethod,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
