export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET non configurato nelle variabili d\'ambiente di produzione!');
    }
    return 'vetclinic_jwt_super_secret_key_2026_dev';
  }
  return secret;
};
