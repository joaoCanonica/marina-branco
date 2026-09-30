/**
 * Script inline no <head> (antes da 1ª pintura): decide se a entrada roda.
 * Só na home, uma vez por sessão, nunca com movimento reduzido. Rede de
 * segurança: 5 s depois a classe sai de qualquer jeito.
 */
export const CHAVE_INTRO = 'mb-intro-vista';
export const introBoot = `(function(){var d=document.documentElement;try{if(location.pathname==='/'&&!sessionStorage.getItem('${CHAVE_INTRO}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){sessionStorage.setItem('${CHAVE_INTRO}','1');d.classList.add('intro');setTimeout(function(){d.classList.remove('intro','intro-saindo')},5000)}}catch(e){d.classList.remove('intro')}})();`;
