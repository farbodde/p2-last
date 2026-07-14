import {
  BookmarkIcon,
  HomeIcon,
  LogoIcon,
  MessageIcon,
  ProfileCircleIcon,
} from "@/components/common/icons";
import TabItem from "./TabItem";

const MainTab = () => {
  return (
    <section className="sticky z-20 bottom-0 left-0 w-full h-14 backdrop-blur-[2px] bg-tab/90 flex">
      <div className="flex items-center justify-around w-full h-full">
        <TabItem href="/" icon={<HomeIcon />} />
        <TabItem href="/bookmarks" icon={<BookmarkIcon />} />
        <TabItem href="/landing" icon={<LogoIcon className="w-9 h-9" />} />
        <TabItem href="/chat" icon={<MessageIcon />} />
        <TabItem href="/profile" icon={<ProfileCircleIcon />} />
      </div>
    </section>
  );
};

export default MainTab;
