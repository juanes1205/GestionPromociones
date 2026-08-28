import { describe, it, expect } from 'vitest';
import { formatDate, isPromotionActiveToday } from './date';

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('debería formatear correctamente una fecha válida a dd/mm/yyyy', () => {
      expect(formatDate('2026-08-27T00:00:00-05:00')).toBe('27/08/2026');
    });

    it('debería retornar "-" para fechas nulas o inválidas', () => {
      expect(formatDate('')).toBe('-');
      expect(formatDate('invalid-date')).toBe('-');
    });
  });

  describe('isPromotionActiveToday', () => {
    it('debería retornar true si la fecha actual está dentro del rango', () => {
      const today = new Date();
      
      const start = new Date(today);
      start.setDate(today.getDate() - 1);
      
      const end = new Date(today);
      end.setDate(today.getDate() + 1);

      expect(isPromotionActiveToday(start, end)).toBe(true);
    });

    it('debería retornar false si hoy no está dentro del rango', () => {
      const today = new Date();
      
      const start = new Date(today);
      start.setDate(today.getDate() - 5);
      
      const end = new Date(today);
      end.setDate(today.getDate() - 2);

      expect(isPromotionActiveToday(start, end)).toBe(false);
    });
  });
});
