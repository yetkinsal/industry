import { Request, Response } from 'express';
import { AuthService, RegisterRequest, LoginRequest } from '../services/auth.service';

export class AuthController {
  private authService = new AuthService();

  /**
   * Register a new user
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response) => {
    try {
      const data: RegisterRequest = req.body;

      // Validate input
      if (!data.email || !data.password || !data.name) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Email, password, and name are required',
        });
      }

      if (data.password.length < 6) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Password must be at least 6 characters long',
        });
      }

      const result = await this.authService.register(data);

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(400).json({
        error: 'Registration failed',
        message: error.message || 'Could not create user',
      });
    }
  };

  /**
   * Login user
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response) => {
    try {
      const data: LoginRequest = req.body;

      // Validate input
      if (!data.email || !data.password) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Email and password are required',
        });
      }

      const result = await this.authService.login(data);

      res.json(result);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({
        error: 'Authentication failed',
        message: error.message || 'Invalid credentials',
      });
    }
  };

  /**
   * Get current user
   * GET /api/auth/me
   */
  getCurrentUser = async (req: Request, res: Response) => {
    try {
      // User is attached to request by auth middleware
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          error: 'Not authenticated',
          message: 'No user found in request',
        });
      }

      res.json({ user });
    } catch (error: any) {
      console.error('Get current user error:', error);
      res.status(500).json({
        error: 'Server error',
        message: error.message || 'Could not get user',
      });
    }
  };

  /**
   * Logout user (client-side token removal)
   * POST /api/auth/logout
   */
  logout = async (req: Request, res: Response) => {
    // With JWT, logout is handled client-side by removing the token
    // This endpoint is here for consistency and can be extended later
    res.json({ message: 'Logged out successfully' });
  };
}
