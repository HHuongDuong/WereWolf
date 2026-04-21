import { Role } from "@/shared/types/game";

export const roleCardFrontImageByRole: Record<Role, string> = {
  [Role.VILLAGER]: "/images/cards/villager_card_img.webp",
  [Role.WEREWOLF]: "/images/cards/werewolf_card_img.webp",
  [Role.SEER]: "/images/cards/seer_card_img.webp",
  [Role.WITCH]: "/images/cards/witch_card_img.webp",
  [Role.GUARD]: "/images/cards/guard_card_img.webp",
  [Role.HUNTER]: "/images/cards/hunter_card_img.webp",
};

export const backCardImage = "/images/cards/back_card_img.webp";
