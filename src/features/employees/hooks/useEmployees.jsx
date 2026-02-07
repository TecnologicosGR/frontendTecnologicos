import { useState, useCallback } from 'react';
import { employeesService } from '../services/employees.service';
import { useToast } from '../../../components/ui/toast'; // Assuming we want internal toast handling or just passing errors

export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async (activeOnly = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await employeesService.getAll(activeOnly);
      setEmployees(data);
    } catch (err) {
      setError(err.detail || 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  }, []);

  const createEmployee = async (data) => {
    setLoading(true);
    try {
      await employeesService.create(data);
      await fetchEmployees(); // Refresh list
      return { success: true };
    } catch (err) {
       return { success: false, error: err.detail || 'Error al crear empleado' };
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (id, data) => {
    setLoading(true);
    try {
      await employeesService.update(id, data);
      await fetchEmployees();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.detail || 'Error al actualizar empleado' };
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeStatus = async (id, newStatus) => {
      setLoading(true);
      try {
          await employeesService.toggleStatus(id, newStatus);
          await fetchEmployees();
          return { success: true };
      } catch (err) {
          return { success: false, error: err.detail || 'Error al cambiar estado' };
      } finally {
          setLoading(false);
      }
  };

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    toggleEmployeeStatus
  };
}
