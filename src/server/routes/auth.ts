import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { hostingerDb } from '../hostingerDb';

const router = Router();

// 1. Operator / User Sign Up (Persists to Hostinger MySQL & Runtime Memory)
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, title, avatar, assignedSports, preferredSetup } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email address, and password are required',
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 4 characters long',
      });
    }

    // Sign up in storage
    const { user, token } = storage.signupUser({
      name,
      email,
      password,
      role,
      title,
      avatar,
      assignedSports,
      preferredSetup,
    });

    // Also persist into Hostinger MySQL DB directly if connected or configured
    let hostingerSynced = false;
    try {
      const passwordHash = storage.hashPassword(password);
      hostingerSynced = await hostingerDb.createHostingerUser({
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
        title: user.title,
        avatar: user.avatar,
        assignedSports: user.assignedSports,
        preferredSetup: user.preferredSetup,
      });
    } catch (dbErr: any) {
      console.warn('[HOSTINGER DB SYNC WARNING]', dbErr?.message || dbErr);
    }

    return res.status(201).json({
      success: true,
      user,
      token,
      hostingerSynced,
      message: hostingerSynced
        ? `Account created and directly committed to Hostinger MySQL (${user.email})`
        : `Account created in hybrid memory staging (Ready for Hostinger DB sync)`,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err?.message || 'Failed to create broadcaster account',
    });
  }
});

// 2. Operator / User Sign In
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, userId } = req.body;

    if (!userId && (!email || !password)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either email & password or select an active operator profile',
      });
    }

    // Try authenticating in memory
    let result = storage.loginUser({ email, password, userId });

    // If not found in memory but Hostinger DB is connected, try loading from Hostinger MySQL
    if (!result && email && hostingerDb.isConfigured()) {
      try {
        const hostingerUser = await hostingerDb.findUserByEmail(email);
        if (hostingerUser) {
          const inputHash = storage.hashPassword(password);
          if (hostingerUser.password_hash === inputHash || !hostingerUser.password_hash) {
            // Restore into memory
            let sports: any[] = ['cricket', 'football'];
            try {
              sports = JSON.parse(hostingerUser.assigned_sports_json || '[]');
            } catch {
              // ignore
            }
            const restoredUser = storage.createUser({
              id: hostingerUser.id,
              name: hostingerUser.name,
              email: hostingerUser.email,
              role: hostingerUser.role,
              title: hostingerUser.title,
              avatar: hostingerUser.avatar,
              assignedSports: sports,
              preferredSetup: hostingerUser.preferred_setup,
            });
            result = {
              user: restoredUser,
              token: `mktglu_auth_token_${restoredUser.id}_${Date.now()}`,
            };
          }
        }
      } catch (dbErr) {
        // ignore
      }
    }

    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please verify credentials or create a new account.',
      });
    }

    return res.json({
      success: true,
      user: result.user,
      token: result.token,
      message: `Welcome back, ${result.user.name}!`,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Authentication error',
    });
  }
});

// 3. Current Authenticated Broadcaster Session
router.get('/me', (_req: Request, res: Response) => {
  const activeUser = storage.getActiveUser();
  const dbStatus = hostingerDb.getStatus(storage.getMatches().length, 0, storage.getUsers().length);
  res.json({
    authenticated: true,
    user: activeUser,
    database: {
      connected: dbStatus.connected,
      mode: dbStatus.mode,
      host: dbStatus.host,
      database: dbStatus.database,
    },
  });
});

// 4. Broadcaster Logout
router.post('/logout', (_req: Request, res: Response) => {
  const users = storage.getUsers();
  const viewer = users.find((u) => u.role === 'viewer') || users[0];
  if (viewer) {
    storage.setActiveUser(viewer.id);
  }
  res.json({
    success: true,
    message: 'Broadcaster session signed out',
    activeUser: storage.getActiveUser(),
  });
});

// 5. Test Hostinger MySQL DB Connection Live
router.post('/test-hostinger', async (_req: Request, res: Response) => {
  try {
    const result = await hostingerDb.testConnection();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.message || 'Hostinger DB connection probe failed',
    });
  }
});

// 6. Update Hostinger MySQL DB Configuration at Runtime
router.post('/configure-hostinger', async (req: Request, res: Response) => {
  try {
    const { host, port, user, password, database } = req.body;
    hostingerDb.updateConfig({ host, port, user, password, database });
    const probe = await hostingerDb.testConnection();
    const dbStatus = hostingerDb.getStatus(
      storage.getMatches().length,
      0,
      storage.getUsers().length
    );

    res.json({
      success: probe.success,
      probe,
      status: dbStatus,
      message: probe.success
        ? `Successfully connected and saved Hostinger database: ${dbStatus.database} on ${dbStatus.host}`
        : `Saved configuration, but probe returned: ${probe.message}`,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to update Hostinger DB configuration',
    });
  }
});

export default router;
