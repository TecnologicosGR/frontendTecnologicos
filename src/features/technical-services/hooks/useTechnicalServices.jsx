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
      return { success: true, data };
    } catch (err) {
      setError(err.detail);
      return { success: false, error: err.detail };
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
      return { success: false, error: err.detail };
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (id, data) => {
      setLoading(true);
      try {
          const result = await technicalService.updateStatus(id, data);
          // Update local state if current ticket
          if (currentTicket && currentTicket.id === id) {
             // Ideally we refetch to get full log msg
             await fetchTicketById(id);
          }
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
    createTicket,
    updateTicketStatus
  };
}
