
export const Skills = ["arcana", "athletics", "deception", "diplomacy", "history", "insight",
                       "intimidation", "investigation", "nature", "perception", "religion",
                       "slight_of_hand", "stealth", "survival"] as const;
export type Skill = (typeof Skills)[number];

export const Abilities = ["agility", "might", "charisma", "intelligence"] as const;
export type Ability = (typeof Abilities)[number];
