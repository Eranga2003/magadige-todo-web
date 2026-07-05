import { Response, NextFunction } from 'express';
import { getDb } from '../utils/firebase';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

/**
 * Create a new workspace
 */
export async function createWorkspace(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Not authorized.' });
      return;
    }

    const { name, description, logoUrl } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ status: 'error', message: 'Workspace name is required.' });
      return;
    }

    const db = getDb();
    
    // Fetch owner information
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ status: 'error', message: 'Owner user profile not found.' });
      return;
    }
    const userData = userDoc.data();

    const workspaceDocRef = db.collection('workspaces').doc();
    const workspaceId = workspaceDocRef.id;

    const newWorkspace = {
      id: workspaceId,
      name: name.trim(),
      description: (description || '').trim(),
      logoUrl: logoUrl || '',
      ownerId: userId,
      members: [
        {
          userId,
          email: userData.email,
          role: 'OWNER',
        }
      ],
      memberIds: [userId],
      memberEmails: [userData.email],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await workspaceDocRef.set(newWorkspace);

    res.status(201).json({ status: 'success', data: newWorkspace });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve all workspaces associated with the current user
 */
export async function getWorkspaces(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Not authorized.' });
      return;
    }

    const db = getDb();
    
    // Fetch user details to get email (in case they were invited by email before registering)
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ status: 'error', message: 'User profile not found.' });
      return;
    }
    const userData = userDoc.data();

    // Query workspaces where memberIds contains userId OR memberEmails contains email
    const idSnapshot = await db.collection('workspaces').where('memberIds', 'array-contains', userId).get();
    const emailSnapshot = await db.collection('workspaces').where('memberEmails', 'array-contains', userData.email).get();

    const workspaceMap = new Map<string, any>();
    idSnapshot.docs.forEach((doc: any) => workspaceMap.set(doc.id, doc.data()));
    emailSnapshot.docs.forEach((doc: any) => workspaceMap.set(doc.id, doc.data()));

    const workspaces = Array.from(workspaceMap.values());

    res.status(200).json({ status: 'success', data: workspaces });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve a specific workspace's details
 */
export async function getWorkspaceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const workspaceId = req.params.id;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Not authorized.' });
      return;
    }

    const db = getDb();
    const workspaceDoc = await db.collection('workspaces').doc(workspaceId).get();

    if (!workspaceDoc.exists) {
      res.status(404).json({ status: 'error', message: 'Workspace not found.' });
      return;
    }

    const workspace = workspaceDoc.data();
    
    // Verify membership
    const isMember = workspace.memberIds.includes(userId);
    if (!isMember) {
      // Also check email in case user registered after being added to members list
      const userDoc = await db.collection('users').doc(userId).get();
      const userEmail = userDoc.exists ? userDoc.data().email : '';
      if (!workspace.memberEmails.includes(userEmail)) {
        res.status(403).json({ status: 'error', message: 'Forbidden. You are not a member of this workspace.' });
        return;
      }
    }

    res.status(200).json({ status: 'success', data: workspace });
  } catch (error) {
    next(error);
  }
}

/**
 * Invite a member to the workspace
 */
