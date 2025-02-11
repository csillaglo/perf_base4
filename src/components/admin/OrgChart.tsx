import React, { useState } from 'react';
import { Edit2, Trash2, UserCircle, Save } from 'lucide-react';
import type { Profile } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';

interface OrgChartProps {
  users: Profile[];
  onManagerChange: (userId: string, managerId: string | null) => void;
  onEditClick: (user: Profile) => void;
  onDeleteClick: (user: Profile) => void;
}

interface OrgNode {
  user: Profile;
  reports: OrgNode[];
}

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  employee: 'bg-green-100 text-green-800',
} as const;

export function OrgChart({ users, onManagerChange, onEditClick, onDeleteClick }: OrgChartProps) {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [pendingChanges, setPendingChanges] = useState<Map<string, string | null>>(new Map());
  const [draggedUserId, setDraggedUserId] = useState<string | null>(null);

  // Filter out admin users and keep only employees and managers
  const filteredUsers = users.filter(user => user.role !== 'admin');

  // Build the organizational tree
  const buildOrgTree = () => {
    const nodeMap = new Map<string, OrgNode>();
    const rootNodes: OrgNode[] = [];
    const unassignedNodes: OrgNode[] = [];

    // Create nodes for all users first
    filteredUsers.forEach(user => {
      nodeMap.set(user.id, { user, reports: [] });
    });

    // Build the tree structure
    filteredUsers.forEach(user => {
      const node = nodeMap.get(user.id)!;
      const effectiveManagerId = pendingChanges.has(user.id) 
        ? pendingChanges.get(user.id)
        : user.manager_id;

      if (effectiveManagerId && nodeMap.has(effectiveManagerId)) {
        const managerNode = nodeMap.get(effectiveManagerId);
        if (managerNode) {
          managerNode.reports.push(node);
        } else {
          unassignedNodes.push(node);
        }
      } else {
        if (user.role === 'manager') {
          rootNodes.push(node);
        } else {
          unassignedNodes.push(node);
        }
      }
    });

    // Sort nodes
    const sortNodes = (nodes: OrgNode[]) => {
      return nodes.sort((a, b) => {
        const roleOrder = { manager: 0, employee: 1 };
        const roleCompare = (roleOrder[a.user.role as 'manager' | 'employee'] || 1) - 
                          (roleOrder[b.user.role as 'manager' | 'employee'] || 1);
        if (roleCompare !== 0) return roleCompare;
        
        const nameA = a.user.full_name || a.user.email || '';
        const nameB = b.user.full_name || b.user.email || '';
        return nameA.localeCompare(nameB);
      });
    };

    return {
      rootNodes: sortNodes(rootNodes),
      unassignedNodes: sortNodes(unassignedNodes)
    };
  };

  const handleDragStart = (userId: string) => {
    setDraggedUserId(userId);
  };

  const handleDragEnd = () => {
    setDraggedUserId(null);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    
    // Only highlight if the target can be a valid manager
    const targetUser = filteredUsers.find(u => u.id === targetId);
    if (targetUser && targetUser.role === 'manager') {
      target.classList.add('ring-2', 'ring-indigo-500', 'ring-opacity-50', 'bg-indigo-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50', 'bg-indigo-50');
  };

  const handleDrop = (e: React.DragEvent, newManagerId: string) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50', 'bg-indigo-50');

    if (!draggedUserId) return;

    // Prevent assigning a user to themselves
    if (draggedUserId === newManagerId) return;

    // Get the dragged user
    const draggedUser = filteredUsers.find(u => u.id === draggedUserId);
    const newManager = filteredUsers.find(u => u.id === newManagerId);

    if (!draggedUser || !newManager) return;

    // Only managers can have direct reports
    if (newManager.role !== 'manager') return;

    // Prevent creating circular references
    const wouldCreateCircle = (userId: string, targetManagerId: string): boolean => {
      let currentId = targetManagerId;
      const visited = new Set<string>();

      while (currentId) {
        if (visited.has(currentId)) return true;
        if (currentId === userId) return true;
        visited.add(currentId);

        const manager = filteredUsers.find(u => u.id === currentId);
        currentId = manager?.manager_id || '';
      }

      return false;
    };

    if (wouldCreateCircle(draggedUserId, newManagerId)) {
      return; // Prevent circular reference
    }

    setPendingChanges(prev => {
      const next = new Map(prev);
      next.set(draggedUserId, newManagerId);
      return next;
    });
  };

  const handleSaveChanges = async () => {
    for (const [userId, managerId] of pendingChanges.entries()) {
      await onManagerChange(userId, managerId);
    }
    setPendingChanges(new Map());
  };

  const renderNode = (node: OrgNode, level = 0) => {
    const { user, reports } = node;
    const canBeManager = user.role === 'manager';

    return (
      <div
        key={user.id}
        className="flex flex-col items-center"
      >
        <div className="relative group">
          <div
            className={`bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-4 min-w-[250px] 
              ${pendingChanges.has(user.id) ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''}
              ${canBeManager ? 'cursor-pointer' : ''}
              transition-all duration-200`}
            draggable={true}
            onDragStart={(e) => handleDragStart(user.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, user.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, user.id)}
          >
            <div className="flex items-center space-x-4">
              <UserCircle className="h-10 w-10 text-gray-400" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {user.full_name || 'No name set'}
                </div>
                <div className="text-sm text-gray-500 truncate">{user.email}</div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full mt-1 inline-block ${roleColors[user.role]}`}>
                  {user.role}
                </div>
                {user.department && (
                  <div className="text-xs text-gray-500 mt-1">
                    {user.department} • {user.job_name}
                  </div>
                )}
              </div>
            </div>
            <div className="absolute top-2 right-2 hidden group-hover:flex space-x-2">
              <button
                onClick={() => onEditClick(user)}
                className="p-1 text-gray-400 hover:text-indigo-600"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDeleteClick(user)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        {reports.length > 0 && (
          <div className="relative pt-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-300"></div>
            <div className="relative flex items-start space-x-12">
              {reports.map((reportNode, index) => (
                <div key={reportNode.user.id} className="relative">
                  <div className="absolute top-0 left-0 right-0 -translate-y-4">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-300"></div>
                    <div className="absolute top-0 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-gray-300"></div>
                  </div>
                  {renderNode(reportNode, level + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const { rootNodes, unassignedNodes } = buildOrgTree();

  if (filteredUsers.length === 0) {
    return <div className="text-center py-8">No users found</div>;
  }

  return (
    <div className="space-y-8">
      {pendingChanges.size > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-indigo-700">
            You have pending changes to the organization structure
          </span>
          <button
            onClick={handleSaveChanges}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow overflow-auto">
        <div className="min-w-max">
          {/* Managers with their reports */}
          <div className="flex flex-col items-center space-y-12">
            {rootNodes.map((node) => renderNode(node))}
          </div>

          {/* Unassigned Users Section */}
          {unassignedNodes.length > 0 && (
            <div className="mt-12 pt-12 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Unassigned Team Members ({unassignedNodes.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unassignedNodes.map((node) => (
                  <div
                    key={node.user.id}
                    draggable
                    onDragStart={(e) => handleDragStart(node.user.id)}
                    onDragEnd={handleDragEnd}
                    className="relative group cursor-move"
                  >
                    <div className={`bg-white p-4 rounded-lg shadow-md border border-gray-200 ${
                      pendingChanges.has(node.user.id) ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''
                    }`}>
                      <div className="flex items-center space-x-4">
                        <UserCircle className="h-10 w-10 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {node.user.full_name || 'No name set'}
                          </div>
                          <div className="text-sm text-gray-500 truncate">{node.user.email}</div>
                          <div className={`text-xs font-medium px-2 py-1 rounded-full mt-1 inline-block ${roleColors[node.user.role]}`}>
                            {node.user.role}
                          </div>
                          {node.user.department && (
                            <div className="text-xs text-gray-500 mt-1">
                              {node.user.department} • {node.user.job_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500 text-center">
        Drag and drop users to assign them to managers • Only managers can have direct reports • Changes won't be applied until you save them
      </div>
    </div>
  );
}