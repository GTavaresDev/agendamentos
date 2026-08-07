/**
 * A regra vive no domínio (é usada pelo portal do cliente e pela agenda
 * interna). Este módulo continua exportando para não quebrar os imports da UI.
 */
export {
  BOOKING_TOLERANCE_MINUTES,
  isBookingTimeExpired,
} from "@core/domain/appointments/booking-time.business-rule";
