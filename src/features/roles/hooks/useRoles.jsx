import { useState, useCallback } from 'react';
import { rolesService } from '../services/roles.service';

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rolesService.getAll();
      setRoles(data);
    } catch (err) {
      setError(err.detail || 'Error al cargar roles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
      try {
          const data = await rolesService.getAllPermissions();
          setPermissions(data);
      } catch (err) {
          console.error("Failed to load system permissions", err);
      }
  }, []);

  const getRoleDetails = async (id) => {
      setLoading(true);
      try {
          const data = await rolesService.getById(id);
          return data;
      } catch (err) {
          setError(err.detail || 'Error al cargar detalles');
          return null;
      } finally {
          setLoading(false);
      }
  };

  const createRole = async (data) => {
    setLoading(true);
    try {
      const newRole = await rolesService.create(data);
      await fetchRoles(); 
      return { success: true, data: newRole };
    } catch (err) {
       return { success: false, error: err.detail || 'Error al crear rol' };
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, data) => {
    setLoading(true);
    try {
      await rolesService.update(id, data);
      await fetchRoles();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.detail || 'Error al actualizar rol' };
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id) => {
      setLoading(true);
      try {
          await rolesService.delete(id);
          setRoles(prev => prev.filter(r => r.id !== id));
          return { success: true };
      } catch (err) {
          return { success: false, error: err.detail || err.message || 'Error al eliminar rol' };
      } finally {
          setLoading(false);
      }
  }

  // Permission Management
  const assignPermission = async (roleId, permissionId) => {
      try {
          await rolesService.addPermission(roleId, permissionId);
          return { success: true };
      } catch (err) {
          return { success: false, error: err.detail || 'Error al asignar permiso' };
      }
  };

  const revokePermission = async (roleId, permissionId) => {
      try {
          await rolesService.removePermission(roleId, permissionId);
          return { success: true };
      } catch (err) {
          return { success: false, error: err.detail || 'Error al revocar permiso' };
      }
  };

  return {
    roles,
    permissions,
    loading,
    error,
    fetchRoles,
    fetchPermissions,
    getRoleDetails,
    createRole,
    updateRole,
    deleteRole,
    assignPermission,
    revokePermission
  };
}
