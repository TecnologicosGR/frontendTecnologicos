import { useState, useCallback } from 'react';
import { auditService } from '../services/audit.service';
import { useToast } from '../../../components/ui/toast';

export const useAudit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLogs = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const data = await auditService.getLogs(filters);
      setLogs(data);
      return data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudieron cargar los registros de auditoría',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    logs,
    loading,
    fetchLogs
  };
};
