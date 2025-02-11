import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import type { Profile, Organization } from '../types/database';
import { inviteUser, deleteUser, updateUserProfile } from '../lib/auth';
import { UserForm } from '../components/admin/UserForm';
import { Modal } from '../components/admin/Modal';
import { OrganizationForm } from '../components/admin/OrganizationForm';
import { CycleForm } from '../components/admin/CycleForm';
import { useAuth } from '../contexts/AuthContext';
import { useAdminState } from '../components/admin/hooks/useAdminState';
import { OrganizationsSection } from '../components/admin/sections/OrganizationsSection';
import { EvaluationCyclesSection } from '../components/admin/sections/EvaluationCyclesSection';
import { UserManagementSection } from '../components/admin/sections/UserManagementSection';
import { WelcomeMessageSection } from '../components/admin/sections/WelcomeMessageSection';
import { WelcomeMessageForm } from '../components/admin/WelcomeMessageForm';
import { AdminModal } from '../components/admin/modals/AdminModal';
import { DeleteUserModal } from '../components/admin/modals/DeleteUserModal';
import type { EvaluationCycle } from '../types/database';
import { DownloadResultsSection } from '../components/admin/sections/DownloadResultsSection';

interface OrganizationWithStats extends Organization {
  adminCount: number;
  userCount: number;
}

