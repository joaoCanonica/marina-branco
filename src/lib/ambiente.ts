/** Ambiente de build. SITE_ENV decide o que pode renderizar. */
export type SiteEnv = 'production' | 'preview' | 'development';

export function lerAmbiente(env: Record<string, string | undefined> = process.env) {
  const siteEnv = (env['SITE_ENV'] ?? 'development') as SiteEnv;
  if (!['production', 'preview', 'development'].includes(siteEnv))
    throw new Error(`SITE_ENV inválido: "${siteEnv}"`);
  // Deploy de produção na Vercel sem SITE_ENV=production = mídia provisória vazando.
  if (env['VERCEL_ENV'] === 'production' && siteEnv !== 'production')
    throw new Error('VERCEL_ENV=production exige SITE_ENV=production');
  return {
    siteEnv,
    producao: siteEnv === 'production',
    previewProtegido: env['PREVIEW_PROTECAO_CONFIRMADA'] === 'true',
  };
}