export async function inviteMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const workspaceId = req.params.id;
    const { email } = req.body;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Not authorized.' });
      return;
    }

    if (!email || !email.trim()) {
      res.status(400).json({ status: 'error', message: 'Email address is required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      res.status(400).json({ status: 'error', message: 'Invalid email address format.' });
      return;
    }

    const db = getDb();
    
    // Fetch workspace
    const workspaceDoc = await db.collection('workspaces').doc(workspaceId).get();
    if (!workspaceDoc.exists) {
      res.status(404).json({ status: 'error', message: 'Workspace not found.' });
      return;
    }

    const workspace = workspaceDoc.data();

    // Verify requesting user is owner
    if (workspace.ownerId !== userId) {
      res.status(403).json({ status: 'error', message: 'Only the workspace owner can invite members.' });
      return;
    }

    // Check if email is already in the workspace member list
    if (workspace.memberEmails.includes(cleanEmail)) {
      res.status(400).json({ status: 'error', message: 'User is already a member of this workspace.' });
      return;
    }

    // Fetch inviter information
    const inviterDoc = await db.collection('users').doc(userId).get();
    const inviterName = inviterDoc.exists ? inviterDoc.data().name : 'A user';

    // Generate unique invitation token
    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

    const newInvitation = {
      id: token,
      workspaceId,
      workspaceName: workspace.name,
      invitedEmail: cleanEmail,
      inviterId: userId,
      inviterName,
      accepted: false,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    };

    await db.collection('invitations').doc(token).set(newInvitation);

    // Format & log/mock send the email
    const inviteLink = `http://localhost:5173/?inviteToken=${token}`;
    console.log('\n================================================================');
    console.log(`📧 MOCK EMAIL SENT TO: ${cleanEmail}`);
    console.log(`💼 WORKSPACE: ${workspace.name}`);
    console.log(`👤 INVITED BY: ${inviterName}`);
    console.log(`✉️  MESSAGE: You have been invited to join the ${workspace.name} Workspace. Click the link below to join and access the workspace.`);
    console.log(`🔗 LINK: ${inviteLink}`);
    console.log('================================================================\n');

    res.status(200).json({ 
      status: 'success', 
      message: 'Invitation sent successfully.',
      data: { inviteLink }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Validate invitation token
 */
export async function validateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.params.token;
    const db = getDb();
    
    const invitationDoc = await db.collection('invitations').doc(token).get();
    if (!invitationDoc.exists) {
      res.status(404).json({ status: 'error', message: 'Invitation not found or invalid.' });
      return;
    }

    const invitation = invitationDoc.data();
    if (invitation.accepted) {
      res.status(400).json({ status: 'error', message: 'This invitation has already been accepted.' });
      return;
    }

    const isExpired = new Date(invitation.expiresAt) < new Date();
    if (isExpired) {
      res.status(400).json({ status: 'error', message: 'This invitation link has expired.' });
      return;
    }

    res.status(200).json({ 
      status: 'success', 
      data: {
        email: invitation.invitedEmail,
        workspaceName: invitation.workspaceName
      } 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Accept invitation and join workspace
 */
export async function acceptInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const { token } = req.body;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Not authorized.' });
      return;
    }

    if (!token) {
      res.status(400).json({ status: 'error', message: 'Invitation token is required.' });
      return;
    }

    const db = getDb();
    const invitationDoc = await db.collection('invitations').doc(token).get();

    if (!invitationDoc.exists) {
      res.status(404).json({ status: 'error', message: 'Invitation invalid.' });
      return;
    }

    const invitation = invitationDoc.data();
    if (invitation.accepted) {
      res.status(400).json({ status: 'error', message: 'This invitation has already been accepted.' });
      return;
    }

    const isExpired = new Date(invitation.expiresAt) < new Date();
    if (isExpired) {
      res.status(400).json({ status: 'error', message: 'This invitation link has expired.' });
      return;
    }

    // Verify current user's email matches the invited email
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ status: 'error', message: 'User profile not found.' });
      return;
    }
    
    const userData = userDoc.data();
    if (userData.email !== invitation.invitedEmail) {
      res.status(400).json({ 
        status: 'error', 
        message: `This invitation was sent to ${invitation.invitedEmail}, but you are logged in as ${userData.email}.` 
      });
      return;
    }

    // Fetch workspace
    const workspaceDocRef = db.collection('workspaces').doc(invitation.workspaceId);
    const workspaceDoc = await workspaceDocRef.get();

    if (!workspaceDoc.exists) {
      res.status(404).json({ status: 'error', message: 'Associated workspace not found.' });
      return;
    }

    const workspace = workspaceDoc.data();

    // Prevent duplicate additions
    if (!workspace.memberEmails.includes(userData.email)) {
      const updatedMembers = [
        ...workspace.members,
        {
          userId,
          email: userData.email,
          role: 'MEMBER'
        }
      ];
      
      const updatedMemberIds = [...workspace.memberIds, userId];
      const updatedMemberEmails = [...workspace.memberEmails, userData.email];

      await workspaceDocRef.set({
        ...workspace,
        members: updatedMembers,
        memberIds: updatedMemberIds,
        memberEmails: updatedMemberEmails,
        updatedAt: new Date().toISOString()
      });
    }

    // Mark invitation as accepted
    await db.collection('invitations').doc(token).set({
      ...invitation,
      accepted: true,
      acceptedAt: new Date().toISOString()
    });

    res.status(200).json({ 
      status: 'success', 
      message: 'Successfully joined the workspace!', 
      data: { workspaceId: invitation.workspaceId } 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new project within a workspace
 */
export async function createWorkspaceProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const workspaceId = req.params.id;
    const { name } = req.body;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Not authorized.' });
      return;
    }

    if (!name || !name.trim()) {
      res.status(400).json({ status: 'error', message: 'Project name is required.' });
      return;
    }

    const db = getDb();
    const workspaceDocRef = db.collection('workspaces').doc(workspaceId);
    const workspaceDoc = await workspaceDocRef.get();

    if (!workspaceDoc.exists) {
      res.status(404).json({ status: 'error', message: 'Workspace not found.' });
      return;
    }

    const workspace = workspaceDoc.data();

    // Verify requesting user is owner
    if (workspace.ownerId !== userId) {
      res.status(403).json({ status: 'error', message: 'Only the workspace owner can create projects.' });
      return;
    }

    const newProject = {
      id: `proj_${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedProjects = [...(workspace.projects || []), newProject];

    await workspaceDocRef.set({
      ...workspace,
      projects: updatedProjects,
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({ status: 'success', data: newProject });
  } catch (error) {
    next(error);
  }
}