export function Admin() {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const state = useAdminState();
  const [users, setUsers] = React.useState<(Profile & { email: string })[]>([]);
  const [organizations, setOrganizations] = React.useState<OrganizationWithStats[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [cycles, setCycles] = React.useState<EvaluationCycle[]>([]);
  const [welcomeMessage, setWelcomeMessage] = React.useState('');
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);
  const [adminCandidates, setAdminCandidates] = React.useState<AdminCandidate[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchWelcomeMessage = async () => {
    if (!user?.organization_id) return;

    if (!user?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('welcome_messages')
        .select('content')
        .eq('organization_id', user.organization_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
      setWelcomeMessage(data?.content || '');
    } catch (err) {
      console.error('Error fetching welcome message:', err);
    }
  };

  const handleUpdateWelcomeMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organization_id) return;

    try {
      const { error } = await supabase
        .from('welcome_messages')
        .upsert({
          organization_id: user.organization_id,
          content: welcomeMessage,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      state.message.set({ type: 'success', text: t('admin.welcomeMessage.updateSuccess') });
      setShowWelcomeModal(false);
    } catch (err: any) {
      state.message.set({ type: 'error', text: err.message });
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchOrganizations(),
        fetchCycles(),
        fetchWelcomeMessage(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycles = async () => {
    try {
      let query = supabase
        .from('evaluation_cycles')
        .select('*')
        .order('start_date', { ascending: false });

      // If company admin, only fetch cycles from their organization
      if (role === 'company_admin' && user?.organization_id) {
        query = query.eq('organization_id', user.organization_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCycles(data || []);
    } catch (err: any) {
      console.error('Error fetching cycles:', err);
      setError(err.message);
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.status.saving.value) return;

    state.status.saving.set(true);
    state.message.set({ type: '', text: '' });

    try {
      const { data, error } = await supabase
        .from('evaluation_cycles')
        .insert([{
          name: state.forms.cycle.value.name,
          start_date: state.forms.cycle.value.start_date,
          end_date: state.forms.cycle.value.end_date,
          organization_id: user?.organization_id,
          status: state.forms.cycle.value.status,
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchCycles();
      state.modals.cycle.setShow(false);
      state.forms.cycle.set({ name: '', start_date: '', end_date: '', status: 'active' });
      state.message.set({ type: 'success', text: t('admin.cycles.createSuccess') });
    } catch (err: any) {
      state.message.set({ type: 'error', text: err.message });
    } finally {
      state.status.saving.set(false);
    }
  };

  const handleDeleteCycle = async (cycle: EvaluationCycle) => {
    if (!confirm('Are you sure you want to delete this evaluation cycle? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('evaluation_cycles')
        .delete()
        .eq('id', cycle.id);

      if (error) throw error;

      await fetchCycles();
      state.message.set({ type: 'success', text: t('admin.cycles.deleteSuccess') });
    } catch (err: any) {
      state.message.set({ type: 'error', text: err.message });
    }
  };

  const handleToggleCycleStatus = async (cycle: EvaluationCycle) => {
    try {
      const newStatus = cycle.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('evaluation_cycles')
        .update({ status: newStatus })
        .eq('id', cycle.id);

      if (error) throw error;

      await fetchCycles();
      state.message.set({ 
        type: 'success', 
        text: t('admin.cycles.statusUpdateSuccess', { 
          name: cycle.name, 
          status: newStatus === 'active' ? t('admin.cycles.activated') : t('admin.cycles.deactivated') 
        })
      });
    } catch (err: any) {
      state.message.set({ type: 'error', text: err.message });
    }
  };

  const fetchUsers = async () => {
    try {
      let query = supabase.from('profiles').select('*');
      
      // If company admin, only fetch users from their organization
      if (role === 'company_admin' && user?.organization_id) {
        query = query.eq('organization_id', user.organization_id);
      }

      const { data: profiles, error: profilesError } = await query;
      if (profilesError) throw profilesError;

      const { data: emailData, error: emailsError } = await supabase
        .rpc('get_user_emails');

      if (emailsError) throw emailsError;

      const emailMap = new Map(emailData.map((item: any) => [item.id, item.email]));

      const usersWithEmail = profiles?.map(profile => ({
        ...profile,
        email: emailMap.get(profile.id) || 'No email'
      })) || [];

      setUsers(usersWithEmail);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchOrganizations = async () => {
    try {
      let query = supabase.from('organizations').select('*');
      
      // If company admin, only fetch their organization
      if (role === 'company_admin' && user?.organization_id) {
        query = query.eq('id', user.organization_id);
      }

      const { data: orgs, error: orgsError } = await query;
      if (orgsError) throw orgsError;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('organization_id, role');

      if (profilesError) throw profilesError;

      const orgsWithStats = orgs.map(org => ({
        ...org,
        adminCount: profiles.filter(p => p.organization_id === org.id && p.role === 'company_admin').length,
        userCount: profiles.filter(p => p.organization_id === org.id).length,
      }));

      setOrganizations(orgsWithStats);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchAdminCandidates = async (orgId: string) => {
    try {
      // First get all company admins from the organization
      const { data: candidates, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', orgId)
        .eq('role', 'company_admin');

      if (error) throw error;

      // Get emails for all users
      const { data: emailData, error: emailError } = await supabase
        .rpc('get_user_emails');

      if (emailError) throw emailError;

      // Create email map
      const emailMap = new Map(emailData.map((item: any) => [item.id, item.email]));

      // Combine profile data with emails
      const candidatesWithEmail = candidates.map(candidate => ({
        ...candidate,
        email: emailMap.get(candidate.id) || 'No email'
      }));

      setAdminCandidates(candidatesWithEmail);
    } catch (err: any) {
      console.error('Error fetching admin candidates:', err);
      state.message.set({ type: 'error', text: 'Failed to load admin candidates' });
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.status.saving.value) return;

    state.status.saving.set(true);
    state.message.set({ type: '', text: '' });

    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: state.forms.org.value.name,
          slug: state.forms.org.value.slug,
          app_name: state.forms.org.value.app_name || 'HR Performance',
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchOrganizations();
      state.modals.org.setShow(false);
      state.forms.org.set({ name: '', slug: '', app_name: '' });
      state.message.set({ type: 'success', text: t('admin.organizations.createSuccess') });
    } catch (err: any) {
      state.message.set({ type: 'error', text: err.message });
    } finally {
      state.status.saving.set(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.selected.org.value || !state.selected.adminId.value || state.status.saving.value) return;

    state.status.saving.set(true);
    state.message.set({ type: '', text: '' });

    try {
      // Update user role and organization
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'company_admin',
          organization_id: state.selected.org.value.id,
        })
        .eq('id', state.selected.adminId.value);

      if (updateError) throw updateError;

      await fetchOrganizations();
      state.modals.addAdmin.setShow(false);
      state.selected.adminId.set('');
      state.selected.org.set(null);
      state.message.set({ type: 'success', text: t('admin.organizations.adminAddSuccess') });
    } catch (err: any) {
      state.message.set({ type: 'error', text: err.message });
    } finally {
      state.status.saving.set(false);
    }
  };

  const handleDeleteOrg = async (org: Organization) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', org.id);

      if (error) throw error;

      await fetchOrganizations();
      state.message.set({ type: 'success', text: t('admin.organizations.deleteSuccess') });
    } catch (err: any) {
      state.message.set({ type: 'error', text: err.message });
    }
  };

  async function handleRoleChange(userId: string, newRole: UserRole) {
    try {
      state.message.set({ type: '', text: '' });
      await updateUserProfile(userId, { role: newRole });

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      state.message.set({ type: 'success', text: 'User role updated successfully!' });
    } catch (err: any) {
      state.message.set({ type: 'error', text: err.message });
    }
  }

  async function handleManagerChange(userId: string, managerId: string | null) {
    try {
      await updateUserProfile(userId, { manager_id: managerId });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, manager_id: managerId } : user
      ));
      state.message.set({ type: 'success', text: 'Manager updated successfully!' });
    } catch (err: any) {
      state.message.set({ type: 'error', text: err.message });
    }
  }

  async function handleInviteUser(e: React.FormEvent) {
    e.preventDefault();
    if (state.status.inviting.value) return;
    state.status.inviting.set(true);
    state.message.set({ type: '', text: '' });

    try {
      await inviteUser(state.forms.invite.value.email, {
        role: state.forms.invite.value.role,
        department: state.forms.invite.value.department,
        job_level: state.forms.invite.value.job_level,
        job_name: state.forms.invite.value.job_name,
      });
      state.message.set({ 
        type: 'success', 
        text: t('admin.users.invitationSent', { email: state.forms.invite.value.email }) 
      });
      state.modals.invite.setShow(false);
      state.forms.invite.set({ 
        email: '',
        full_name: '',
        role: 'employee',
        status: 'active',
        department: '',
        job_level: '',
        job_name: '',
      });
      await fetchUsers();
    } catch (err: any) {
      state.message.set({ 
        type: 'error', 
        text: err.message || t('admin.users.invitationFailed')
      });
    } finally {
      state.status.inviting.set(false);
    }
  }

  async function handleDeleteUser() {
    if (!state.selected.user.value || state.status.deleting.value) return;
    
    state.status.deleting.set(true);
    state.message.set({ type: '', text: '' });

    try {
      await deleteUser(state.selected.user.value.id);
      setUsers(users.filter(user => user.id !== state.selected.user.value.id));
      state.message.set({ type: 'success', text: t('admin.users.deleteSuccess') });
      state.modals.delete.setShow(false);
      state.selected.user.set(null);
    } catch (err: any) {
      state.message.set({ type: 'error', text: err.message });
    } finally {
      state.status.deleting.set(false);
    }
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault();
    if (!state.selected.user.value || state.status.saving.value) return;

    state.status.saving.set(true);
    state.message.set({ type: '', text: '' });

    try {
      await updateUserProfile(state.selected.user.value.id, {
        full_name: state.forms.edit.value.full_name,
        role: state.forms.edit.value.role,
        organization_id: state.forms.edit.value.organization_id || null,
        status: state.forms.edit.value.status,
        department: state.forms.edit.value.department,
        job_level: state.forms.edit.value.job_level,
        job_name: state.forms.edit.value.job_name,
      });

      setUsers(users.map(user => 
        user.id === state.selected.user.value.id 
          ? { 
              ...user, 
              full_name: state.forms.edit.value.full_name, 
              role: state.forms.edit.value.role,
              organization_id: state.forms.edit.value.organization_id || null,
              status: state.forms.edit.value.status,
              department: state.forms.edit.value.department,
              job_level: state.forms.edit.value.job_level,
              job_name: state.forms.edit.value.job_name,
            }
          : user
      ));

      state.message.set({ type: 'success', text: t('admin.users.updateSuccess') });
      state.modals.edit.setShow(false);
      state.selected.user.set(null);
    } catch (err: any) {
      state.message.set({ type: 'error', text: err.message });
    } finally {
      state.status.saving.set(false);
    }
  }

  function handleEditClick(user: UserWithEmail) {
    state.selected.user.set(user);
    state.forms.edit.set({
      full_name: user.full_name || '',
      role: user.role,
      status: user.status || 'active',
      organization_id: user.organization_id || '',
      department: user.department || '',
      job_level: user.job_level || '',
      job_name: user.job_name || '',
    });
    state.modals.edit.setShow(true);
  }

  // Fetch admin candidates when organization is selected
  useEffect(() => {
    if (state.selected.org.value) {
      fetchAdminCandidates(state.selected.org.value.id);
    }
  }, [state.selected.org.value]);

  if (loading) {
    return <div className="text-center py-4">{t('common.loading')}</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {t('common.error')}: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organizations Section (only for superadmin) */}
      {role === 'superadmin' && (
        <OrganizationsSection
          organizations={organizations}
          onAddAdmin={(org) => {
            state.selected.org.set(org);
            state.modals.addAdmin.setShow(true);
          }}
          onDelete={handleDeleteOrg}
          onCreateNew={() => state.modals.org.setShow(true)}
        />
      )}

      {/* Evaluation Cycles Section (for company admins and superadmins) */}
      {role === 'company_admin' && (
        <EvaluationCyclesSection
          cycles={cycles}
          onCreateNew={() => state.modals.cycle.setShow(true)}
          onEdit={(cycle) => {
            state.forms.cycle.set({
              name: cycle.name,
              start_date: cycle.start_date,
              end_date: cycle.end_date,
              status: cycle.status
            });
            state.modals.cycle.setShow(true);
          }}
          onDelete={handleDeleteCycle}
          onToggleStatus={handleToggleCycleStatus}
        />
      )}

      {/* Welcome Message Section (for company admins) */}
      {role === 'company_admin' && (
        <WelcomeMessageSection
          message={welcomeMessage}
          onEdit={() => setShowWelcomeModal(true)}
        />
      )}

      {/* User Management Section */}
      <UserManagementSection
        users={users}
        organizations={organizations}
        viewMode={state.view.mode}
        onViewModeChange={state.view.setMode}
        onInviteUser={() => state.modals.invite.setShow(true)}
        onRoleChange={handleRoleChange}
        onEditClick={handleEditClick}
        onDeleteClick={(user) => {
          state.selected.user.set(user);
          state.modals.delete.setShow(true);
        }}
        onManagerChange={handleManagerChange}
        updateMessage={state.message.value}
      />

      {/* Download Results Section */}
      <DownloadResultsSection organizationId={user?.organization_id} />

      {/* Create Organization Modal */}
      <Modal
        isOpen={state.modals.org.show}
        onClose={() => state.modals.org.setShow(false)}
        title="Create New Organization"
      >
        <OrganizationForm
          formData={state.forms.org.value}
          onChange={(field, value) => state.forms.org.set(prev => ({ ...prev, [field]: value }))}
          onSubmit={handleCreateOrg}
          onCancel={() => state.modals.org.setShow(false)}
          isSubmitting={state.status.saving.value}
        />
      </Modal>

      {/* Add Admin Modal */}
      <AdminModal
        isOpen={state.modals.addAdmin.show}
        onClose={() => {
          state.modals.addAdmin.setShow(false);
          state.selected.org.set(null);
          state.selected.adminId.set('');
          setAdminCandidates([]);
        }}
        selectedOrgName={state.selected.org.value?.name}
        adminCandidates={adminCandidates}
        selectedAdminId={state.selected.adminId.value}
        onAdminSelect={(id) => state.selected.adminId.set(id)}
        onSubmit={handleAddAdmin}
        saving={state.status.saving.value}
      />

      {/* Invite User Modal */}
      <Modal
        isOpen={state.modals.invite.show}
        onClose={() => state.modals.invite.setShow(false)}
        title="Invite New User"
      >
        <UserForm
          formData={state.forms.invite.value}
          organizations={organizations}
          onChange={(field, value) => state.forms.invite.set(prev => ({ ...prev, [field]: value }))}
          onSubmit={handleInviteUser}
          onCancel={() => state.modals.invite.setShow(false)}
          isSubmitting={state.status.inviting.value}
          submitLabel="Send Invitation"
          showEmailField
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={state.modals.edit.show}
        onClose={() => {
          state.modals.edit.setShow(false);
          state.selected.user.set(null);
        }}
        title="Edit User Profile"
      >
        <UserForm
          organizations={organizations}
          formData={state.forms.edit.value}
          onChange={(field, value) => state.forms.edit.set(prev => ({ ...prev, [field]: value }))}
          onSubmit={handleEditUser}
          onCancel={() => {
            state.modals.edit.setShow(false);
            state.selected.user.set(null);
          }}
          isSubmitting={state.status.saving.value}
          submitLabel="Save Changes"
        />
      </Modal>

      {/* Delete User Confirmation Modal */}
      <DeleteUserModal
        isOpen={state.modals.delete.show}
        onClose={() => {
          state.modals.delete.setShow(false);
          state.selected.user.set(null);
        }}
        user={state.selected.user.value}
        onDelete={handleDeleteUser}
        deleting={state.status.deleting.value}
      />

      {/* Create Evaluation Cycle Modal */}
      <Modal
        isOpen={state.modals.cycle.show}
        onClose={() => state.modals.cycle.setShow(false)}
        title="Create Evaluation Cycle"
      >
        <CycleForm
          formData={state.forms.cycle.value}
          onChange={(field, value) => state.forms.cycle.set(prev => ({ ...prev, [field]: value }))}
          onSubmit={handleCreateCycle}
          onCancel={() => state.modals.cycle.setShow(false)}
          isSubmitting={state.status.saving.value}
        />
      </Modal>

      {/* Welcome Message Modal */}
      <Modal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        title="Edit Welcome Message"
      >
        <WelcomeMessageForm
          content={welcomeMessage}
          onChange={setWelcomeMessage}
          onSubmit={handleUpdateWelcomeMessage}
          onCancel={() => setShowWelcomeModal(false)}
          isSubmitting={false}
        />
      </Modal>
    </div>
  );
}