import { useState, useCallback } from 'react';
import { technicalService } from '../services/technical.service';

export function useTechnicalServices() {
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async (params) => {
    setLoading(true);
    try {
      const data = await technicalService.getAll(params);
      setTickets(data);
      setError(null);
    } catch (err) {
      setError(err.detail);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTicketById = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await technicalService.getById(id);
      setCurrentTicket(data);
      setError(null);
      return { success: true, data: data };
    } catch (err) {
      console.error(err);
      let msg = err.response?.data?.detail || 'Error al obtener ticket';
      if (typeof msg === 'object') {
          msg = JSON.stringify(msg);
      }
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTicketByToken = useCallback(async (token) => {
    setLoading(true);
    try {
      console.log("Fetching ticket by token:", token);
      const [ticketData, logsData] = await Promise.all([
        technicalService.getTrackingPublic(token),
        technicalService.getTrackingLogs(token)
      ]);
      
      console.log("Ticket data received:", ticketData);
      console.log("Logs data received:", logsData);
      
      setCurrentTicket(ticketData);
      // We could add a separate state for logs if needed, but for now we might need to expose it
      // Let's assume we add a state for it or attach it to currentTicket
      ticketData.logs = logsData; 
      setCurrentTicket(ticketData); 
      
      setError(null);
      return { success: true, data: ticketData };
    } catch (err) {
      console.error("Error fetching ticket by token:", err);
      let msg = err.response?.data?.detail || 'Error al obtener ticket';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = async (data) => {
    setLoading(true);
    try {
      const result = await technicalService.create(data);
      await fetchTickets();
      return { success: true, data: result };
    } catch (err) {
      console.error(err);
      let msg = err.response?.data?.detail || 'Error al crear ticket';
      if (typeof msg === 'object') {
          msg = JSON.stringify(msg);
      }
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (id, status, note) => {
    setLoading(true);
    try {
      const result = await technicalService.updateStatus(id, { status, note });
      // Update local state
      setTickets(prev => prev.map(t => t.id === id ? { ...t, estado_actual: status } : t));
      if (currentTicket && currentTicket.id === id) {
          setCurrentTicket(prev => ({ ...prev, estado_actual: status }));
      }
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.detail };
    } finally {
      setLoading(false);
    }
  };

  const addAppliedService = async (data) => {
    setLoading(true);
      try {
          const result = await technicalService.addAppliedService(data);
          return { success: true, data: result };
      } catch (err) {
          return { success: false, error: err.detail };
      } finally {
        setLoading(false);
      }
  };

  const updateTicket = async (id, data) => {
    setLoading(true);
      try {
          const result = await technicalService.updateTicket(id, data);
          setCurrentTicket(result);
          return { success: true, data: result };
      } catch (err) {
          return { success: false, error: err.detail };
      } finally {
        setLoading(false);
      }
  };

  const uploadEvidence = async (id, files) => {
    setLoading(true);
    try {
        const result = await technicalService.uploadEvidence(id, files);
        return { success: true, data: result };
    } catch (err) {
        return { success: false, error: err.detail };
    } finally {
        setLoading(false);
    }
  };

  return {
    tickets,
    currentTicket,
    loading,
    error,
    fetchTickets,
    fetchTicketById,
    fetchTicketByToken,
    createTicket,
    updateTicketStatus,
    addAppliedService,
    updateTicket,
    uploadEvidence
  };
}
