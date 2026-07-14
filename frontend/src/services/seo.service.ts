import { createMetadata } from "@/config/metadata.config";
import { truncateText, stripHtml } from "@/lib/utils";
import { getLfgDetail } from "@/services/lfg.service";
import { getPublicProfile } from "@/services/profile.service";

export const getLfgMetadata = async (id: string | number) => {
  const item = await getLfgDetail(id).catch(() => null);

  if (!item) {
    return createMetadata({
      title: "LFG not found",
      description: "The requested LFG post could not be found.",
      path: `/lfg/${id}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: `${item.gameTitle} LFG by ${item.ownerUsername}`,
    description: truncateText(stripHtml(item.description), 155),
    path: `/lfg/${id}`,
    keywords: [
      item.gameTitle,
      item.ownerUsername,
      item.platformTitle,
      item.gameModeTitle ?? "LFG",
      ...item.selectedItems.map((selectedItem) => selectedItem.title),
    ],
    images: item.statImages.map((image, index) => ({
      url: image,
      alt: `${item.gameTitle} stats ${index + 1}`,
    })),
    type: "article",
  });
};

export const getGamerMetadata = async (username: string) => {
  const gamer = await getPublicProfile(username).catch(() => null);

  if (!gamer) {
    return createMetadata({
      title: "Gamer not found",
      description: "The requested gamer profile could not be found.",
      path: `/gamer/${username}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: `${gamer.displayName} Gamer Profile`,
    description:
      gamer.aboutMe ||
      `${gamer.displayName} is looking for teammates on Player2.`,
    path: `/gamer/${gamer.username}`,
    keywords: [
      gamer.username,
      gamer.displayName,
      gamer.location,
      ...gamer.languages,
      "gamer profile",
    ],
    images: gamer.profileImage
      ? [
          {
            url: gamer.profileImage,
            alt: gamer.displayName,
          },
        ]
      : undefined,
    type: "profile",
  });
};
