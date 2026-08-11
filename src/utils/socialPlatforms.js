// src/utils/socialPlatforms.js
// Plataformas de rede social suportadas pelo sistema de configurações
// (painel: SocialMediaModal.jsx · público: PublicFooter.jsx) — os dois
// lados leem esta mesma lista, pra nunca divergir ícone/rótulo entre
// admin e site.
//
// lucide-react (biblioteca de ícones já usada no projeto) não tem nenhum
// ícone de marca — confirmado antes de instalar qualquer coisa nova.
// react-icons/fa6 cobre as 7 plataformas pedidas.

import {
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaLinkedin,
  FaXTwitter,
  FaTiktok,
  FaWhatsapp,
} from 'react-icons/fa6';

export const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', Icon: FaInstagram },
  { id: 'facebook', label: 'Facebook', Icon: FaFacebook },
  { id: 'youtube', label: 'YouTube', Icon: FaYoutube },
  { id: 'linkedin', label: 'LinkedIn', Icon: FaLinkedin },
  { id: 'x', label: 'X (Twitter)', Icon: FaXTwitter },
  { id: 'tiktok', label: 'TikTok', Icon: FaTiktok },
  { id: 'whatsapp', label: 'WhatsApp', Icon: FaWhatsapp },
];

/** @param {string} platformId @returns {{ id: string, label: string, Icon: Function } | null} */
export function getSocialPlatform(platformId) {
  return SOCIAL_PLATFORMS.find((platform) => platform.id === platformId) ?? null;
}
