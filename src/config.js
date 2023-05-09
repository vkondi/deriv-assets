/**
 *
 *  Used to set configuration settings for the application
 */

export default {
  // Configuration
  DERIV_APP_ID: 1089, // 36480
  DEBUG_MODE: true, // Debug mode will extract only a limited number of active symbols hence users may not see all possible categories

  // Debug mode specific configuration
  DEBUG_MAX_ACTIVE_SYMBOLS: 10,
  DEBUG_TICKS_SUBSCRIPTION_TIMER: 3000,

  //   Global objects
  derivAPI: null,
};
