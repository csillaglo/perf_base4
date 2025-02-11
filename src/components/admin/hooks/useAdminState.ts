import { useState } from 'react';
import type { Organization, Profile, UserRole, UserStatus } from '../../../types/database';

export function useAdminState() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<(Profile & { email: string }) | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [inviting, setInviting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

  const [inviteForm, setInviteForm] = useState({
    email: '',
    full_name: '',
    role: 'employee' as UserRole,
    status: 'active' as UserStatus,
    department: '',
    job_level: '',
    job_name: '',
  });

  const [editForm, setEditForm] = useState({
    full_name: '',
    role: 'employee' as UserRole,
    status: 'active' as UserStatus,
    organization_id: '',
    department: '',
    job_level: '',
    job_name: '',
  });

  const [orgForm, setOrgForm] = useState({
    name: '',
    slug: '',
    app_name: '',
  });

  const [cycleForm, setCycleForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    status: 'active' as 'active' | 'inactive'
  });

  return {
    modals: {
      invite: { show: showInviteModal, setShow: setShowInviteModal },
      delete: { show: showDeleteModal, setShow: setShowDeleteModal },
      edit: { show: showEditModal, setShow: setShowEditModal },
      org: { show: showOrgModal, setShow: setShowOrgModal },
      cycle: { show: showCycleModal, setShow: setShowCycleModal },
      addAdmin: { show: showAddAdminModal, setShow: setShowAddAdminModal },
    },
    selected: {
      user: { value: selectedUser, set: setSelectedUser },
      org: { value: selectedOrg, set: setSelectedOrg },
      adminId: { value: selectedAdminId, set: setSelectedAdminId },
    },
    status: {
      inviting: { value: inviting, set: setInviting },
      deleting: { value: deleting, set: setDeleting },
      saving: { value: saving, set: setSaving },
    },
    view: {
      mode: viewMode,
      setMode: setViewMode,
    },
    message: {
      value: updateMessage,
      set: setUpdateMessage,
    },
    forms: {
      invite: { value: inviteForm, set: setInviteForm },
      edit: { value: editForm, set: setEditForm },
      org: { value: orgForm, set: setOrgForm },
      cycle: { value: cycleForm, set: setCycleForm },
    },
  };
}