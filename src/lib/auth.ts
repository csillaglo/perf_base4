import { supabase } from './supabase';
import type { UserRole } from '../types/database';

export async function signUp(email: string, password: string) {
  try {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    
    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    // Create the profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          role: 'employee',
          full_name: null,
        }
      ]);
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      // If profile creation fails, clean up the auth user
      await supabase.auth.signOut();
      throw new Error('Failed to create user profile');
    }

    return authData;
  } catch (error: any) {
    if (error.message === 'User already registered') {
      throw new Error('An account with this email already exists');
    }
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log('Attempting to sign in with email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    console.log('Auth successful, user data:', data);

    // Fetch the user's profile
    if (data.user) {
      console.log('Fetching profile for user:', data.user.id);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        await supabase.auth.signOut();
        throw new Error('Failed to load user profile');
      }

      console.log('Profile data:', profile);

      return {
        ...data,
        profile
      };
    }

    return data;
  } catch (error: any) {
    console.error('Full error details:', error);
    
    if (error.message === 'Invalid login credentials') {
      throw new Error('Invalid email or password');
    }
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Profile fetch error:', error);
    await supabase.auth.signOut();
    throw new Error('Failed to load user profile');
  }

  return {
    ...user,
    ...profile
  };
}

export async function updateUserRole(userId: string, role: UserRole) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, data: {
  full_name?: string;
  role?: UserRole;
  department?: string;
  job_level?: string;
  job_name?: string;
  organization_id?: string | null;
}) {
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);

  if (error) throw error;
  return true;
}

export async function inviteUser(email: string, data: {
  role?: UserRole;
  department?: string;
  job_level?: string;
  job_name?: string;
  organization_id?: string | null;
}) {
  try {
    // Generate a random temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    
    // Create the user with the temporary password
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
    });
    
    if (authError) throw authError;
    
    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    // Create the profile record with the specified role and job details
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        role: data.role || 'employee',
        department: data.department,
        job_level: data.job_level,
        job_name: data.job_name,
        organization_id: data.organization_id,
        full_name: null,
      }]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw new Error('Failed to create user profile');
    }

    // Send a password reset email so the user can set their own password
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) throw resetError;

    return authData;
  } catch (error: any) {
    if (error.message === 'User already registered') {
      throw new Error('A user with this email already exists');
    }
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    // Delete the user from auth (this will cascade to the profile due to ON DELETE CASCADE)
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user. Please try again.');
  }
}