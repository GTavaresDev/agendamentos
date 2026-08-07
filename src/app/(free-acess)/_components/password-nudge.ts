/**
 * Dispensa do convite "Criar uma senha".
 *
 * Fica num cookie, não em sessionStorage, porque quem decide renderizar é o
 * servidor: se guardássemos só no navegador, o card viria no HTML e sumiria na
 * hidratação — o piscar que a gente quer evitar. Com cookie, dispensado é
 * dispensado: o componente nem chega a ser montado.
 *
 * É cookie de sessão (sem expiração): morre ao fechar o navegador, é apagado
 * no logout e na tela de login. Ou seja, a dispensa vale enquanto a pessoa
 * estiver logada, e o convite volta no próximo login sem senha.
 */
export const PASSWORD_NUDGE_COOKIE = "portal.senha-dispensada";

/** Só no cliente: marca a dispensa para as próximas renderizações. */
export function dismissPasswordNudge(): void {
  document.cookie = `${PASSWORD_NUDGE_COOKIE}=1; path=/; SameSite=Lax`;
}

/** Só no cliente: chamado na tela de login, para o próximo login vir limpo. */
export function resetPasswordNudge(): void {
  document.cookie = `${PASSWORD_NUDGE_COOKIE}=; path=/; SameSite=Lax; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
