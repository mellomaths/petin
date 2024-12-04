import { Pet } from "../pet/Pet";
import { Profile } from "./Profile";

export type ProfileExpanded = {
  profile: Profile;
  pets: Pet[];
};
