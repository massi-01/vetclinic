/**
 * Utility per la validazione e valutazione della sicurezza delle password.
 * Requisiti minimi di sicurezza per la registrazione:
 * - Lunghezza minima di 8 caratteri
 * - Almeno una lettera maiuscola (A-Z)
 * - Almeno una lettera minuscola (a-z)
 * - Almeno un numero (0-9)
 * - Almeno un carattere speciale (es. !@#$%^&*()_+-=[]{};':"|,.<>/?~`)
 */

export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  SPECIAL_CHARS_REGEX: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/
};

export const checkPasswordCriteria = (password) => {
  const pwd = typeof password === 'string' ? password : '';
  return {
    minLength: pwd.length >= PASSWORD_RULES.MIN_LENGTH,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: PASSWORD_RULES.SPECIAL_CHARS_REGEX.test(pwd)
  };
};

export const validatePasswordSecurity = (password) => {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      errors: ['La password è obbligatoria'],
      checks: checkPasswordCriteria('')
    };
  }

  const checks = checkPasswordCriteria(password);

  if (!checks.minLength) {
    errors.push(`La password deve contenere almeno ${PASSWORD_RULES.MIN_LENGTH} caratteri`);
  }
  if (!checks.hasUppercase) {
    errors.push('La password deve contenere almeno una lettera maiuscola (A-Z)');
  }
  if (!checks.hasLowercase) {
    errors.push('La password deve contenere almeno una lettera minuscola (a-z)');
  }
  if (!checks.hasNumber) {
    errors.push('La password deve contenere almeno un numero (0-9)');
  }
  if (!checks.hasSpecial) {
    errors.push('La password deve contenere almeno un carattere speciale (!@#$%^&*...)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    checks
  };
};
