// src/components/ui/AvatarInitials.jsx
// Avatar de pessoa: a foto quando existe, as iniciais coloridas quando não.
//
// Vive em components/ui (e não em components/public) porque os dois lados do
// app usam: o painel com .sda-avatar e o site público com .sdp-avatar. Por
// isso a classe vem de fora — o componente não sabe em qual camada está, e
// assim nenhuma classe sdp-* vaza para o painel nem vice-versa.
//
// A cor das iniciais sai de avatarColorIndex(id), então é sempre a mesma
// pessoa com a mesma cor nos dois lados.

import { getInitials, avatarColorIndex } from '../../utils/initials.js';
import { AVATAR_COLORS } from '../../utils/constants.js';

/**
 * @param {{
 *   name: string,
 *   photoUrl?: string,
 *   id?: string,
 *   className: string,
 * }} props
 */
export default function AvatarInitials({ name, photoUrl, id, className }) {
  if (photoUrl) {
    // alt vazio: o nome já aparece como texto ao lado em todos os usos, e
    // repeti-lo faria o leitor de tela anunciar a mesma pessoa duas vezes.
    return <img className={className} src={photoUrl} alt="" />;
  }

  const color = AVATAR_COLORS[avatarColorIndex(id || name || '', AVATAR_COLORS.length)];

  return (
    <span className={className} style={{ backgroundColor: color }} aria-hidden="true">
      {getInitials(name)}
    </span>
  );
}
